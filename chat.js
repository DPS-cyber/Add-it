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
  let lastTopic = null; // Context tracking
  let hasSequenced = safeStorage.get("addit_sequenced") === "true";
  let selectedServices = [];

  /* ================= 3. DOM ELEMENTS ================= */
  const cBub = document.getElementById("chatBubble"),
    cWin = document.getElementById("chatWindow"),
    cInp = document.getElementById("msgInput"),
    cSend = document.getElementById("msgSend"),
    cThread = document.getElementById("chatThread"),
    typingInd = document.getElementById("typingIndicator"),
    contactOverlay = document.getElementById("contactOverlay");
  /* ================= 4. GEOLOCATION (REMOVED FOR PRIVACY) ================= */

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
      { id: "identity", prompt: "Awesome! What's your **style**? (like a Creator, or Fitness coach, etc.)" },
      { id: "goal", prompt: "Got it. Are you looking to **get more followers** or **sell a product**?" }
    ],
    "Company": [
      { id: "identity", prompt: "Understood. What's the name of your **Company** or what do you do?" },
      { id: "goal", prompt: "What's your main goal? (like **More Leads** or just **Brand Awareness**?)" }
    ]
  };

  const WITTY_FALLBACKS = [
    "Interesting. Are we discussing a **Project**, or do you need to see our **Work**?",
    "I'm optimized for high-velocity scaling. Type **'Work'** or **'Hire'** to proceed.",
    "Understood. Let's focus on your expansion. Ask about our **Architecture** or **Pricing**.",
    "System buffering... 🧠 Try asking about **Pricing**, **Work**, or say **'Hire'**!"
  ];


  /* ================= 7. BOT BRAIN (Zero-G Core) ================= */
  cBub?.addEventListener("click", () => cWin.classList.toggle("active"));

  const addChat = (text, type) => {
    const d = document.createElement("div");
    d.className = `chat-msg ${type}`;

    if (type === "bot") {
      d.innerHTML = ""; // Prepare for streaming
      cThread.insertBefore(d, typingInd);

      const words = text.split(" ");
      let i = 0;
      const stream = setInterval(() => {
        if (i < words.length) {
          d.innerHTML += (i === 0 ? "" : " ") + words[i];
          i++;
          cThread.scrollTop = cThread.scrollHeight;
        } else {
          clearInterval(stream);
        }
      }, 40); // 40ms per word for natural reading speed
    } else {
      d.innerHTML = text.replace(/\n/g, "<br>");
      cThread.insertBefore(d, typingInd);
    }

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

  /* ================= 7. Zero-G AI CORE (v3) ================= */
  const BRAIN_DATA = {
    intents: [
      {
        id: "pricing",
        keywords: ["price", "cost", "how much", "rate", "fee", "pricing", "budget", "expensive", "cheap", "packages", "quote"],
        responses: [
          "It really depends on what you're looking to build and your **budget**. We can start small or go big—whatever fits your needs best. Want to **chat about a plan**?",
          "We're super flexible with pricing! Most of our projects are tailored to what you can invest right now. Do you have a rough budget in mind?",
          "We focus on getting you the best results for your money. We can definitely find a way to make it work for your budget. Want a **quick quote**?"
        ]
      },
      {
        id: "sprints",
        keywords: ["sprint", "content sprint", "video", "reels", "shorts", "ad design", "quick content", "batch", "reels"],
        responses: [
          "Our **Content Sprints** are a game-changer. We make a ton of high-quality reels and ads that really stand out. And we get them to you in just **48 hours!**",
          "Need content fast? We can make 30 days' worth of videos in just 2 days. It's the best way to get noticed quickly. Ready to see how it works?",
          "We help you get seen by more people with our **Sprints**. We make awesome reels and ads that people actually want to watch, and we do it fast."
        ]
      },
      {
        id: "mastery",
        keywords: ["mastery", "social mastery", "management", "360", "handle", "instagram", "linkedin", "organic", "paid", "ads", "growth"],
        responses: [
          "**Social Mastery** is where we take care of everything for you. From coming up with ideas to posting them, we make sure your brand is always active.",
          "Want to grow without the headache? We handle your entire social media presence so you can focus on running your business. Sound good?",
          "Our **Mastery** service is for anyone who wants a great social media presence without doing all the manual work. Shall we **make a plan** for yours?"
        ]
      },
      {
        id: "audit",
        keywords: ["audit", "discovery", "first step", "analyze", "review", "check", "assessment", "examine", "current status"],
        responses: [
          "First, we do a **Quick Review**. we look at what you're doing now and find the easiest ways to help you grow faster.",
          "Our **Review** phase is just us taking a look at your current numbers and content to see exactly where we can help you improve.",
          "Everything starts with a simple **Look-over**. We check out what's working for others and what's not working for you yet."
        ]
      },
      {
        id: "strategy",
        keywords: ["strategy", "mapping", "plan", "blueprint", "architect", "mapping", "vision", "approach"],
        responses: [
          "Next, we **Draw a Map**. We figure out exactly what kind of content and design will work best for your specific brand.",
          "Our **Mapping** phase isn't just a list of ideas; it's a real plan to help you win. We decide exactly what to make and when to post it.",
          "We figure out your **Brand Style** here. It's the plan that makes sure every video and every post has a clear goal."
        ]
      },
      {
        id: "execution",
        keywords: ["execute", "build", "coding", "designing", "delivery", "making", "creating", "production", "high velocity"],
        responses: [
          "Then we **Build it**. Our team makes everything for you—fast. We use our special motion-design techniques to make it look amazing.",
          "**Execution** is where we turn the ideas into real videos and pages. We work at speeds that other agencies just can't keep up with.",
          "We **Make it Happen**. Whether it's a new website or a bunch of reels, this is where we actually build the stuff."
        ]
      },
      {
        id: "scaling",
        keywords: ["scaling", "growth", "launch", "expansion", "market reach", "dominance", "optimize", "sustain"],
        responses: [
          "Finally, we **Launch**. We don't just 'post' and hope for the best—we help you get it in front of the right people so you can grow.",
          "**Growth** is the last part. We make sure everything is working perfectly and help you reach as many people as possible.",
          "Once we **Start**, the real growth begins. we give you the tools and the plan to keep getting more customers over time."
        ]
      },
      {
        id: "philosophy",
        keywords: ["philosophy", "why zero-g", "why add-it", "vision", "mission", "believe", "values", "style", "cinematic"],
        responses: [
          "Our goal is to **'Add-it'**—which just means adding value and moving fast. We think great design and fast growth should go together.",
          "**Zero-G** means getting rid of the 'heavy' stuff that slows you down. No slow sites, no boring ads. Just fast, simple growth.",
          "We believe your site and ads should be as **Beautiful as a Movie**, but also work as hard as a high-performance engine."
        ]
      },
      {
        id: "comparison",
        keywords: ["why you", "different", "compare", "others", "better", "choose", "advantage", "unique", "special"],
        responses: [
          "What makes us different? We use **Motion Design** to make your brand feel alive. Most websites are pretty static, but ours are built to grab attention.",
          "We don't just 'make ads.' We build **Growth Tools**. Our 48-hour delivery means you can start seeing results while others are still planning.",
          "Our secret is **Velocity**. We focus on making things look amazing and work fast, which is something most standard agencies miss."
        ]
      },
      {
        id: "identity",
        keywords: ["who are you", "what are you", "real person", "human", "bot", "ai", "name", "your name"],
        responses: [
          "I'm **Zero-G**, a digital assistant built by the team at Add-it to help you grow your brand. I'm not a real person, but i have all the info you need!",
          "I am the **Zero-G engine**. I'm here to help you figure out the best way to scale your project and get it in front of people.",
          "You can call me **Zero-G**. I'm the digital brain here, optimized to help you find the fastest path to success."
        ]
      },
      {
        id: "location",
        keywords: ["where", "location", "based", "office", "country", "city", "address", "india"],
        responses: [
          "We're a **Global Team**, but our main hub is in **India**. We work with brands from all over the world!",
          "We work **everywhere**. Even though we're mainly based in India, we have clients in the US, Europe, and Asia. Physical location doesn't slow us down.",
          "We're a global agency with a core team in India. We can help you grow no matter where you are."
        ]
      },
      {
        id: "timeline",
        keywords: ["time", "how long", "timeline", "duration", "fast", "urgent", "deadline", "when", "days", "weeks", "delivery"],
        responses: [
          "We move **fast**. Simple content can be ready in **48 hours**, and bigger builds like websites usually take about **2-3 weeks**.",
          "Speed is our specialty. We aim to get your project live and growing as quickly as possible. Want to see a **Timeline** for your idea?",
          "Most projects take between **2 days and 3 weeks** depending on how big they are. We're all about high-speed delivery."
        ]
      },
      {
        id: "smalltalk",
        keywords: ["how are you", "how's it going", "up", "doing well", "good", "fine", "great", "cool", "nice"],
        responses: [
          "I'm doing great! ready to help you build something awesome. How's your day going?",
          "Systems are all green! I'm ready to help you grow. What's on your mind?",
          "Everything is running perfectly. I'm here to help you get your brand noticed. What's the plan for today?"
        ]
      },
      {
        id: "work",
        keywords: ["work", "portfolio", "projects", "show me", "examples", "clients", "done", "portfolio", "catalog", "previous", "experience"],
        responses: [
          "📁 We've done over 100+ projects! You can see our latest work in the **'Selected Works'** section right below.",
          "Our portfolio is in the **'Market Dominance'** section. Want to see how we actually **Build** things first?",
          "Check out our **Selected Works** section for some of our designs. They're built to look great and work even better!"
        ]
      },
      {
        id: "roi",
        keywords: ["results", "roi", "growth", "performance", "improve", "benefit", "why", "value", "increase", "metrics", "proof"],
        responses: [
          "Our partners usually see a **40-60% boost** in their reach in the first month. We're all about getting you results!",
          "We don't just build things; we help you grow. Most of our clients see a big jump in sales after we launch. Ready to start?",
          "Everything we build is designed to make you money. You can expect a **significant boost** in your brand's performance."
        ]
      },
      {
        id: "thanks",
        keywords: ["thanks", "thank you", "ty", "okay", "ok", "got it", "perfect", "amazing", "wow"],
        responses: [
          "You're very welcome! Let's keep going. Want to **Start a Project** now?",
          "Anytime! I'm here to help you win. What should we do next?",
          "Perfect. If you're ready to grow, just say **'Hire'** and we'll get started!"
        ]
      },
      {
        id: "help",
        keywords: ["help", "huh", "what", "confused", "options", "guide", "talk", "say", "do", "support", "what can you do"],
        responses: [
          "I'm here to help you grow! You can ask about **Pricing**, **Sprints**, or see our **Work**. What do you want to know first?",
          "Need a hand? I can help with: **Costs**, **Timelines**, **Portfolio**, or our **Process**. What's your top priority?",
          "I'm Zero-G, built to help you grow. Try asking: **'How much?'**, **'How long?'**, or **'Show me your work'**."
        ]
      },
      {
        id: "ad_request",
        keywords: ["ad", "advertisement", "creative", "commercial", "reels ad", "make an ad", "create content", "video ad", "social ads"],
        responses: [
          "Awesome choice! Our ad campaigns focus on getting you seen by the right people. Let's **start a discovery** to map it out.",
          "I love making ads! We build content that actually converts. Ready to **dive into the details**?",
          "Ad creator mode: Activated. 🚀 I'll help you build reached-focused content. Shall we **get started**?"
        ]
      }
    ],
    greeting: [
      "Hi! I'm Zero-G. Ready to talk about **Pricing**, **Growth**, or see some of our **Work**?",
      "Hey! Shall we talk about your **Timeline**, **Scaling**, or just **Discovery**?",
      "I'm here to help! What can I do to help you grow your brand today?"
    ],
    fallbacks: [
      "That's interesting! Should we talk about a **Project**, or do you want to see our **Results**?",
      "I'm optimized for helping you grow. Type **'Work'** or **'Hire'** to see what we can do.",
      "Just thinking... 🧠 Try asking about our **Process**, **Pricing**, or just say **'Start'**!",
      "Let's focus on your growth. Ask about our **Timeline** or **Social Mastery**."
    ]
  };

  const calculateMatch = (input, keywords) => {
    let score = 0;
    const words = normalizeText(input).split(/\s+/);
    keywords.forEach(kw => {
      if (input.includes(kw)) score += 2;
      words.forEach(word => {
        if (smartMatch(word, kw)) score += 1;
      });
    });
    return score;
  };

  const getResponse = (intentId) => {
    const intent = BRAIN_DATA.intents.find(i => i.id === intentId);
    return intent.responses[Math.floor(Math.random() * intent.responses.length)];
  };

  const trackChat = (userMsg, botMsg) => {
    // FREE TRACKING: Hook this to a Google Apps Script
    const TRACKER_URL = "https://script.google.com/macros/s/AKfycbyL0yqCG5dLcpFDOCw7L81Vy2ds4qKbGR0rvsGIXtXCb6xHfkNdwDQfcWiebwrxjyz_-w/exec"; // User will paste their Apps Script URL here
    if (!TRACKER_URL) return;
    try {
      fetch(TRACKER_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({ user: userMsg, bot: botMsg, timestamp: new Date().toISOString() })
      });
    } catch (e) { }
  };

  const botReply = (msg) => {
    const t = normalizeText(msg);

    // 1. System Reset
    if (smartMatch(t, "reset") || smartMatch(t, "restart")) {
      contactStep = null; hasSequenced = false; lastTopic = null;
      safeStorage.remove("addit_sequenced");
      addChat("System recalibrated. How can I assist? 🚀", "bot");
      return;
    }

    if (contactStep !== null) return handleContact(msg);

    // 2. Initial Gatekeeper
    if (!hasSequenced) {
      hasSequenced = true;
      safeStorage.set("addit_sequenced", "true");
      showTyping(1200, () => {
        addChat("Hey! Zero-G here. I'm just getting the system ready for you...", "bot");
        setTimeout(() => {
          showTyping(1500, () => {
            const openings = [
              "I've been looking at the latest growth trends, and it's a great time to scale your brand. Ready to dive in?",
              "Custom architecture is my specialty. I'm ready to help you build something that actually converts. What are we working on?",
              "I'm feeling optimized and ready to collaborate! Let's talk about your project and see how much velocity we can add."
            ];
            const sel = openings[Math.floor(Math.random() * openings.length)];
            addChat(sel, "bot");
            processBotLogic(t, true);
          });
        }, 1000);
      });
      return;
    }

    processBotLogic(t, false);
  };

  const processBotLogic = (t, isInitial) => {
    let bestIntent = null;
    let maxScore = 0;

    BRAIN_DATA.intents.forEach(intent => {
      const score = calculateMatch(t, intent.keywords);
      if (score > maxScore) {
        maxScore = score;
        bestIntent = intent.id;
      }
    });

    // Handle Contextual follow-ups (if score is low but a topic exists)
    if (maxScore < 2 && lastTopic === "pricing" && (t.includes("discount") || t.includes("expensive") || t.includes("high") || t.includes("lower"))) {
      bestIntent = "pricing_followup";
    }

    if (bestIntent === "pricing_followup") {
      reply = "Our rates reflect the market-dominance we build. However, we can modularize the approach to fit your growth capital. Shall we discuss a **Starter Sprint**?";
    } else if (bestIntent === "ad_request") {
      reply = getResponse("ad_request");
      selectedServices = ["Content Sprint"]; // Pre-select service for ad leads
      setTimeout(() => startContact(), 2500); // Delayed start for natural feel
    } else if (smartMatch(t, "hire") || smartMatch(t, "start") || smartMatch(t, "contact") || t.includes("create")) {
      setTimeout(() => startContact(), 600);
      return;
    } else if (bestIntent) {
      reply = getResponse(bestIntent);
      lastTopic = bestIntent;
    } else if (smartMatch(t, "hi") || smartMatch(t, "hello") || smartMatch(t, "hey") || smartMatch(t, "greeting")) {
      reply = BRAIN_DATA.greeting[Math.floor(Math.random() * BRAIN_DATA.greeting.length)];
    } else if (!isInitial) {
      reply = BRAIN_DATA.fallbacks[Math.floor(Math.random() * BRAIN_DATA.fallbacks.length)];
    }

    if (reply) {
      setTimeout(() => {
        showTyping(1000, () => {
          addChat(reply, "bot");
          trackChat(t, reply);
        });
      }, 600);
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
      return addChat("Awesome! What is your **email address** so we can stay in touch?", "bot");
    }

    if (contactStep === "EMAIL") {
      if (!v.includes("@")) return addChat("Oops! That doesn't look like a valid email. 📧 Can you try again?", "bot");
      contactData.email = v;
      contactStep = "PHONE";
      return addChat("Got it. And a **phone number** to reach you at?", "bot");
    }

    if (contactStep === "PHONE") {
      contactData.phone = v;
      contactStep = "COMPANY_NAME";
      return addChat("What's the name of your **company, page, or channel**?", "bot");
    }

    if (contactStep === "COMPANY_NAME") {
      contactData.company_name = v;
      contactStep = "FINAL_MESSAGE";
      return addChat("Almost done! Anything else you'd like to tell me before we finish?", "bot");
    }

    if (contactStep === "FINAL_MESSAGE") {
      contactData.finalMsg = v;
      if (smartMatch(t, "no") || smartMatch(t, "none") || t === "n") {
        contactData.finalMsg = "No specific details provided.";
      }
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

      addChat("✅ All set! Review the form below and hit **Submit**.", "bot");
      setTimeout(() => {
        if (contactOverlay) contactOverlay.classList.add("show");
        document.body.style.overflow = "hidden";
        f.scrollIntoView({ behavior: "smooth" });
      }, 300); // Snappier transition
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
