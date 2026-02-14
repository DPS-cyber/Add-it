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
    let progress = 0;

    const interval = setInterval(() => {
      // Fast progress feel
      const increment = Math.random() * (progress > 85 ? 1 : 15);
      progress = Math.min(100, progress + increment);

      if (percentEl) percentEl.textContent = Math.floor(progress);
      if (barEl) barEl.style.width = progress + "%";

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          document.body.classList.add("loaded");
          initAll();
        }, 600);
      }
    }, 40);
  };
  startPreloader();

  // Hamburger Menu Toggle Function
  const initHamburgerMenu = () => {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');

    if (!hamburger || !navMenu) {
      console.log('Hamburger or navMenu not found');
      return;
    }

    console.log('Hamburger menu initialized');

    hamburger.addEventListener('click', () => {
      console.log('Hamburger clicked');
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

    // Only init tilt on desktop
    if (!isMobile) {
      initTilt();
    }

    // Initialize Marquees
    initMarquee({ el: document.getElementById('heroRow'), speed: isMobile ? 1 : 1.5 });
    initM("accContent", 2);
  };

  // Header Scroll Progress & Sticky State
  window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    const header = document.querySelector('header');
    if (header) {
      header.style.setProperty('--scroll-progress', scrolled + '%');
      if (winScroll > 50) {
        header.classList.add('header-scrolled');
      } else {
        header.classList.remove('header-scrolled');
      }
    }
  });



  // 3. Unified Precision Scroll
  document.querySelectorAll('a[href^="#"], .nav-cta, .btn-contact').forEach(link => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href") || "#contact";
      const targetEl = document.querySelector(href);

      if (href === "#contact") {
        e.preventDefault();
        const contactOverlay = document.getElementById("contactOverlay");
        if (contactOverlay) {
          contactOverlay.classList.add("show");
          document.body.style.overflow = "hidden";
          if (hamburger) hamburger.classList.remove("active");
          if (navMenu) navMenu.classList.remove("show");
        }
        return;
      }

      if (targetEl) {
        e.preventDefault();
        if (hamburger) hamburger.classList.remove("active");
        if (navMenu) navMenu.classList.remove("show");

        const headerH = window.innerWidth <= 768 ? 80 : 100;
        const targetPos = targetEl.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({
          top: targetPos - headerH - 40,
          behavior: "smooth"
        });
      }
    });
  });


  // 4. Custom Cursor (Desktop Only) - Moved to initCursor function


  // 5. Unified Intersection Observer
  function initObservers() {
    const masterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;

          if (el.classList.contains('reveal')) {
            el.classList.add('active');
          }

          if (el.classList.contains('speedo-container')) {
            initAccelerator(); // Trigger on scroll
          }

          if (el.classList.contains('ig-stage')) {
            el.classList.add('active');
            setTimeout(() => {
              el.classList.add('play');
              const runProcess = () => {
                if (window.instgrm) {
                  window.instgrm.Embeds.process();
                } else {
                  setTimeout(runProcess, 200);
                }
              };
              runProcess();
            }, 1500);
          }

          masterObserver.unobserve(el);
        }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.1 });

    document.querySelectorAll('.reveal, .ig-stage, .work-card, .title-clamp, .speedo-container').forEach(el => {
      masterObserver.observe(el);
    });
  }

  function initTilt() {
    document.querySelectorAll('.work-card').forEach(card => {
      // Mouse move (Desktop)
      card.addEventListener('mousemove', (e) => {
        if (window.innerWidth <= 768) return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left, y = e.clientY - rect.top;
        const rx = (y - rect.height / 2) / 10, ry = (rect.width / 2 - x) / 10;
        card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.02, 1.02, 1.02)`;
      });

      // Touch move (Mobile - Attention Grabbing)
      card.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        const rect = card.getBoundingClientRect();
        const x = touch.clientX - rect.left, y = touch.clientY - rect.top;
        if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;
        const rx = (y - rect.height / 2) / 15, ry = (rect.width / 2 - x) / 15;
        card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.01, 1.01, 1.01)`;
      }, { passive: true });

      card.addEventListener('mouseleave', () => card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)');
      card.addEventListener('touchend', () => card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)');
    });
  }

  // Dropdown logic removed (moved to form.js)
});

function initAccelerator() {
  const needle = document.getElementById('speedoNeedle');
  const valueEl = document.getElementById('speedValue');
  const speedoContainer = document.getElementById('speedoContainer');
  if (!needle || !valueEl || !speedoContainer || speedoContainer.dataset.animated) return;
  speedoContainer.dataset.animated = "true";

  // Initial max position animation
  setTimeout(() => {
    // Initial max position
    needle.style.transform = 'translateX(-50%) rotate(75deg)';

    // Animate counter
    let count = 0;
    const target = 100;
    const duration = 2500;
    const startTime = performance.now();

    const updateCount = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (outQuart)
      const easedProgress = 1 - Math.pow(1 - progress, 4);
      count = Math.floor(easedProgress * target);

      valueEl.textContent = count + '%';

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        // TRIGGER FIRE EFFECT
        setTimeout(() => {
          speedoContainer.classList.add('ignite');
          valueEl.textContent = 'MAX!!';
          valueEl.style.color = '#ff0000';
          valueEl.style.textShadow = '0 0 20px #ff0000';

          // Final needle jitter position push
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
  // Content already duplicated in HTML for heroRow for better performance
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

// Kinetic Marquee Logic (Redesign Port)
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
  // Skip magnetic effect on mobile
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

// ===== VALENTINE PROMO LOGIC (TEST MODE) =====

(function () {
  const banner = document.getElementById("promoBanner");
  if (!banner) return;

  document.body.classList.add("promo-active");
})();

// 10. Custom Cursor Logic
function initCursor() {
  // 4. Custom Cursor (Desktop Only)
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

