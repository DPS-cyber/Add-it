document.addEventListener("DOMContentLoaded", () => {
  const scriptURL = "https://script.google.com/macros/s/AKfycbzKWDmuNvxtkx9IsMMRzkIIUZ3QcnnA6cSlpT2H0QhMvdxOT2-8oqFF1Ey9qREo-eoVJA/exec"; 
  
  const _k = atob("QWRkaXRCcmFuZF9TZWN1cmVfMjAyNA=="); 

  const form = document.getElementById("contactForm");
  const formResp = document.getElementById("formResp");
  const overlay = document.getElementById("contactOverlay");
  const closeBtn = document.getElementById("closeOverlay");

  // Dropdown Handling
  const dropTrig = document.getElementById("dropTrig");
  const dropMenu = document.getElementById("dropMenu");
  const serviceInput = document.getElementById("serviceInputVal");
  const triggerText = dropTrig?.querySelector("span");

  if (dropTrig) {
    dropTrig.addEventListener("click", () => dropMenu.classList.toggle("active"));
  }

  document.querySelectorAll(".option").forEach(option => {
    option.addEventListener("click", () => {
      serviceInput.value = option.getAttribute("data-value");
      if (triggerText) {
        triggerText.textContent = option.textContent;
        triggerText.style.color = "#000";
      }
      dropMenu.classList.remove("active");
    });
  });

  // Form Submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const btn = form.querySelector("button");
    btn.disabled = true;
    btn.textContent = "Processing...";

    const formData = new FormData(form);
    
    // Attach the hidden security key
    formData.append("access_key", _k);

    try {
      await fetch(scriptURL, {
        method: "POST",
        mode: "no-cors", 
        body: formData
      });

      // Show Success
      formResp.textContent = "Success! We'll be in touch.";
      formResp.style.color = "#28a745";
      form.reset();
      if (triggerText) triggerText.textContent = "Select Service";
      
      setTimeout(() => {
        if(overlay) overlay.classList.remove("show");
        document.body.style.overflow = "";
      }, 2500);

    } catch (error) {
      formResp.textContent = "Network error. Please try again.";
      formResp.style.color = "#ff4d4d";
    } finally {
      btn.disabled = false;
      btn.textContent = "Submit";
    }
  });

  // Close Overlay logic
  if (closeBtn && overlay) {
    closeBtn.addEventListener("click", () => {
      overlay.classList.remove("show");
      document.body.style.overflow = "";
    });
  }
});
