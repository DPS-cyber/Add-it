document.addEventListener("DOMContentLoaded", () => {
  const scriptURL = "https://script.google.com/macros/s/AKfycbzjEVVyPZ3Atwvz8CiT4sEC97Np4TP8frZvokUltDC8AZBOYmiRdr90G1jySEBtk00UDg/exec";
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

      let formData = new FormData();
      formData.append("origin", location.origin);
      formData.append("name", e.target.name.value);
      formData.append("email", e.target.email.value);
      formData.append("phone", e.target.phone.value);
      formData.append("service", e.target.service.value);
      formData.append("channels", e.target.channels.value); // Added to match HTML
      formData.append("purpose", e.target.purpose.value);   // Added to match HTML
      formData.append("message", e.target.message.value);

      try {
        const res = await fetch(scriptURL, {
          method: "POST",
          body: formData
        });

        // If the script returns JSON or text, we can try to read it, 
        // but often with Google Apps Script without CORS headers, it might fail to read.
        // The user's snippet tries to read it: let text = await res.text();
        // We will try that, but wrap in try/catch or fallback.

        let text = await res.text();
        console.log("Server response:", text);

        if (formResp) formResp.innerText = "Form submitted successfully!";
        form.reset();

      } catch (err) {
        console.error("Submission Error:", err);
        // Fallback for CORS mode "opaque" or actual network error
        // If it's a CORS error on the fetch itself (failed to fetch), it goes here.
        // If it was a no-cors fetch, we wouldn't get here unless network failed.
        // The user's snippet *didn't* use no-cors, so we try standard fetch.
        if (formResp) formResp.innerText = "Error submitting the form.";
      }

      if (btn) {
        btn.disabled = false;
        btn.textContent = "Submit";
      }
    });
  }
});
