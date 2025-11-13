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
        this.setupEventListeners();
        this.lazyLoadMedia();
        this.initScrollAnimations();
        this.initSkillSlider();
        
        // Defer non-critical initialization
        window.addEventListener('load', () => {
            this.registerServiceWorker();
        });
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
     * Lazy load videos with Intersection Observer
     */
    lazyLoadMedia() {
        const videos = document.querySelectorAll('video');
        if (!videos.length) return;

        const loadVideo = (videoEl) => {
            if (videoEl.dataset._loaded) return;

            const source = videoEl.querySelector('source[data-src]');
            const dataSrc = source?.getAttribute('data-src');
            
            if (dataSrc) {
                videoEl.classList.add('video-loading');
                // Assign src only to the <source> element, then call load() on the video element
                source.setAttribute('src', dataSrc);
                videoEl.load();

                const onCanPlay = () => {
                    videoEl.classList.remove('video-loading');
                    videoEl.classList.add('video-loaded');
                    videoEl.dataset._loaded = '1';
                    videoEl.removeEventListener('canplaythrough', onCanPlay);
                    
                    if (videoEl.getAttribute('data-autoplay') === 'true') {
                        videoEl.play().catch(() => {});
                    }
                };

                videoEl.addEventListener('canplaythrough', onCanPlay);
            }
        };

        if ('IntersectionObserver' in window) {
            const highPriorityObserver = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        loadVideo(entry.target);
                        obs.unobserve(entry.target);
                    }
                });
            }, { rootMargin: '400px' });

            const defaultObserver = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        loadVideo(entry.target);
                        obs.unobserve(entry.target);
                    }
                });
            }, { rootMargin: '200px' });

            videos.forEach(video => {
                const source = video.querySelector('source[data-src]');
                if (source) {
                    // Treat either data-priority="high" or fetchpriority="high" as high priority
                    const isHigh = video.getAttribute('data-priority') === 'high' || video.getAttribute('fetchpriority') === 'high';
                    if (isHigh) {
                        highPriorityObserver.observe(video);
                    } else {
                        defaultObserver.observe(video);
                    }
                }
            });
        } else {
            // Fallback for older browsers
            videos.forEach(video => {
                const source = video.querySelector('source[data-src]');
                const dataSrc = source?.getAttribute('data-src');
                if (dataSrc) {
                    // Set source src and load the video element — avoid assigning video.src directly to prevent redundant assignment
                    source.setAttribute('src', dataSrc);
                    video.load();
                }
            });
        }
    }

    /**
     * Video interaction handling
     */
    setupVideoInteractions() {
        const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

        if (!isCoarsePointer) {
            // Desktop hover behavior
            document.addEventListener('mouseover', (e) => {
                const video = e.target.closest('video');
                if (video?.closest('.project-visual')) {
                    this.handleVideoHover(video, true);
                }
            });

            document.addEventListener('mouseout', (e) => {
                const video = e.target.closest('video');
                if (video?.closest('.project-visual')) {
                    this.handleVideoHover(video, false);
                }
            });
        } else {
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
            video.closest('.project-visual').querySelector('.project-hover')?.classList.add('active');
        } else {
            video.pause();
            try { video.currentTime = 0; } catch (err) {}
            video.closest('.project-visual').querySelector('.project-hover')?.classList.remove('active');
        }
    }

    /**
     * Scroll animations with Intersection Observer
     */
    initScrollAnimations() {
        if (!('IntersectionObserver' in window) || this.state.isReducedMotion) return;

        try {
            const groups = {};
            const selectors = ['.autoBlur', '.autoDisplay', '.fadeInRight'];
            
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
                    el.style.setProperty('--delay', `${(idx * step).toFixed(2)}s`);
                });
            });

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in-view');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.2 });

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
     * Contact form handling
     */
    async handleFormSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const fields = [
            { el: form.querySelector('#fullName'), name: 'name', required: true },
            { el: form.querySelector('#email'), name: 'email', required: true },
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
            } else if (field.name === 'email' && value && !emailPattern.test(value)) {
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
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 800));
            
            this.elements.formStatus.textContent = 'Message sent — thank you!';
            form.reset();
        } catch (err) {
            this.elements.formStatus.textContent = 'Failed to send message. Please try again later.';
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
            project1: 'https://github.com/saaeb1oq7/GameProject',
            project2: 'https://github.com/saaeb1oq7/Portfolio2.0',
            project3: 'https://github.com/saaeb1oq7'
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
     */
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('service-worker.js')
                .then(reg => {
                    console.log('Service Worker registered:', reg.scope);
                })
                .catch(err => {
                    console.warn('Service Worker registration failed:', err);
                });
        }
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new PortfolioApp();
});