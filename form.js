document.addEventListener("DOMContentLoaded", () => {
  const scriptURL = "https://script.google.com/macros/s/AKfycbwOBmOP10BrcDTooXzHQO9jgAdWYBXquocmfjh6O6NHW1SBWd-fiwNP4UMIUJtCXj4rRg/exec";
  const form = document.getElementById("contactForm");
  const formResp = document.getElementById("formResp");
  const overlay = document.getElementById("contactOverlay"); // your overlay div
  const closeBtn = document.getElementById("closeOverlay");   // the × div

  // Form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const btn = form.querySelector("button");
    btn.disabled = true;
    btn.textContent = "Processing...";

    try {
      const formData = new FormData(form);

      const response = await fetch(scriptURL, {
        method: "POST",
        body: formData
      });

      const text = await response.text();
      console.log("Server response:", text);

      if (text.includes("success")) {
        formResp.textContent = "Success.";
        form.reset();
      } else {
        formResp.textContent = "Server responded but not success.";
      }

    } catch (error) {
      console.error("REAL ERROR:", error);
      formResp.textContent = "Network failure.";
    }

    btn.disabled = false;
    btn.textContent = "Submit";
  });

  // Close overlay on × click
  if (closeBtn && overlay) {
    closeBtn.addEventListener("click", () => {
      overlay.classList.remove("show");   // hide overlay
      document.body.style.overflow = ""; // restore scroll if it was disabled
    });
  }
});
