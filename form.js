const scriptURL = "https://script.google.com/macros/s/AKfycbzjEVVyPZ3Atwvz8CiT4sEC97Np4TP8frZvokUltDC8AZBOYmiRdr90G1jySEBtk00UDg/exec";

document.getElementById("contactForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  let formData = new FormData();
  formData.append("origin", location.origin);
  formData.append("name", e.target.name.value);
  formData.append("email", e.target.email.value);
  formData.append("phone", e.target.phone.value);
  formData.append("service", e.target.service.value);
  formData.append("channels", e.target.channels.value); // NEW
  formData.append("purpose", e.target.purpose.value);   // NEW
  formData.append("message", e.target.message.value);

  try {
    const res = await fetch(scriptURL, {
      method: "POST",
      body: formData
    });

    let text = await res.text();

    if (res.ok && text.includes("success")) {
      document.getElementById("response").innerText = "Form submitted successfully!";
      e.target.reset();
    } else {
      document.getElementById("response").innerText = "Server responded but failed.";
    }

  } catch (err) {
    document.getElementById("response").innerText = "Error submitting the form.";
  }
});

  const overlay = document.getElementById("contactOverlay"); // your overlay div
  const closeBtn = document.getElementById("closeOverlay");   // the × div
  // Close overlay on × click
  if (closeBtn && overlay) {
    closeBtn.addEventListener("click", () => {
      overlay.classList.remove("show");   // hide overlay
      document.body.style.overflow = ""; // restore scroll if it was disabled
    });
  }
});

