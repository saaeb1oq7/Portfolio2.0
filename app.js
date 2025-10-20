"use strict";
/*
  app.js — modernized interaction layer
  - Menu / Sidebar
  - Lazy load videos
  - Intersection observers for animations
  - Contact form validation + fake submission
  - Basic service worker registration
*/

(function () {
  // Utilities
  const qs = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // Elements
  const menuBtn = qs('.menu-icon');
  const sidebar = qs('.sidebar');
  const closeBtn = qs('.close-icon');
  const hoverSign = qs('.hover-sign');
  const viewProjectBtns = qsa('.view-project');
  const contactForm = qs('#contactForm');
  const formStatus = qs('#formStatus');

  // Feature flags
  const supportsIntersection = 'IntersectionObserver' in window;

  // Safe DOM operations
  function safeAddListener(el, evt, fn) {
    if (!el) return;
    el.addEventListener(evt, fn, { passive: false });
  }

  // Sidebar behavior with focus-trap and inert handling
  function getFocusable(container) {
    if (!container) return [];
    return Array.from(container.querySelectorAll('a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])'))
      .filter(el => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true');
  }

  function setInert(container, inert) {
    if (!container) return;
    const focusables = getFocusable(container);
    focusables.forEach(el => {
      if (inert) {
        // store previous tabindex
        if (el.hasAttribute('tabindex')) el.dataset._prevTab = el.getAttribute('tabindex');
        el.setAttribute('tabindex', '-1');
      } else {
        if (el.dataset._prevTab) {
          el.setAttribute('tabindex', el.dataset._prevTab);
          delete el.dataset._prevTab;
        } else {
          el.removeAttribute('tabindex');
        }
      }
    });
  }

  function openSidebar() {
    if (!sidebar) return;
    sidebar.setAttribute('aria-hidden', 'false');
    sidebar.setAttribute('aria-modal', 'true');
    menuBtn.setAttribute('aria-expanded', 'true');
    sidebar.classList.add('open-sidebar');
    document.body.style.overflow = 'hidden';

    // make everything outside the sidebar inert/unfocusable
    setInert(document.body, true);
    // but allow sidebar focusables
    setInert(sidebar, false);

    // move focus to first focusable in sidebar
    const first = getFocusable(sidebar)[0];
    if (first) first.focus();

    // trap focus
    sidebar.addEventListener('keydown', handleSidebarTab);
  }

  function closeSidebar() {
    if (!sidebar) return;
    sidebar.setAttribute('aria-hidden', 'true');
    sidebar.removeAttribute('aria-modal');
    menuBtn.setAttribute('aria-expanded', 'false');
    sidebar.classList.remove('open-sidebar');
    document.body.style.overflow = '';

    // restore focusability
    setInert(document.body, false);

    // return focus to menu button
    if (menuBtn) menuBtn.focus();

    sidebar.removeEventListener('keydown', handleSidebarTab);
  }

  function handleSidebarTab(e) {
    if (e.key !== 'Tab') return;
    const focusables = getFocusable(sidebar);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  safeAddListener(menuBtn, 'click', openSidebar);
  safeAddListener(closeBtn, 'click', closeSidebar);
  safeAddListener(document, 'keydown', (e) => {
    if (e.key === 'Escape') closeSidebar();
  });

  // Outside click to close sidebar
  safeAddListener(document, 'click', (e) => {
    if (!sidebar || !sidebar.classList.contains('open-sidebar')) return;
    if (!sidebar.contains(e.target) && !menuBtn.contains(e.target)) closeSidebar();
  });

  // Lazy load video when in viewport
  function lazyLoadMedia() {
    // Select videos where <source> has data-src or video[data-src]
    const vids = qsa('video');
    if (!vids.length) return;

    function loadVideoElement(videoEl) {
      if (!videoEl) return;
      // If already loaded or has src, skip
      if (videoEl.dataset._loaded) return;

      // Find source[data-src]
      const srcEl = videoEl.querySelector('source[data-src]');
      const dataSrc = srcEl && srcEl.getAttribute('data-src');
      if (dataSrc) {
        // mark loading state
        videoEl.classList.add('video-loading');
        // set src on video element for broader browser support
        videoEl.src = dataSrc;
        // also set source src for completeness
        srcEl.setAttribute('src', dataSrc);
        videoEl.load();
        // when canplaythrough, mark loaded
        const onCanPlay = () => {
          videoEl.classList.remove('video-loading');
          videoEl.classList.add('video-loaded');
          videoEl.dataset._loaded = '1';
          videoEl.removeEventListener('canplaythrough', onCanPlay);
          // autoplay if requested
          if (videoEl.getAttribute('data-autoplay') === 'true') {
            videoEl.play().catch(() => {});
          }
        };
        videoEl.addEventListener('canplaythrough', onCanPlay);
      }
    }

    if (supportsIntersection) {
      // Observer for high-priority videos (data-priority)
      const highPriorityObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            loadVideoElement(entry.target);
            obs.unobserve(entry.target);
          }
        });
      }, { rootMargin: '400px' });

      // Default observer
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            loadVideoElement(entry.target);
            obs.unobserve(entry.target);
          }
        });
      }, { rootMargin: '200px' });

      vids.forEach(v => {
        const srcEl = v.querySelector('source[data-src]');
        if (srcEl) {
          if (v.getAttribute('data-priority') === 'high') {
            highPriorityObserver.observe(v);
          } else {
            io.observe(v);
          }
        }
      });
    } else {
      // Fallback: load all that have data-src
      vids.forEach(v => {
        const srcEl = v.querySelector('source[data-src]');
        const dataSrc = srcEl && srcEl.getAttribute('data-src');
        if (dataSrc) {
          v.src = dataSrc;
          srcEl.setAttribute('src', dataSrc);
          v.load();
        }
      });
    }
  }

  // Video interactions: hover for fine pointers, click/tap toggle for coarse pointers
  const isCoarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

  if (!isCoarsePointer) {
    // Desktop/precise pointer: keep hover behavior, but per-video hoverSign handling
    safeAddListener(document, 'mouseover', (e) => {
      const vid = e.target.closest && e.target.closest('video');
      if (vid && vid.closest('.project-vidbox')) {
        // only attempt play if source is set and readyState indicates data
        if (vid.src || vid.querySelector('source[src]')) {
          if (vid.readyState >= 2) {
            vid.play().catch(() => {});
          } else {
            // attempt to load then play when possible
            vid.load();
            vid.addEventListener('canplay', () => vid.play().catch(() => {}), { once: true });
          }
        }
        const sign = vid.closest('.project-vidbox').querySelector('.hover-sign');
        if (sign) sign.classList.add('active');
      }
    });
    safeAddListener(document, 'mouseout', (e) => {
      const vid = e.target.closest && e.target.closest('video');
      if (vid && vid.closest('.project-vidbox')) {
        vid.pause();
        try { vid.currentTime = 0; } catch (err) {}
        const sign = vid.closest('.project-vidbox').querySelector('.hover-sign');
        if (sign) sign.classList.remove('active');
      }
    });
  } else {
    // Coarse/touch: hide hover-sign via CSS and toggle play on click/tap
    safeAddListener(document, 'click', (e) => {
      const box = e.target.closest && e.target.closest('.project-vidbox');
      if (!box) return;
      const vid = box.querySelector('video');
      if (!vid) return;
      if (vid.paused) {
        vid.play().catch(() => {});
      } else {
        vid.pause();
      }
    });
  }

  // Smooth scroll for same-page links
  safeAddListener(document, 'click', (e) => {
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (href === '#' || href === '#!') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // ensure the skip link target can receive focus
      if (typeof target.focus === 'function') target.focus({ preventScroll: true });
      closeSidebar();
    }
  });

  // Intersection animation observer
  function initScrollAnimations() {
    try {
      if (!supportsIntersection) return;
      // Collect animated elements by class and optional grouping attribute
      const groups = {};
      const selectors = ['.autoBlur', '.autoDisplay', '.fadeInRight'];
      selectors.forEach(sel => {
        qsa(sel).forEach(el => {
          const group = el.getAttribute('data-stagger-group') || ('default-' + sel.replace(/[^a-z]/g, ''));
          if (!groups[group]) groups[group] = [];
          groups[group].push(el);
        });
      });

      // Assign delays per group using a small step to create the stagger
      const step = 0.08; // 80ms between items
      Object.values(groups).forEach(groupEls => {
        groupEls.forEach((el, idx) => {
          const delay = (idx * step).toFixed(2) + 's';
          el.style.setProperty('--delay', delay);
        });
      });

      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            // we don't need to observe after it's visible
            try { io.unobserve(entry.target); } catch (err) {}
          } else {
            // optional: remove for repeated animations
            // entry.target.classList.remove('in-view');
          }
        });
      }, { threshold: 0.2 });

      // Observe every element we assigned a delay to
      Object.values(groups).forEach(groupEls => groupEls.forEach(el => io.observe(el)));
    } catch (err) {
      console.warn('initScrollAnimations failed:', err);
    }
  }

  // Simple form validation + fake submit
  function initForm() {
    if (!contactForm) return;
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fields = [
        { el: contactForm.querySelector('#fullName'), name: 'name', required: true },
        { el: contactForm.querySelector('#email'), name: 'email', required: true },
        { el: contactForm.querySelector('#message'), name: 'message', required: true }
      ];

      // clear previous error states
      fields.forEach(f => {
        if (!f.el) return;
        f.el.classList.remove('is-invalid');
        f.el.removeAttribute('aria-invalid');
        const err = f.el.parentNode && f.el.parentNode.querySelector && f.el.parentNode.querySelector('.error-message');
        if (err) err.textContent = '';
      });

      formStatus.textContent = '';

      // validate
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      let hasError = false;

      for (const f of fields) {
        if (!f.el) continue;
        const value = f.el.value.trim();
        if (f.required && !value) {
          hasError = true;
          f.el.classList.add('is-invalid');
          f.el.setAttribute('aria-invalid', 'true');
          const err = f.el.parentNode && f.el.parentNode.querySelector && f.el.parentNode.querySelector('.error-message');
          if (err) err.textContent = 'This field is required.';
        }
        if (f.name === 'email' && value && !emailPattern.test(value)) {
          hasError = true;
          f.el.classList.add('is-invalid');
          f.el.setAttribute('aria-invalid', 'true');
          const err = f.el.parentNode && f.el.parentNode.querySelector && f.el.parentNode.querySelector('.error-message');
          if (err) err.textContent = 'Please enter a valid email address.';
        }
      }

      if (hasError) {
        formStatus.textContent = 'Please correct the highlighted fields.';
        return;
      }
      try {
        formStatus.textContent = 'Sending...';
        // Simulate network call
        await new Promise(r => setTimeout(r, 800));
        formStatus.textContent = 'Message sent — thank you!';
        contactForm.reset();
      } catch (err) {
        formStatus.textContent = 'Failed to send message. Please try again later.';
      }
    });
  }

  // View project modal (basic)
  function initProjectModals() {
    if (!viewProjectBtns.length) return;
    viewProjectBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-project');
        // For now show an alert (placeholder)
        // Could be replaced with real modal implementation
        alert('Open project viewer for: ' + id);
      });
    });
  }

  // Service worker registration (best-effort)
  function registerSW() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('service-worker.js').then(reg => {
        console.log('SW registered', reg.scope);
      }).catch(err => console.warn('SW registration failed', err));
    }
  }

  // Init
  document.addEventListener('DOMContentLoaded', () => {
    lazyLoadMedia();
    initScrollAnimations();
    initForm();
    initProjectModals();
    // Defer sw registration to load to avoid competing for network during initial render
    window.addEventListener('load', () => {
      registerSW();
    });
  });

})();
