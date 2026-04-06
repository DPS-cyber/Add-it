/* =========================================
   ADD-IT MASTER ENGINE (Logic 3.0)
   - Morning State Restoration
   - Webflow Progressive Preloader
   - High-Performance Observers
========================================= */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Webflow-Style Progressive Preloader
  const startPreloader = () => {
    const percentEl = document.getElementById("loaderPercent");
    const barEl = document.getElementById("loaderBar");

    const finishLoading = () => {
      setTimeout(() => {
        document.body.classList.add("loaded");
        initAll();
      }, 50);
    };

    // Optimization: Check for returning user
    const hasLoadedBefore = localStorage.getItem("siteLoaded");

    if (hasLoadedBefore) {
      // Returning user: Instant (0.05s total feel)
      let progress = 0;
      const interval = setInterval(() => {
        progress += 100; // Complete in 1 step
        if (percentEl) percentEl.textContent = progress;
        if (barEl) barEl.style.width = progress + "%";
        if (progress >= 100) {
          clearInterval(interval);
          finishLoading();
        }
      }, 50);
      return;
    }

    // First time user: Real preloading with PreloadJS
    const queue = new createjs.LoadQueue(false);

    queue.on("progress", (event) => {
      const progress = Math.floor(event.progress * 100);
      if (percentEl) percentEl.textContent = progress;
      if (barEl) barEl.style.width = progress + "%";
    });

    queue.on("complete", () => {
      localStorage.setItem("siteLoaded", "true");
      finishLoading();
    });

    queue.loadManifest([
      { id: "logo", src: "logo.png" },
      { id: "ad1", src: "ad1.jpg" },
      { id: "ad2", src: "ad2.jpg" },
      { id: "ad3", src: "ad3.jpg" },
      { id: "ad4", src: "ad4.JPG" },
      { id: "ad5", src: "ad5.jpg" },
      { id: "ad6", src: "ad6.jpg" }
    ]);

    // Force finish if loading takes too long (Safety first)
    setTimeout(() => {
      if (!localStorage.getItem("siteLoaded")) {
        console.log("Loading timed out - starting site anyway");
        finishLoading();
      }
    }, 2000);
  };
  startPreloader();

  // Hoist nav references so all code can access them
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');

  // Hamburger Menu Toggle Function
  const initHamburgerMenu = () => {
    if (!hamburger || !navMenu) return;

    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('show');
    });

    // Close menu when clicking nav links
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('show');
      });
    });
  };

  const initAll = () => {
    const isMobile = window.innerWidth <= 768;

    initAccelerator();
    initObservers();
    initMagneticButtons();
    initHamburgerMenu();
    initCursor();
    initWorkSearch();
    initLightbox();

    if (!isMobile) {
      initTilt();
    }

    initMarquee({ el: document.getElementById('heroRow'), speed: isMobile ? 1 : 1.5 });
    initM("accContent", 2);
  };

  // 2. Scroll Progress & Header State
  window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    const header = document.querySelector('header');
    if (header) {
      header.style.setProperty('--scroll-progress', scrolled + '%');
      if (winScroll > 50) header.classList.add('header-scrolled');
      else header.classList.remove('header-scrolled');
    }
  });

  // 3. SPA ROUTER
  const wipe = document.getElementById("page-wipe");
  const views = document.querySelectorAll(".page-view");
  const workView = document.getElementById("work-view");

  const switchPage = (viewId, push = true, sectionId = "") => {
    if (!wipe) return;
    
    const currentView = Array.from(views).find(v => v.classList.contains("active"));
    const targetView = document.getElementById(viewId + "-view");
    
    if (currentView === targetView && sectionId) {
      scrollToSection(sectionId);
      if (push) updateHistory(viewId, sectionId);
      return;
    }

    wipe.classList.remove("exit");
    wipe.classList.add("active");

    setTimeout(() => {
      views.forEach(v => v.classList.remove("active"));
      if (targetView) {
        targetView.classList.add("active");
        if (sectionId) scrollToSection(sectionId);
        else window.scrollTo(0, 0);
      }
      wipe.classList.remove("active");
      wipe.classList.add("exit");
      if (push) updateHistory(viewId, sectionId);
      initObservers();
      setTimeout(() => wipe.classList.remove("exit"), 600);
    }, 600);
  };

  const scrollToSection = (id) => {
    const target = document.getElementById(id.replace("#", ""));
    if (target) {
      const headerH = window.innerWidth <= 768 ? 80 : 100;
      const targetPos = target.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: targetPos - headerH - 40, behavior: "smooth" });
    }
  };

  const updateHistory = (view, section = "") => {
    let path = view === "home" ? "/" : "/" + view;
    if (section && section !== "home") path = "/" + section.replace("#", "");
    history.pushState({ view: view, section: section }, "", path);
  };

  window.addEventListener("popstate", (e) => {
    if (e.state) switchPage(e.state.view, false, e.state.section);
    else {
      const path = window.location.pathname.replace("/", "") || "home";
      if (["services", "about", "contact"].includes(path)) switchPage("home", false, path);
      else switchPage(path, false);
    }
  });

  const initialPath = window.location.pathname.replace("/", "") || "home";
  if (initialPath === "work") {
    views.forEach(v => v.classList.remove("active"));
    workView.classList.add("active");
  } else if (["services", "about", "contact"].includes(initialPath)) {
    setTimeout(() => switchPage("home", false, initialPath), 500);
  }

  document.querySelectorAll('a[href^="#"], .nav-cta, .btn-contact, #work-teaser a[href="#work"]').forEach(link => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;
      e.preventDefault();
      if (hamburger) hamburger.classList.remove("active");
      if (navMenu) navMenu.classList.remove("show");
      const sectionId = href.replace("#", "");
      if (sectionId === "work") switchPage("work");
      else if (sectionId === "home") switchPage("home");
      else if (sectionId === "contact") {
        const overlay = document.getElementById("contactOverlay");
        if (overlay) { overlay.classList.add("show"); document.body.style.overflow = "hidden"; }
      } else switchPage("home", true, sectionId);
    });
  });

  // 5. Unified Intersection Observer
  function initObservers() {
    const masterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          if (el.classList.contains('reveal')) el.classList.add('active');
          if (el.classList.contains('speedo-container')) initAccelerator();
          if (el.classList.contains('ig-stage')) {
            el.classList.add('active');
            setTimeout(() => {
              el.classList.add('play');
              const runProcess = () => {
                if (window.instgrm) {
                  try { window.instgrm.Embeds.process(); }
                  catch (e) { console.warn("Instagram process throttled:", e.message); }
                } else setTimeout(runProcess, 300);
              };
              runProcess();
            }, 1000);
          }
          masterObserver.unobserve(el);
        }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.1 });

    document.querySelectorAll('.reveal, .ig-stage, .work-card, .title-clamp, .speedo-container').forEach(el => {
      masterObserver.observe(el);
    });
  }

  // 6. Portfolio Search
  function initWorkSearch() {
    const searchInput = document.getElementById("workSearch");
    const grid = document.getElementById("fullWorkGrid");
    const keys = document.querySelectorAll(".filter-key");
    if (!grid) return;
    const cards = grid.querySelectorAll(".work-card");
    let activeFilter = "all";

    const performFilter = () => {
      const term = searchInput ? searchInput.value.toLowerCase().trim() : "";
      cards.forEach(card => {
        const tags = card.getAttribute("data-tags") ? card.getAttribute("data-tags").toLowerCase() : "";
        const matchesSearch = tags.includes(term) || term === "";
        const matchesKey = activeFilter === "all" || tags.includes(activeFilter);
        if (matchesSearch && matchesKey) card.classList.remove("hidden");
        else card.classList.add("hidden");
      });
    };

    if (searchInput) searchInput.addEventListener("input", performFilter);
    keys.forEach(key => {
      key.addEventListener("click", () => {
        keys.forEach(k => k.classList.remove("active"));
        key.classList.add("active");
        activeFilter = key.getAttribute("data-filter");
        performFilter();
      });
    });
  }

  function initTilt() {
    document.querySelectorAll('.work-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        if (window.innerWidth <= 768) return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left, y = e.clientY - rect.top;
        const rx = (y - rect.height / 2) / 10, ry = (rect.width / 2 - x) / 10;
        card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.02, 1.02, 1.02)`;
      });
      card.addEventListener('mouseleave', () => card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)');
    });
  }
});

function initAccelerator() {
  const needle = document.getElementById('speedoNeedle');
  const valueEl = document.getElementById('speedValue');
  const speedoContainer = document.getElementById('speedoContainer');
  if (!needle || !valueEl || !speedoContainer || speedoContainer.dataset.animated) return;
  speedoContainer.dataset.animated = "true";

  setTimeout(() => {
    needle.style.transform = 'translateX(-50%) rotate(75deg)';
    let count = 0;
    const target = 100;
    const duration = 2500;
    const startTime = performance.now();

    const updateCount = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 4);
      count = Math.floor(easedProgress * target);
      valueEl.textContent = count + '%';
      if (progress < 1) requestAnimationFrame(updateCount);
      else {
        setTimeout(() => {
          speedoContainer.classList.add('ignite');
          valueEl.textContent = 'MAX!!';
          valueEl.style.color = '#ff0000';
          valueEl.style.textShadow = '0 0 20px #ff0000';
          needle.style.transform = 'translateX(-50%) rotate(85deg)';
        }, 300);
      }
    };
    requestAnimationFrame(updateCount);
  }, 1000);
}

function initMarquee({ el, speed, reverse = false }) {
  if (!el || el.dataset.running) return;
  el.dataset.running = "1";
  let x = 0;
  const animate = () => {
    x += reverse ? speed : -speed;
    if (!reverse && x <= -el.scrollWidth / 2) x = 0;
    if (reverse && x >= 0) x = -el.scrollWidth / 2;
    el.style.transform = `translate3d(${x}px, 0, 0)`;
    requestAnimationFrame(animate);
  };
  animate();
}

function initM(id, s) {
  const el = document.getElementById(id);
  if (!el || el.dataset.running) return;
  el.dataset.running = "1";
  el.innerHTML += el.innerHTML;
  let x = 0;
  const a = () => {
    x -= s;
    if (x <= -el.scrollWidth / 2) x = 0;
    el.style.transform = `translate3d(${x}px, 0, 0)`;
    requestAnimationFrame(a);
  };
  a();
}

function initMagneticButtons() {
  if (window.innerWidth <= 768) return;
  document.querySelectorAll('.nav-cta, .social-link, .contact-form button').forEach(el => {
    el.addEventListener('mousemove', function (e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2, y = e.clientY - rect.top - rect.height / 2;
      this.style.transform = `translate3d(${x * 0.25}px, ${y * 0.25}px, 0)`;
    });
    el.addEventListener('mouseleave', function () { this.style.transform = 'translate3d(0, 0, 0)'; });
  });
}

function initCursor() {
  if (window.innerWidth > 768) {
    const cursor = document.querySelector(".cursor");
    if (cursor) {
      let x = 0, y = 0, targetX = 0, targetY = 0, h = false;
      document.addEventListener("mousemove", e => { targetX = e.clientX; targetY = e.clientY; });
      const loop = () => {
        x += (targetX - x) * 0.15; y += (targetY - y) * 0.15;
        cursor.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%) ${h ? 'scale(1.5)' : 'scale(1)'}`;
        requestAnimationFrame(loop);
      };
      loop();
      document.querySelectorAll('a, button, .work-card, .nav-cta, .social-link').forEach(el => {
        el.addEventListener("mouseenter", () => h = true);
        el.addEventListener("mouseleave", () => h = false);
      });
    }
  }
}

function initLightbox() {
  const overlay = document.getElementById("lightbox-overlay");
  const content = document.getElementById("lightbox-content");
  const closeBtn = document.getElementById("lightbox-close");
  if (!overlay || !content || !closeBtn) return;

  const closeLightbox = () => {
    overlay.classList.remove("active");
    const video = content.querySelector("video");
    if (video) video.pause();
    setTimeout(() => { content.innerHTML = ""; }, 400); 
  };

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay || e.target === closeBtn || e.target === content) closeLightbox();
  });

  document.querySelectorAll(".work-grid .work-card img, .work-grid .work-card video").forEach(el => {
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      content.innerHTML = "";
      const clone = el.cloneNode(true);
      if (clone.tagName === 'VIDEO') {
        clone.controls = true;
        clone.muted = false;
      }
      content.appendChild(clone);
      overlay.classList.add("active");
      if (clone.tagName === 'VIDEO') clone.play().catch(err => console.log("Play interrupted"));
    });
  });
}
