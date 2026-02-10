'use strict';

/**
 * Saaeb Saad Portfolio - Modern Interaction Layer
 * Features: Menu/Sidebar, Lazy Loading, Animations, Form Handling
 */

class PortfolioApp {
    constructor() {
        // DOM Elements
        this.elements = {
            menuToggle: document.querySelector('.menu-toggle'),
            sidebar: document.querySelector('.sidebar'),
            sidebarClose: document.querySelector('.sidebar-close'),
            contactForm: document.getElementById('contactForm'),
            formStatus: document.getElementById('formStatus'),
            scrollDown: document.querySelector('.scroll-down')
        };

        // State
        this.state = {
            isSidebarOpen: false,
            isReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        };

        // Initialize
        this.init();
    }

    /**
     * Initialize all functionality
     */
    init() {
        this.setupThemeToggle();
        this.setupEventListeners();
        this.lazyLoadMedia();
        this.initScrollAnimations();
        this.initParallaxScroll();
        this.initSkillSlider();
        this.initSkillReveal();
        this.initFormAnimations();
        this.initEmailJS();
        
        // Defer non-critical initialization
        window.addEventListener('load', () => {
            this.registerServiceWorker();
        });
    }

    /**
     * Setup Dark Mode Theme Toggle
     */
    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;

        // Get saved theme preference or use system preference
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');

        this.setTheme(initialTheme);

        // Theme toggle button click handler
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            this.setTheme(newTheme);
        });

        // Listen for system preference changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            const savedTheme = localStorage.getItem('theme');
            if (!savedTheme) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    /**
     * Set theme and persist to localStorage
     * @param {string} theme - 'light' or 'dark'
     */
    setTheme(theme) {
        const html = document.documentElement;
        const themeToggle = document.getElementById('themeToggle');
        
        // Set theme attribute
        html.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);

        // Update button icon
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = theme === 'dark' ? 'bx bx-sun' : 'bx bx-moon';
            }
        }

        // Add transition class for smooth theme change
        html.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        setTimeout(() => {
            html.style.transition = '';
        }, 300);
    }

    /**
     * Reveal skill cards with a staggered animation when they enter view
     */
    initSkillReveal() {
        const cards = Array.from(document.querySelectorAll('.skill-card'));
        if (!cards.length) return;

        const revealCard = (card) => {
            if (card.classList.contains('is-visible')) return;
            card.classList.add('is-visible');

            const bars = Array.from(card.querySelectorAll('.skill-progress'));
            bars.forEach((bar, i) => {
                const pct = bar.dataset.percent || bar.getAttribute('aria-valuenow') || '0';
                const final = String(pct).endsWith('%') ? pct : `${pct}%`;
                const num = parseInt(String(final).replace('%', ''), 10) || 0;
                setTimeout(() => {
                    bar.style.width = final;
                    bar.setAttribute('aria-valuenow', String(num));

                    // insert/update label inside bar for better readability when there's space
                    const parentItem = bar.closest('.skill-item');
                    const skillLevelEl = parentItem?.querySelector('.skill-level');

                    if (num >= 12) {
                        // create or update label inside bar
                        let label = bar.querySelector('.skill-progress-label');
                        if (!label) {
                            label = document.createElement('span');
                            label.className = 'skill-progress-label';
                            bar.appendChild(label);
                        }
                        label.textContent = final;
                        parentItem?.classList.add('skill-item--label-inside');
                        if (skillLevelEl) skillLevelEl.setAttribute('aria-hidden', 'true');
                    } else {
                        parentItem?.classList.remove('skill-item--label-inside');
                        if (skillLevelEl) skillLevelEl.removeAttribute('aria-hidden');
                    }
                }, i * 80);
            });
        };

        if (this.state.isReducedMotion) {
            cards.forEach(c => revealCard(c));
            return;
        }

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        revealCard(entry.target);
                        obs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.18 });

            cards.forEach(card => observer.observe(card));
        } else {
            cards.forEach(c => revealCard(c));
        }
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Sidebar toggle
        this.elements.menuToggle?.addEventListener('click', () => this.openSidebar());
        this.elements.sidebarClose?.addEventListener('click', () => this.closeSidebar());

        // Close sidebar on outside click
        document.addEventListener('click', (e) => {
            if (this.state.isSidebarOpen && 
                !this.elements.sidebar.contains(e.target) && 
                !this.elements.menuToggle.contains(e.target)) {
                this.closeSidebar();
            }
        });

        // Close sidebar on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.state.isSidebarOpen) {
                this.closeSidebar();
            }
        });

        // Smooth scroll for anchor links
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (link && this.isValidAnchor(link.getAttribute('href'))) {
                e.preventDefault();
                this.smoothScrollTo(link.getAttribute('href'));
                this.closeSidebar();
            }
        });

        // Scroll down button
        this.elements.scrollDown?.addEventListener('click', () => {
            this.smoothScrollTo('#about');
        });

        // Contact form submission
        this.elements.contactForm?.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // View Project buttons
        document.addEventListener('click', (e) => {
            const viewBtn = e.target.closest('.view-project');
            if (viewBtn) {
                const projectId = viewBtn.getAttribute('data-project');
                this.handleProjectView(projectId);
            }
        });

        // Video interactions
        this.setupVideoInteractions();
    }

    /**
     * Sidebar management
     */
    openSidebar() {
        this.elements.sidebar.setAttribute('aria-hidden', 'false');
        this.elements.sidebar.setAttribute('aria-modal', 'true');
        this.elements.menuToggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
        this.setInert(document.body, true);
        this.setInert(this.elements.sidebar, false);
        
        // Focus management
        const firstFocusable = this.getFocusableElements(this.elements.sidebar)[0];
        firstFocusable?.focus();
        
        this.elements.sidebar.addEventListener('keydown', (e) => this.handleSidebarTab(e));
        this.state.isSidebarOpen = true;
    }

    closeSidebar() {
        this.elements.sidebar.setAttribute('aria-hidden', 'true');
        this.elements.sidebar.removeAttribute('aria-modal');
        this.elements.menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        this.setInert(document.body, false);
        
        // Return focus to menu button
        this.elements.menuToggle?.focus();
        
        this.elements.sidebar.removeEventListener('keydown', (e) => this.handleSidebarTab(e));
        this.state.isSidebarOpen = false;
    }

    /**
     * Focus trap for sidebar
     */
    handleSidebarTab(e) {
        if (e.key !== 'Tab') return;
        
        const focusable = this.getFocusableElements(this.elements.sidebar);
        if (!focusable.length) return;
        
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }

    /**
     * Utility: Get focusable elements
     */
    getFocusableElements(container) {
        if (!container) return [];
        return Array.from(container.querySelectorAll(
            'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])'
        )).filter(el => 
            !el.hasAttribute('disabled') && 
            el.getAttribute('aria-hidden') !== 'true'
        );
    }

    /**
     * Utility: Set inert state
     */
    setInert(container, inert) {
        if (!container) return;
        const focusables = this.getFocusableElements(container);
        
        focusables.forEach(el => {
            if (inert) {
                if (el.hasAttribute('tabindex')) {
                    el.dataset._prevTab = el.getAttribute('tabindex');
                }
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

    /**
     * Lazy load images and videos with Intersection Observer and blur-up effects
     * Handles progressive image loading with modern formats and responsive srcsets
     */
    lazyLoadMedia() {
        // Check for prefers-reduced-data for low-bandwidth users
        const prefersReducedData = window.matchMedia('(prefers-reduced-data: reduce)').matches;
        
        // Lazy load images with blur-up effect
        const images = document.querySelectorAll('img.lazy-img');
        const videos = document.querySelectorAll('video');
        
        if (!('IntersectionObserver' in window)) {
            // Fallback for older browsers
            images.forEach(img => img.classList.remove('img-loading'));
            videos.forEach(video => {
                const source = video.querySelector('source[data-src]');
                if (source?.getAttribute('data-src')) {
                    source.setAttribute('src', source.getAttribute('data-src'));
                    video.load();
                }
            });
            return;
        }

        // Image loading with blur-up effect
        const loadImage = (img) => {
            if (img.dataset._loaded) return;
            
            img.classList.add('img-loading');
            const imageLoadHandler = () => {
                img.classList.remove('img-loading');
                img.classList.add('img-loaded');
                img.dataset._loaded = '1';
                img.removeEventListener('load', imageLoadHandler);
                img.removeEventListener('error', errorHandler);
            };
            
            const errorHandler = () => {
                img.classList.remove('img-loading');
                img.classList.add('img-loaded');
                img.removeEventListener('load', imageLoadHandler);
                img.removeEventListener('error', errorHandler);
            };
            
            img.addEventListener('load', imageLoadHandler);
            img.addEventListener('error', errorHandler);
        };

        // Video loading
        const loadVideo = (videoEl) => {
            if (videoEl.dataset._loaded) return;

            const source = videoEl.querySelector('source[data-src]');
            const dataSrc = source?.getAttribute('data-src');
            
            if (dataSrc) {
                videoEl.classList.add('video-loading');
                source.setAttribute('src', dataSrc);
                videoEl.load();

                const onCanPlay = () => {
                    videoEl.classList.remove('video-loading');
                    videoEl.classList.add('video-loaded');
                    videoEl.dataset._loaded = '1';
                    videoEl.removeEventListener('canplaythrough', onCanPlay);
                    
                    // Speed up hero video for better pacing
                    if (videoEl.classList.contains('hero-video')) {
                        videoEl.playbackRate = 2;
                    }
                    
                    // Respect prefers-reduced-data for autoplay
                    if (videoEl.getAttribute('data-autoplay') === 'true' && !prefersReducedData) {
                        videoEl.play().catch(() => {});
                    }
                };

                videoEl.addEventListener('canplaythrough', onCanPlay, { once: true });
            }
        };

        // Setup Intersection Observers with staggered loading
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    loadImage(entry.target);
                    imageObserver.unobserve(entry.target);
                }
            });
        }, { rootMargin: '50px', threshold: 0.01 });

        const highPriorityVideoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    loadVideo(entry.target);
                    highPriorityVideoObserver.unobserve(entry.target);
                }
            });
        }, { rootMargin: prefersReducedData ? '0px' : '400px' });

        const defaultVideoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    loadVideo(entry.target);
                    defaultVideoObserver.unobserve(entry.target);
                }
            });
        }, { rootMargin: prefersReducedData ? '0px' : '200px' });

        // Observe images
        images.forEach(img => imageObserver.observe(img));

        // Observe videos with priority handling
        videos.forEach(video => {
            const source = video.querySelector('source[data-src]');
            if (source) {
                const isHigh = video.getAttribute('data-priority') === 'high' || video.getAttribute('fetchpriority') === 'high';
                if (isHigh) {
                    highPriorityVideoObserver.observe(video);
                } else {
                    defaultVideoObserver.observe(video);
                }
            }
        });
    }

    /**
     * Video interaction handling with smooth animations
     */
    setupVideoInteractions() {
        const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
        const prefersReducedData = window.matchMedia('(prefers-reduced-data: reduce)').matches;

        if (!isCoarsePointer && !prefersReducedData) {
            // Desktop hover behavior with smooth transitions
            document.addEventListener('mouseover', (e) => {
                const video = e.target.closest('video');
                if (video?.closest('.project-visual')) {
                    this.handleVideoHover(video, true);
                }
            }, { passive: true });

            document.addEventListener('mouseout', (e) => {
                const video = e.target.closest('video');
                if (video?.closest('.project-visual')) {
                    this.handleVideoHover(video, false);
                }
            }, { passive: true });
        } else if (isCoarsePointer) {
            // Mobile touch behavior
            document.addEventListener('click', (e) => {
                const visual = e.target.closest('.project-visual');
                if (!visual) return;
                
                const video = visual.querySelector('video');
                if (!video) return;
                
                if (video.paused) {
                    video.play().catch(() => {});
                } else {
                    video.pause();
                }
            });
        }
    }

    handleVideoHover(video, isHovering) {
        if (isHovering) {
            if (video.src || video.querySelector('source[src]')) {
                if (video.readyState >= 2) {
                    video.play().catch(() => {});
                } else {
                    video.load();
                    video.addEventListener('canplay', () => video.play().catch(() => {}), { once: true });
                }
            }
            video.style.animation = 'playFade 0.4s ease-out';
            video.closest('.project-visual')?.querySelector('.project-hover')?.classList.add('active');
        } else {
            video.pause();
            try { video.currentTime = 0; } catch (err) {}
            video.style.animation = 'none';
            video.closest('.project-visual')?.querySelector('.project-hover')?.classList.remove('active');
        }
    }

    /**
     * Initialize parallax scroll effects for depth and motion
     */
    initParallaxScroll() {
        if (this.state.isReducedMotion) return;

        const parallaxElements = document.querySelectorAll('[data-parallax]');
        if (!parallaxElements.length) return;

        let scrollAnimationId;
        const handleParallaxScroll = () => {
            parallaxElements.forEach(el => {
                const speed = parseFloat(el.dataset.parallax) || 0.5;
                const scrolled = window.pageYOffset;
                const yPos = scrolled * speed;
                
                requestAnimationFrame(() => {
                    el.style.transform = `translateY(${yPos}px)`;
                });
            });
        };

        document.addEventListener('scroll', handleParallaxScroll, { passive: true });
    }

    /**
     * Scroll animations with Intersection Observer
     */
    initScrollAnimations() {
        if (!('IntersectionObserver' in window) || this.state.isReducedMotion) return;

        try {
            const groups = {};
            const selectors = ['.autoBlur', '.autoDisplay', '.fadeInRight', '.form-group', '.skill-card', '.project-card'];
            
            // Group elements by stagger group
            selectors.forEach(sel => {
                document.querySelectorAll(sel).forEach(el => {
                    const group = el.getAttribute('data-stagger-group') || `default-${sel.replace(/[^a-z]/g, '')}`;
                    if (!groups[group]) groups[group] = [];
                    groups[group].push(el);
                });
            });

            // Assign staggered delays
            const step = 0.08;
            Object.values(groups).forEach(groupEls => {
                groupEls.forEach((el, idx) => {
                    const existingDelay = el.style.getPropertyValue('--delay');
                    if (!existingDelay) {
                        el.style.setProperty('--delay', `${(idx * step).toFixed(2)}s`);
                    }
                });
            });

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in-view');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

            // Observe all grouped elements
            Object.values(groups).forEach(groupEls => {
                groupEls.forEach(el => observer.observe(el));
            });
        } catch (err) {
            console.warn('Scroll animations failed:', err);
        }
    }

    /**
     * 3D Skills Slider
     */
    initSkillSlider() {
        const slider = document.querySelector('.skills-slider');
        if (!slider) return;

        const items = document.querySelectorAll('.slider-item');
        const track = document.querySelector('.slider-track');
        const totalItems = items.length;

        items.forEach((item, idx) => {
            const angle = (360 / totalItems) * idx;
            item.style.setProperty('--angle', angle.toString());

            const delay = (idx * 0.3).toFixed(2);
            const duration = (Math.random() * 3 + 3).toFixed(2);

            item.style.setProperty('--delay', `${delay}s`);
            item.style.setProperty('--duration', `${duration}s`);

            const skill = item.getAttribute('data-skill');
            item.setAttribute('aria-label', `${skill} development skill`);

            // Interaction handlers
            const handleInteraction = (isActive) => {
                item.classList.toggle('hovered', isActive);
                track?.classList.toggle('paused', isActive);
            };

            item.addEventListener('mouseenter', () => handleInteraction(true));
            item.addEventListener('mouseleave', () => handleInteraction(false));
            item.addEventListener('focus', () => handleInteraction(true));
            item.addEventListener('blur', () => handleInteraction(false));

            // Keyboard interaction support
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleInteraction(true);
                }
            });

            item.addEventListener('keyup', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleInteraction(false);
                }
            });
        });

        // Start animations when in viewport
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        slider.classList.add('animate');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.2 });
            
            observer.observe(slider);
        }
    }

    /**
     * Initialize form animations with staggered reveals
     */
    initFormAnimations() {
        const formGroups = document.querySelectorAll('.form-group');
        if (!formGroups.length) return;

        const step = 0.1; // Stagger delay between each form group
        formGroups.forEach((group, idx) => {
            group.style.setProperty('--delay', `${(idx * step).toFixed(2)}s`);
        });

        const submitBtn = document.querySelector('.btn-submit');
        if (submitBtn) {
            submitBtn.style.setProperty('--delay', `${(formGroups.length * step).toFixed(2)}s`);
        }
    }

    /**
     * Initialize EmailJS
     * Configure with your public key from emailjs.com
     */
    initEmailJS() {
        // EmailJS credentials from emailjs.com dashboard
        const PUBLIC_KEY = 'z_lgbfOSm2ac8XI3v';
        
        if (PUBLIC_KEY && PUBLIC_KEY !== 'YOUR_PUBLIC_KEY_HERE') {
            emailjs.init(PUBLIC_KEY);
            // Store service and template IDs as class properties
            this.emailServiceID = 'service_a04dsep';
            this.emailTemplateID = 'template_8wh8a1p';
        }
    }

    /**
     * Contact form handling
     */
    async handleFormSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const fields = [
            { el: form.querySelector('#fullName'), name: 'from_name', required: true },
            { el: form.querySelector('#email'), name: 'from_email', required: true },
            { el: form.querySelector('#message'), name: 'message', required: true }
        ];

        // Clear previous states
        this.clearFormErrors(fields);
        this.elements.formStatus.textContent = '';

        // Validate
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        let hasError = false;

        for (const field of fields) {
            if (!field.el) continue;
            
            const value = field.el.value.trim();
            const errorElement = field.el.parentNode?.querySelector('.error-message');

            if (field.required && !value) {
                hasError = true;
                this.setFieldError(field.el, errorElement, 'This field is required.');
            } else if (field.name === 'from_email' && value && !emailPattern.test(value)) {
                hasError = true;
                this.setFieldError(field.el, errorElement, 'Please enter a valid email address.');
            }
        }

        if (hasError) {
            this.elements.formStatus.textContent = 'Please correct the highlighted fields.';
            return;
        }

        // Submit form
        try {
            this.elements.formStatus.textContent = 'Sending...';
            
            // Check if EmailJS is configured
            if (!this.emailServiceID || this.emailServiceID === 'YOUR_SERVICE_ID_HERE') {
                this.elements.formStatus.textContent = 'Email service not configured. Please contact via email.';
                console.warn('EmailJS not configured. Add your credentials to initEmailJS()');
                return;
            }

            // Send using EmailJS
            await emailjs.sendForm(
                this.emailServiceID,
                this.emailTemplateID,
                form
            );
            
            this.elements.formStatus.textContent = 'Message sent successfully! I\'ll get back to you soon.';
            form.reset();
        } catch (err) {
            console.error('EmailJS Error:', err);
            this.elements.formStatus.textContent = 'Failed to send message. Please try emailing directly at saaebkirkuk@gmail.com';
        }
    }

    clearFormErrors(fields) {
        fields.forEach(field => {
            if (!field.el) return;
            field.el.classList.remove('is-invalid');
            field.el.removeAttribute('aria-invalid');
            
            const errorElement = field.el.parentNode?.querySelector('.error-message');
            if (errorElement) errorElement.textContent = '';
        });
    }

    setFieldError(field, errorElement, message) {
        field.classList.add('is-invalid');
        field.setAttribute('aria-invalid', 'true');
        if (errorElement) errorElement.textContent = message;
    }

    /**
     * Utility: Smooth scrolling
     */
    smoothScrollTo(selector) {
        const target = document.querySelector(selector);
        if (!target) return;

        if (this.state.isReducedMotion) {
            target.scrollIntoView();
        } else {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        
        // Ensure focus for accessibility
        if (typeof target.focus === 'function') {
            target.focus({ preventScroll: true });
        }
    }

    /**
     * Handle project view button clicks
     */
    handleProjectView(projectId) {
        // Map project IDs to URLs or external links
        const projectLinks = {
            project1: 'https://github.com/saaeb1oq7/Java',
            project2: 'https://kis-web-tau.vercel.app',
            project3: 'https://isaacsand.itch.io/ciphers-please'
            // Add more projects as needed
        };

        const url = projectLinks[projectId];
        if (url) {
            window.open(url, '_blank', 'noopener,noreferrer');
        } else {
            console.warn('Project link not found for:', projectId);
        }
    }

    /**
     * Utility: Validate anchor links
     */
    isValidAnchor(href) {
        return href && href !== '#' && href !== '#!' && document.querySelector(href);
    }

    /**
     * Service Worker Registration
     * If registration fails, attempt to unregister any existing service workers to avoid stale/broken workers.
     */
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('service-worker.js')
                .then(async reg => {
                    console.log('Service Worker registered:', reg.scope);
                })
                .catch(async err => {
                    console.warn('Service Worker registration failed:', err);

                    // Try to unregister any existing service workers to clean up broken ones
                    try {
                        const regs = await navigator.serviceWorker.getRegistrations();
                        for (const r of regs) {
                            const result = await r.unregister();
                            console.log('Service Worker unregistered:', r.scope, result);
                        }
                    } catch (unregErr) {
                        console.warn('Failed to unregister service workers:', unregErr);
                    }
                });
        }
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new PortfolioApp();
});