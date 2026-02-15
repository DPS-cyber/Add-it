document.addEventListener("DOMContentLoaded", () => {
  const scriptURL = "https://script.google.com/macros/s/AKfycbwOBmOP10BrcDTooXzHQO9jgAdWYBXquocmfjh6O6NHW1SBWd-fiwNP4UMIUJtCXj4rRg/exec";
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

        // Use no-cors mode to ensure the request is sent even if CORS fails
        // Note: Response is opaque, so we can't check status or text
        const response = await fetch(scriptURL, {
          method: "POST",
          body: formData,
          mode: "no-cors"
        });

        console.log("Request presumably sent (no-cors mode)");

        // Optimistic success
        if (formResp) formResp.textContent = "Message sent!";
        form.reset();

      } catch (error) {
        console.error("REAL ERROR:", error);
        if (formResp) formResp.textContent = "Error sending message.";
      }

      if (btn) {
        btn.disabled = false;
        btn.textContent = "Submit";
      }
    });
  }
});

