/**
 * @file form-validation.js
 * @summary Initializes client-side validation for forms marked with [data-form-validate].
 * @description For each form container, sets up live validation on inputs, textareas, selects,
 * and radio/checkbox groups. Manages filled, success, and error class states per field group.
 * Validates on input, change, and blur events, with full validation triggered on submit click
 * or Enter key. Includes a basic spam guard that rejects submissions made within 5 seconds
 * of page load.
 */

/**
 * Finds all [data-form-validate] elements within the given scope and attaches
 * validation logic to each form's fields and submit trigger.
 *
 * @param {Document|HTMLElement} [scope=document] - The DOM element within which to search.
 */

export function initFormValidation(scope = document) {
  const elements = scope.querySelectorAll("[data-form-validate]");
  if (!elements.length) return;

  elements.forEach((element) => {
    const startTime = new Date().getTime();

    const form = element.querySelector("form");
    if (!form) return;

    const validateFields = form.querySelectorAll("[data-validate]");
    const dataSubmit = form.querySelector("[data-submit]");
    if (!dataSubmit) return;

    const realSubmitInput = dataSubmit.querySelector('input[type="submit"]');
    if (!realSubmitInput) return;

    /* ---------------------------------- */
    /* Spam guard                         */
    /* ---------------------------------- */

    // Reject submissions made within 5 seconds of page load
    function isSpam() {
      return new Date().getTime() - startTime < 5000;
    }

    /* ---------------------------------- */
    /* Setup                              */
    /* ---------------------------------- */

    // Disable placeholder/invalid select options on page load
    validateFields.forEach((fieldGroup) => {
      const select = fieldGroup.querySelector("select");
      if (!select) return;

      select.querySelectorAll("option").forEach((option) => {
        if (["", "disabled", "null", "false"].includes(option.value)) {
          option.setAttribute("disabled", "disabled");
        }
      });
    });

    /* ---------------------------------- */
    /* Validation logic                   */
    /* ---------------------------------- */

    function isValid(fieldGroup) {
      const radioCheckGroup = fieldGroup.querySelector("[data-radiocheck-group]");

      if (radioCheckGroup) {
        const inputs = radioCheckGroup.querySelectorAll('input[type="radio"], input[type="checkbox"]');
        const checkedCount = radioCheckGroup.querySelectorAll("input:checked").length;
        const min = parseInt(radioCheckGroup.getAttribute("min")) || 1;
        const max = parseInt(radioCheckGroup.getAttribute("max")) || inputs.length;

        // Radio: at least one selection required
        if (inputs[0].type === "radio") return checkedCount >= 1;

        // Single checkbox: must be checked
        if (inputs.length === 1) return inputs[0].checked;

        // Multiple checkboxes: checked count must be within min/max bounds
        return checkedCount >= min && checkedCount <= max;
      }

      const input = fieldGroup.querySelector("input, textarea, select");
      if (!input) return false;

      const value = input.value.trim();
      const length = value.length;
      const min = parseInt(input.getAttribute("min")) || 0;
      const max = parseInt(input.getAttribute("max")) || Infinity;

      // Select: reject placeholder values
      if (input.tagName.toLowerCase() === "select") {
        return !["", "disabled", "null", "false"].includes(value);
      }

      // Email: validate against basic pattern
      if (input.type === "email") {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      }

      // Text/textarea: validate against min/max length attributes
      if (input.hasAttribute("min") && length < min) return false;
      if (input.hasAttribute("max") && length > max) return false;
      return true;
    }

    /* ---------------------------------- */
    /* DOM state                          */
    /* ---------------------------------- */

    function updateFieldStatus(fieldGroup) {
      const radioCheckGroup = fieldGroup.querySelector("[data-radiocheck-group]");

      if (radioCheckGroup) {
        const inputs = radioCheckGroup.querySelectorAll('input[type="radio"], input[type="checkbox"]');
        const checkedCount = radioCheckGroup.querySelectorAll("input:checked").length;
        const valid = isValid(fieldGroup);
        const anyStarted = Array.from(inputs).some((i) => i.__validationStarted);

        // Reflect filled state
        fieldGroup.classList.toggle("is--filled", checkedCount > 0);

        // Apply success or error class
        if (valid) {
          fieldGroup.classList.add("is--success");
          fieldGroup.classList.remove("is--error");
        } else {
          fieldGroup.classList.remove("is--success");
          fieldGroup.classList.toggle("is--error", anyStarted);
        }

        return;
      }

      const input = fieldGroup.querySelector("input, textarea, select");
      if (!input) return;

      const value = input.value.trim();
      const valid = isValid(fieldGroup);

      // Reflect filled state
      fieldGroup.classList.toggle("is--filled", !!value);

      // Apply success or error class
      if (valid) {
        fieldGroup.classList.add("is--success");
        fieldGroup.classList.remove("is--error");
      } else {
        fieldGroup.classList.remove("is--success");
        fieldGroup.classList.toggle("is--error", !!input.__validationStarted);
      }
    }

    /* ---------------------------------- */
    /* Full-form validation               */
    /* ---------------------------------- */

    // Validate all fields at once, enable live validation, and focus the first invalid field
    function validateAndStartLiveValidationForAll() {
      let allValid = true;
      let firstInvalidField = null;

      validateFields.forEach((fieldGroup) => {
        const input = fieldGroup.querySelector("input, textarea, select");
        const radioCheckGroup = fieldGroup.querySelector("[data-radiocheck-group]");
        if (!input && !radioCheckGroup) return;

        // Mark all fields as validation-started
        if (input) input.__validationStarted = true;
        if (radioCheckGroup) {
          radioCheckGroup.__validationStarted = true;
          radioCheckGroup.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach((i) => {
            i.__validationStarted = true;
          });
        }

        updateFieldStatus(fieldGroup);

        if (!isValid(fieldGroup)) {
          allValid = false;
          if (!firstInvalidField) {
            firstInvalidField = input || radioCheckGroup.querySelector("input");
          }
        }
      });

      if (!allValid && firstInvalidField) firstInvalidField.focus();

      return allValid;
    }

    /* ---------------------------------- */
    /* Events — per field                 */
    /* ---------------------------------- */

    validateFields.forEach((fieldGroup) => {
      const input = fieldGroup.querySelector("input, textarea, select");
      const radioCheckGroup = fieldGroup.querySelector("[data-radiocheck-group]");

      if (radioCheckGroup) {
        const inputs = radioCheckGroup.querySelectorAll('input[type="radio"], input[type="checkbox"]');

        inputs.forEach((i) => {
          i.__validationStarted = false;

          i.addEventListener("change", () => {
            requestAnimationFrame(() => {
              // Start live validation once the minimum selection threshold is reached
              if (!i.__validationStarted) {
                const checkedCount = radioCheckGroup.querySelectorAll("input:checked").length;
                const min = parseInt(radioCheckGroup.getAttribute("min")) || 1;
                if (checkedCount >= min) i.__validationStarted = true;
              }

              if (i.__validationStarted) updateFieldStatus(fieldGroup);
            });
          });

          // Always validate on blur
          i.addEventListener("blur", () => {
            i.__validationStarted = true;
            updateFieldStatus(fieldGroup);
          });
        });

        return;
      }

      if (!input) return;

      input.__validationStarted = false;

      if (input.tagName.toLowerCase() === "select") {
        // Selects start live validation immediately on change
        input.addEventListener("change", () => {
          input.__validationStarted = true;
          updateFieldStatus(fieldGroup);
        });
        return;
      }

      input.addEventListener("input", () => {
        const value = input.value.trim();
        const length = value.length;
        const min = parseInt(input.getAttribute("min")) || 0;
        const max = parseInt(input.getAttribute("max")) || Infinity;

        // Start live validation once the field reaches a valid threshold
        if (!input.__validationStarted) {
          if (input.type === "email") {
            if (isValid(fieldGroup)) input.__validationStarted = true;
          } else {
            if (
              (input.hasAttribute("min") && length >= min) ||
              (input.hasAttribute("max") && length <= max)
            ) {
              input.__validationStarted = true;
            }
          }
        }

        if (input.__validationStarted) updateFieldStatus(fieldGroup);
      });

      // Always validate on blur
      input.addEventListener("blur", () => {
        input.__validationStarted = true;
        updateFieldStatus(fieldGroup);
      });
    });

    /* ---------------------------------- */
    /* Events — submit                    */
    /* ---------------------------------- */

    const handleSubmit = () => {
      if (!validateAndStartLiveValidationForAll()) return;

      if (isSpam()) {
        alert("Form submitted too quickly. Please try again.");
        return;
      }

      realSubmitInput.click();
    };

    // Submit on custom button click
    dataSubmit.addEventListener("click", handleSubmit);

    // Submit on Enter key (except in textareas)
    form.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
        e.preventDefault();
        handleSubmit();
      }
    });
  });
}