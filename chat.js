document.addEventListener("DOMContentLoaded", () => {

  /* ================= 1. SAFE STORAGE ENGINE ================= */
  const safeStorage = (() => {
    try {
      const t = "__t__"; localStorage.setItem(t, t); localStorage.removeItem(t);
      return {
        get: k => localStorage.getItem(k),
        set: (k, v) => localStorage.setItem(k, v),
        remove: k => localStorage.removeItem(k)
      };
    } catch {
      const mem = {};
      return {
        get: k => mem[k] || null,
        set: (k, v) => mem[k] = v,
        remove: k => delete mem[k]
      };
    }
  })();

  /* ================= 2. GLOBAL STATE ================= */
  const CHAT_KEY = "addit_chat_history";
  const WELCOME_KEY = "addit_chat_welcomed";
  let userCountry = safeStorage.get("userCountry") || null;
  let contactStep = null;
  let branchStep = 0;
  let contactData = {};
  let selectedServices = [];
  let hasSequenced = safeStorage.get("addit_sequenced") === "true";

  /* ================= 3. DOM ELEMENTS ================= */
  const cBub = document.getElementById("chatBubble"),
    cWin = document.getElementById("chatWindow"),
    cInp = document.getElementById("msgInput"),
    cSend = document.getElementById("msgSend"),
    cThread = document.getElementById("chatThread"),
    typingInd = document.getElementById("typingIndicator"),
    contactOverlay = document.getElementById("contactOverlay");

  /* ================= 4. GEOLOCATION ================= */
  async function requestGeo() {
    if (userCountry && userCountry !== "all") return;
    try {
      navigator.geolocation.getCurrentPosition(async p => {
        const r = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${p.coords.latitude}&longitude=${p.coords.longitude}&localityLanguage=en`);
        const d = await r.json();
        userCountry = d.countryCode || "IN";
        safeStorage.set("userCountry", userCountry);
      }, () => { userCountry = "IN"; });
    } catch { userCountry = "IN"; }
  }
  requestGeo();

  /* ================= 5. ADVANCED NLP ENGINE ================= */
  function normalizeText(text) {
    return text.toLowerCase().trim().replace(/(.)\1{2,}/g, '$1$1');
  }

  function getSoundCode(s) {
    let a = s.toLowerCase().split(''), f = a.shift(), r = '',
      codes = { a: '', e: '', i: '', o: '', u: '', b: 1, f: 1, p: 1, v: 1, c: 2, g: 2, j: 2, k: 2, q: 2, s: 2, x: 2, z: 2, d: 3, t: 3, l: 4, m: 5, n: 5, r: 6 };
    r = f + a.map(v => codes[v]).filter((v, i, b) => (i === 0 ? v !== codes[f] : v !== b[i - 1])).join('');
    return (r + '000').slice(0, 4).toUpperCase();
  }

  function smartMatch(input, keyword) {
    const cleanInput = normalizeText(input);
    const cleanKeyword = normalizeText(keyword);
    if (cleanInput.includes(cleanKeyword)) return true;
    const inputWords = cleanInput.split(' ');
    const kwCode = getSoundCode(cleanKeyword);
    if (inputWords.some(w => getSoundCode(w) === kwCode)) return true;
    return levenshtein(cleanInput, cleanKeyword) <= Math.floor(cleanKeyword.length * 0.4);
  }

  function levenshtein(a, b) {
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    return dp[m][n];
  }

  /* ================= 6. BRANCHING DATA ================= */
  const BRANCH_DATA = {
    "Individual": [
      { id: "identity", prompt: "Awesome! What's your **niche**? (e.g. Creator, Tech, Fitness)" },
      { id: "goal", prompt: "Got it. Looking to **grow followers** or **sell a product**?" }
    ],
    "Company": [
      { id: "identity", prompt: "Understood. What is the name of your **Company or Industry**?" },
      { id: "goal", prompt: "What is your primary goal? (e.g. **More Leads** or **Brand Awareness**?)" }
    ]
  };

  const WITTY_FALLBACKS = [
    "Interesting. Are we discussing a **Project**, or do you need to see our **Work**?",
    "I'm optimized for high-velocity scaling. Type **'Work'** or **'Hire'** to proceed.",
    "Understood. Let's focus on your expansion. Ask about our **Architecture** or **Pricing**.",
    "System buffering... 🧠 Try asking about **Pricing**, **Work**, or say **'Hire'**!"
  ];

  const PROMO_MESSAGE = `🔥 **Valentine's Creative Acceleration Event — 30% OFF All Services**

From February 14th to February 16th, enjoy **30% off** all Add-it services — including Lead Generation systems, high-performance Ad Creation, and full Creative Acceleration packages.

Built the way designers think. Optimized the way businesses grow.

✨ Scale faster. Convert better. Accelerate smarter.

⏰ This is a **limited-time offer** and expires **February 16th at 11:59 PM**.

Would you like help getting started?`;

  /* ================= 7. BOT BRAIN (Zero-G Core) ================= */
  cBub?.addEventListener("click", () => cWin.classList.toggle("active"));

  const addChat = (text, type) => {
    const d = document.createElement("div");
    d.className = `chat-msg ${type}`;
    d.innerHTML = text.replace(/\n/g, "<br>");
    cThread.insertBefore(d, typingInd);
    cThread.scrollTop = cThread.scrollHeight;
  };

  const showTyping = (ms, cb) => {
    typingInd.classList.add("active");
    cThread.scrollTop = cThread.scrollHeight;
    setTimeout(() => {
      typingInd.classList.remove("active");
      if (cb) cb();
    }, ms);
  };

  const botReply = (msg) => {
    const t = normalizeText(msg);

    // System Reset Command
    if (smartMatch(t, "reset") || smartMatch(t, "restart")) {
      contactStep = null;
      hasSequenced = false;
      safeStorage.remove("addit_sequenced");
      addChat("Chat engine reset. How else can I help? 😊", "bot");
      return;
    }

    if (contactStep !== null) return handleContact(msg);

    // 1. Mandatory Sequential Gatekeeper (Once per user)
    if (!hasSequenced) {
      hasSequenced = true;
      safeStorage.set("addit_sequenced", "true");
      showTyping(1200, () => {
        addChat("Analyzing project compatibility...", "bot");
        setTimeout(() => {
          showTyping(1500, () => {
            const openings = [
              "Market conditions favor immediate action. We only have 2 spots left this month.",
              "System audit complete. Demand is at a peak; we're currently onboarding only 2 new partners.",
              "We're currently at 90% capacity for February. Only 2 architectural slots remain.",
              "Zero-G audit complete. We have space for exactly 2 more high-stakes partnerships this month."
            ];
            const selected = openings[Math.floor(Math.random() * openings.length)];
            addChat(selected, "bot");
            processBotLogic(t, true);
          });
        }, 1000);
      });
      return;
    }

    // 2. Direct Conversational Context
    processBotLogic(t, false);
  };

  const processBotLogic = (t, isInitial) => {
    let followUp = "";

    if (smartMatch(t, "promo") || smartMatch(t, "promotion") || smartMatch(t, "discount") || smartMatch(t, "offer") || smartMatch(t, "deal") || smartMatch(t, "valentine")) {
      followUp = PROMO_MESSAGE;
    } else if (smartMatch(t, "work") || smartMatch(t, "projects") || smartMatch(t, "portfolio")) {
      followUp = "📁 100+ projects delivered. Scroll to **'Market Dominance'** for the visual catalog.";
    } else if (smartMatch(t, "pricing") || smartMatch(t, "cost") || smartMatch(t, "how much")) {
      const p = userCountry === "IN" ? "₹15,000" : "$500";
      followUp = `💰 Our custom architecture typically starts at **${p}** for companies but you cant adjust according to your requirement.\n\n🔥 **SPECIAL OFFER**: Get **30% OFF** all services until Feb 16th! Ask about our **'promo'** for details.`;
    } else if (smartMatch(t, "hire") || smartMatch(t, "start") || smartMatch(t, "contact") || smartMatch(t, "make me an ad") || smartMatch(t, "create ad") || smartMatch(t, "need ad") || smartMatch(t, "make it")) {
      setTimeout(() => startContact(), 600);
      return;
    } else if (smartMatch(t, "hello") || smartMatch(t, "hi") || smartMatch(t, "hey")) {
      followUp = isInitial ? "" : "I'm here. Do you want to see our **Work**, check **Pricing**, or **Initiate Discovery**?";
    } else if (!isInitial) {
      followUp = WITTY_FALLBACKS[Math.floor(Math.random() * WITTY_FALLBACKS.length)];
    }

    if (followUp) {
      setTimeout(() => {
        showTyping(800, () => addChat(followUp, "bot"));
      }, 800);
    }
  };

  /* ================= 8. UNCOMPROMISED CONTACT FLOW ================= */
  function startContact() {
    contactStep = "CHOOSE_TYPE";
    contactData = {};
    branchStep = 0;
    addChat("To tailor our architecture, are you a **Company** or an **Individual**?", "bot");
  }

  function handleContact(input) {
    const v = input.trim();
    const t = normalizeText(v);

    if (contactStep === "CHOOSE_TYPE") {
      contactData.type = (smartMatch(t, "company") || t.includes("business")) ? "Company" : "Individual";
      contactStep = "BRANCHING";
      return addChat(BRANCH_DATA[contactData.type][0].prompt, "bot");
    }

    if (contactStep === "BRANCHING") {
      const branch = BRANCH_DATA[contactData.type];
      contactData[branch[branchStep].id] = v;
      branchStep++;
      if (branchStep < branch.length) return addChat(branch[branchStep].prompt, "bot");
      contactStep = "NAME";
      return addChat("Perfect. What is your **full name**?", "bot");
    }

    if (contactStep === "NAME") {
      contactData.name = v; contactStep = "EMAIL";
      return addChat("What is your **email address**?", "bot");
    }

    if (contactStep === "EMAIL") {
      if (!v.includes("@")) return addChat("Please enter a valid email! 📧", "bot");
      contactData.email = v;
      contactStep = "PHONE";
      return addChat("Got it. What is your **phone number**?", "bot");
    }

    if (contactStep === "PHONE") {
      contactData.phone = v;
      contactStep = "COMPANY_NAME";
      return addChat("What's your **company page or channel name**?", "bot");
    }

    if (contactStep === "COMPANY_NAME") {
      contactData.company_name = v;
      contactStep = "FINAL_MESSAGE";
      return addChat("Almost done! Is there any **specific message or detail** you'd like to add?", "bot");
    }

    if (contactStep === "FINAL_MESSAGE") {
      contactData.finalMsg = v;
      finalizeLead();
    }
  }

  function finalizeLead() {
    contactStep = null;
    const f = document.getElementById("contactForm");
    if (f) {
      const serviceStr = selectedServices.join(", ") || "General Inquiry";
      const summary = `[${contactData.type.toUpperCase()}]\n` +
        `Company/Channel: ${contactData.company_name}\n` +
        `Identity: ${contactData.identity}\n` +
        `Goal: ${contactData.goal}\n` +
        `Note: ${contactData.finalMsg}`;

      if (f.name) f.name.value = contactData.name || "";
      if (f.email) f.email.value = contactData.email || "";
      if (f.phone) f.phone.value = contactData.phone || "";
      if (f.service) f.service.value = serviceStr;
      if (f.channels) f.channels.value = contactData.company_name || "";
      if (f.purpose) f.purpose.value = contactData.goal || "";
      if (f.message) f.message.value = summary;

      addChat("✅ I've prepared your profile! Review the form below and hit **Send Message**.", "bot");
      setTimeout(() => {
        if (contactOverlay) contactOverlay.classList.add("show");
        document.body.style.overflow = "hidden";
        f.scrollIntoView({ behavior: "smooth" });
      }, 1500);
    }
  }

  const doChat = () => {
    const t = cInp.value.trim();
    if (!t) return;
    addChat(t, "user");
    cInp.value = "";
    botReply(t);
  };

  cSend?.addEventListener("click", doChat);
  cInp?.addEventListener("keydown", e => e.key === "Enter" && doChat());
});