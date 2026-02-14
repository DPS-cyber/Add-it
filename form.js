document.addEventListener("DOMContentLoaded", () => {
  const scriptURL = "https://script.google.com/macros/s/AKfycbwOBmOP10BrcDTooXzHQO9jgAdWYBXquocmfjh6O6NHW1SBWd-fiwNP4UMIUJtCXj4rRg/exec";

  // Overlay Control
  const overlay = document.getElementById("contactOverlay");
  const closeBtn = document.getElementById("closeOverlay");

  document.querySelectorAll('a[href="#contact"], #globalContact').forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      overlay.classList.add("show");
      document.body.style.overflow = "hidden";
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      overlay.classList.remove("show");
      document.body.style.overflow = "";
    });
  }

  // Dropdown System
  const dTrig = document.getElementById("dropTrig");
  const dMenu = document.getElementById("dropMenu");
  const dInp = document.getElementById("serviceInputVal");
  const dSpan = dTrig?.querySelector("span");

  if (dTrig && dMenu) {
    dTrig.addEventListener("click", (e) => {
      e.stopPropagation();
      dMenu.style.display = dMenu.style.display === "block" ? "none" : "block";
    });

    dMenu.querySelectorAll("div").forEach(opt => {
      opt.addEventListener("click", () => {
        const val = opt.dataset.value;
        if (dInp) dInp.value = val;
        if (dSpan) dSpan.textContent = opt.textContent;
        dMenu.style.display = "none";
      });
    });

    document.addEventListener("click", () => {
      dMenu.style.display = "none";
    });
  }

  // Form Submission Engine
  const form = document.getElementById("contactForm");
  const formResp = document.getElementById("formResp");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = form.querySelector("button");

      if (btn) {
        btn.disabled = true;
        btn.textContent = "Processing...";
      }

      try {
        const formData = new FormData(form);
        const response = await fetch(scriptURL, {
          method: "POST",
          body: new URLSearchParams(formData)
        });

        const result = await response.text();

        if (result.includes("success")) {
          if (formResp) formResp.textContent = "Discovery Initiated.";
          form.reset();
          if (dSpan) dSpan.textContent = "Select Service";

          // Auto-close after success
          setTimeout(() => {
            overlay.classList.remove("show");
            document.body.style.overflow = "";
            if (formResp) formResp.textContent = "";
          }, 2000);
        } else {
          if (formResp) formResp.textContent = "System weak. Try DM.";
        }
      } catch (err) {
        console.error("Submission error:", err);
        if (formResp) formResp.textContent = "Network failure.";
      }

      if (btn) {
        btn.disabled = false;
        btn.textContent = "Initiate Discovery";
      }
    });
  }
});
