document.addEventListener("DOMContentLoaded", () => {
  // 1. CONFIGURATION
  const scriptURL = "https://script.google.com/macros/s/AKfycbzKWDmuNvxtkx9IsMMRzkIIUZ3QcnnA6cSlpT2H0QhMvdxOT2-8oqFF1Ey9qREo-eoVJA/exec"; // Replace with your Google /exec URL
  const _k = atob("QWRkaXRCcmFuZF9TZWN1cmVfMjAyNA=="); 

  const form = document.getElementById("contactForm");
  const formResp = document.getElementById("formResp");
  const overlay = document.getElementById("contactOverlay");
  const closeBtn = document.getElementById("closeOverlay");

  // 2. DROPDOWN ELEMENTS
  const dropdownContainer = document.querySelector(".custom-dropdown");
  const dropTrig = document.getElementById("dropTrig");
  const dropMenu = document.getElementById("dropMenu");
  const serviceInput = document.getElementById("serviceInputVal");
  const triggerText = dropTrig?.querySelector("span");

  // --- DROPDOWN LOGIC ---
  if (dropTrig && dropdownContainer) {
    dropTrig.addEventListener("click", (e) => {
      e.stopPropagation();
      // Toggle the 'active' class used in your CSS
      dropdownContainer.classList.toggle("active");
    });

    // Handle Option Selection
    document.querySelectorAll(".option").forEach(option => {
      option.addEventListener("click", function(e) {
        e.stopPropagation();
        const val = this.getAttribute("data-value");
        const text = this.textContent;

        // Update hidden input and UI text
        if (serviceInput) serviceInput.value = val;
        if (triggerText) {
          triggerText.textContent = text;
          triggerText.style.color = "#000"; // Visual feedback
        }
        
        // Close menu
        dropdownContainer.classList.remove("active");
      });
    });

    // Close dropdown if user clicks anywhere else
    window.addEventListener("click", () => {
      dropdownContainer.classList.remove("active");
    });
  }

  // --- FORM SUBMISSION ---
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // UI Feedback: Loading state
      const btn = form.querySelector("button");
      const originalBtnText = btn.textContent;
      btn.disabled = true;
      btn.textContent = "Processing...";

      const formData = new FormData(form);
      
      // Attach the Security Key
      formData.append("access_key", _k);

      try {
        // mode: 'no-cors' is required for Google Apps Script
        await fetch(scriptURL, {
          method: "POST",
          mode: "no-cors", 
          body: formData
        });

        // SUCCESS UI
        formResp.textContent = "Success! We'll be in touch.";
        formResp.style.color = "#28a745";
        form.reset();
        
        // Reset Dropdown UI
        if (triggerText) {
          triggerText.textContent = "Select Service";
          triggerText.style.color = "#757575";
        }

        // Close overlay if applicable
        setTimeout(() => {
          if (overlay) {
            overlay.classList.remove("show");
            document.body.style.overflow = "";
          }
        }, 2500);

      } catch (error) {
        console.error("Submission Error:", error);
        formResp.textContent = "Network error. Please try again.";
        formResp.style.color = "#ff4d4d";
      } finally {
        btn.disabled = false;
        btn.textContent = originalBtnText;
      }
    });
  }

  // --- OVERLAY CLOSE ---
  if (closeBtn && overlay) {
    closeBtn.addEventListener("click", () => {
      overlay.classList.remove("show");
      document.body.style.overflow = "";
    });
  }
});
