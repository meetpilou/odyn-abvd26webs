/**
 * @file google-maps.js
 * @summary Initializes Google Maps instances with address markers and optional clustering.
 * @description For each [data-addresses-init] block, loads the Google Maps and MarkerClusterer
 * scripts on demand, deduplicates CMS address items by name and address string, reads
 * coordinates from data attributes, and places AdvancedMarkerElements on the map. Items
 * without valid lat/lng are skipped (no Geocoding fallback). Clusters are rendered with a
 * custom SVG renderer. The map auto-fits bounds to all placed markers, capped at zoom level 14.
 */

/**
 * Finds all [data-addresses-init] blocks within the given scope, bootstraps the Google Maps
 * and MarkerClusterer scripts, and renders a fully configured map with deduplicated pins
 * for each block.
 *
 * @param {Document|HTMLElement} [scope=document] - The DOM element within which to search.
 */
export function initGoogleMaps(scope = document) {
  const GOOGLE_KEY = "AIzaSyDqQU91Mo6t-X32SkxhsBDafPXeRVnrdd0";
  const MAP_ID = "c343878fa5afd920a9b06eb1";
  const USE_CLUSTERS = true;

  /* ---------------------------------- */
  /* Loaders                            */
  /* ---------------------------------- */

  // Generic script loader — deduplicates concurrent calls via a window-scoped promise
  function loadScriptOnce(globalPromiseKey, src) {
    if (window[globalPromiseKey]) return window[globalPromiseKey];
    window[globalPromiseKey] = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error(`Failed to load: ${src}`));
      document.head.appendChild(s);
    });
    return window[globalPromiseKey];
  }

  // Load the Google Maps JS API via the async callback pattern
  function loadGoogleMaps() {
    if (window.__googleMapsPromise) return window.__googleMapsPromise;
    if (window.google?.maps?.Map) return Promise.resolve();
    window.__googleMapsPromise = new Promise((resolve, reject) => {
      window.__googleMapsReady = resolve;
      const params = new URLSearchParams({
        key: GOOGLE_KEY,
        v: "weekly",
        libraries: "marker",
        loading: "async",
        callback: "__googleMapsReady",
      });
      const s = document.createElement("script");
      s.src = `https://maps.googleapis.com/maps/api/js?${params}`;
      s.async = true;
      s.onerror = () => reject(new Error("Failed to load Google Maps"));
      document.head.appendChild(s);
    });
    return window.__googleMapsPromise;
  }

  function loadMarkerClusterer() {
    if (!USE_CLUSTERS) return Promise.resolve();
    return loadScriptOnce(
      "__markerClustererPromise",
      "https://unpkg.com/@googlemaps/markerclusterer/dist/index.min.js"
    );
  }

  /* ---------------------------------- */
  /* Init per block                     */
  /* ---------------------------------- */

  const elements = scope.querySelectorAll("[data-addresses-init]");
  if (!elements.length) return;

  elements.forEach((element) => {
    const mapEmbedEl = element.querySelector("[data-addresses-embed]");
    if (!mapEmbedEl) return;

    // Parse address data from each item element
    const itemEls = element.querySelectorAll("[data-addresses-item]");

    const addressData = Array.from(itemEls).map((el) => ({
      el,
      name: el.dataset.name || "",
      lat: parseFloat(el.dataset.lat),
      lng: parseFloat(el.dataset.lng),
      address: el.dataset.address || "",
    }));

    // Deduplicate CMS items by name + address string
    const seenItems = new Set();

    const uniqueAddressData = addressData.filter((d) => {
      const key = `${d.name}|${d.address}`;
      if (seenItems.has(key)) return false;
      seenItems.add(key);
      return true;
    });

    /* ---------------------------------- */
    /* Map factory                        */
    /* ---------------------------------- */

    function createMap() {
      mapEmbedEl.style.width = "100%";
      mapEmbedEl.style.minHeight = "400px";

      return new google.maps.Map(mapEmbedEl, {
        center: { lat: 50.6, lng: 4.7 },
        zoom: 8,
        mapId: MAP_ID,
        zoomControl: true,
        zoomControlOptions: {
          position: google.maps.ControlPosition.RIGHT_BOTTOM,
        },
        minZoom: 5,
        maxZoom: 18,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        rotateControl: false,
        tilt: 0,
        scrollwheel: false,
      });
    }

    /* ---------------------------------- */
    /* Cluster renderer                   */
    /* ---------------------------------- */

    // Custom SVG cluster marker — size and color scale with marker count
    function createClusterRenderer() {
      return {
        render({ count, position }) {
          const size = count < 10 ? 36 : count < 50 ? 44 : 52;
          const fontSize = count >= 100 ? 24 : 32;
          const fillColor =
            count < 10 ? "#d1cbc0" : count < 50 ? "#fae3b3" : "#9c4639";
          const textColor = count < 50 ? "#051c30" : "#ffffff";

          const svg = `<svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="45" fill="${fillColor}"/>
            <circle cx="50" cy="50" r="45" fill="none" stroke="white" stroke-width="6"/>
            <text x="50" y="50" dy="0.35em" text-anchor="middle"
              font-size="${fontSize}" font-weight="500" fill="${textColor}"
              font-family="Onest, system-ui, sans-serif">${count}</text>
          </svg>`;

          const div = document.createElement("div");
          div.innerHTML = svg;

          return new google.maps.marker.AdvancedMarkerElement({
            position,
            content: div,
            zIndex: 1000000 + count,
          });
        },
      };
    }

    /* ---------------------------------- */
    /* Place pins                         */
    /* ---------------------------------- */

    async function placePinsOnMap(map) {
      const bounds = new google.maps.LatLngBounds();
      const { AdvancedMarkerElement } =
        await google.maps.importLibrary("marker");
      const markers = [];

      // Track placed positions to avoid duplicate pins within ~1 m tolerance
      const placedPositions = new Set();

      for (const data of uniqueAddressData) {
        // Require explicit, valid lat/lng — skip items without coordinates
        if (!Number.isFinite(data.lat) || !Number.isFinite(data.lng)) {
          console.warn(`Skipped (no coordinates): ${data.name}`);
          continue;
        }

        const position = { lat: data.lat, lng: data.lng };

        // Skip positions already represented on the map
        const posKey = `${position.lat.toFixed(5)},${position.lng.toFixed(5)}`;
        if (placedPositions.has(posKey)) continue;
        placedPositions.add(posKey);

        markers.push(
          new AdvancedMarkerElement({ map, position, title: data.name })
        );
        bounds.extend(position);
      }

      if (!markers.length) return;

      // Set up clustering if enabled
      if (USE_CLUSTERS) {
        new markerClusterer.MarkerClusterer({
          map,
          markers,
          renderer: createClusterRenderer(),
        });
      }

      // Fit map to all markers, then cap zoom to avoid over-zooming on single pins
      map.fitBounds(bounds);
      google.maps.event.addListenerOnce(map, "bounds_changed", () => {
        const z = map.getZoom();
        if (z && z > 14) map.setZoom(14);
      });
    }

    /* ---------------------------------- */
    /* Boot                               */
    /* ---------------------------------- */

    Promise.all([loadGoogleMaps(), loadMarkerClusterer()])
      .then(async () => {
        const map = createMap();
        await placePinsOnMap(map);
      })
      .catch(console.error);
  });
}
