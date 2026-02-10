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
        this.initPageLoadSequence();
        this.initScrollAnimations();
        this.initParallaxScroll();
        this.initSkillSlider();
        try { this.initTechItemTilt(); } catch (err) { console.warn('initTechItemTilt failed', err); }
        try { this.initUniversal3DTilt(); } catch (err) { console.warn('initUniversal3DTilt failed', err); }
        this.initSkillReveal();
        this.initFormAnimations();
        this.initEmailJS();
        
        // Defer non-critical initialization
        window.addEventListener('load', () => {
            this.registerServiceWorker();
        });
    }

    /**
     * Page Load Sequence: Staggered animations on initial page load
     * Creates a polished first impression with orchestrated reveals
     */
    initPageLoadSequence() {
        if (this.state.isReducedMotion) return;

        try {
            // Header fade-in (0.3s delay)
            const header = document.querySelector('header');
            if (header) {
                header.style.setProperty('--delay', '0.3s');
                header.classList.add('fadeIn');
            }

            // Hero content slide-in (0.5s delay)
            const heroContent = document.querySelector('.hero-content');
            if (heroContent) {
                heroContent.style.setProperty('--delay', '0.5s');
                heroContent.classList.add('slideInDown');
            }

            // Background video reveal (0.7s delay) if present
            const videoBg = document.querySelector('.hero-bg-video');
            if (videoBg) {
                videoBg.style.setProperty('--delay', '0.7s');
                videoBg.classList.add('fadeIn');
            }

            // Hero badge with scale bounce (0.65s delay)
            const heroBadge = document.querySelector('.hero-badge');
            if (heroBadge) {
                heroBadge.style.setProperty('--delay', '0.65s');
                heroBadge.classList.add('scaleBounce');
            }

            // Scroll indicator bounce (1.0s delay)
            const scrollIndicator = document.querySelector('.scroll-down');
            if (scrollIndicator) {
                scrollIndicator.style.setProperty('--delay', '1.0s');
                scrollIndicator.classList.add('bounce');
            }
        } catch (err) {
            console.warn('Page load sequence failed:', err);
        }
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
     * Enhanced with number counter and particle effects
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
                
                // Increased stagger timing: 80ms → 120ms
                const staggerDelay = i * 120;
                
                setTimeout(() => {
                    // Animate bar width with elastic easing
                    bar.style.animation = `elasticFill 0.8s var(--ease-elastic) forwards`;
                    bar.style.width = final;
                    bar.setAttribute('aria-valuenow', String(num));

                    // Number counter animation
                    const parentItem = bar.closest('.skill-item');
                    const skillLevelEl = parentItem?.querySelector('.skill-level');
                    
                    // Animate number counter from 0 to target
                    if (skillLevelEl && num > 0) {
                        const duration = 800; // Match bar animation duration
                        const start = performance.now();
                        const animateCounter = (now) => {
                            const elapsed = now - start;
                            const progress = Math.min(elapsed / duration, 1);
                            const current = Math.floor(progress * num);
                            skillLevelEl.textContent = `${current}%`;
                            
                            if (progress < 1) {
                                requestAnimationFrame(animateCounter);
                            } else {
                                skillLevelEl.textContent = final;
                                
                                // Particle burst effect when complete
                                this.createParticleBurst(bar);
                            }
                        };
                        requestAnimationFrame(animateCounter);
                    }

                    // Insert/update label inside bar for better readability
                    if (num >= 12) {
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
                }, staggerDelay);
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
     * Create particle burst effect at bar completion
     * @param {HTMLElement} bar - The skill progress bar element
     */
    createParticleBurst(bar) {
        if (this.state.isReducedMotion) return;
        
        const rect = bar.getBoundingClientRect();
        const container = bar.closest('.skill-item');
        
        if (!container) return;

        // Create 6-8 particles
        const particleCount = Math.floor(Math.random() * 3) + 6;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'skill-particle';
            particle.style.position = 'absolute';
            particle.style.pointerEvents = 'none';
            particle.style.left = `${rect.width - 20}px`;
            particle.style.top = `${rect.height / 2}px`;
            particle.style.width = '6px';
            particle.style.height = '6px';
            particle.style.backgroundColor = 'rgba(114, 161, 222, 0.8)';
            particle.style.borderRadius = '50%';
            particle.style.willChange = 'transform, opacity';
            
            container.appendChild(particle);
            
            // Random burst direction
            const angle = (i / particleCount) * Math.PI * 2 + (Math.random() - 0.5);
            const velocity = 4 + Math.random() * 6;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;
            
            let x = 0, y = 0;
            const duration = 600;
            const start = performance.now();
            
            const animate = (now) => {
                const elapsed = now - start;
                const progress = elapsed / duration;
                
                if (progress < 1) {
                    x += vx;
                    y += vy;
                    const opacity = 1 - progress;
                    particle.style.transform = `translate(${x}px, ${y}px)`;
                    particle.style.opacity = String(opacity);
                    requestAnimationFrame(animate);
                } else {
                    particle.remove();
                }
            };
            
            requestAnimationFrame(animate);
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

        // Header scroll effects
        this.setupHeaderScrollEffects();
    }

    /**
     * Header scroll effects: Enhance background blur and color on scroll
     */
    setupHeaderScrollEffects() {
        const header = document.querySelector('.site-header');
        if (!header || this.state.isReducedMotion) return;

        let ticking = false;
        const updateHeaderOnScroll = () => {
            const scrollY = window.scrollY;
            const maxScroll = 150;
            const scrollProgress = Math.min(scrollY / maxScroll, 1);

            // Increase blur amount based on scroll position
            const blurAmount = scrollProgress * 12;
            const opacity = 0.6 + (scrollProgress * 0.25);
            
            header.style.backdropFilter = `blur(${blurAmount}px)`;
            header.style.background = `linear-gradient(180deg, rgba(5, 0, 20, ${opacity}), transparent)`;
            header.style.boxShadow = scrollProgress > 0.1 
                ? `0 4px 20px rgba(0, 0, 0, ${scrollProgress * 0.4})` 
                : 'none';
            
            ticking = false;
        };

        const requestTick = () => {
            if (!ticking) {
                window.requestAnimationFrame(updateHeaderOnScroll);
                ticking = true;
            }
        };

        window.addEventListener('scroll', requestTick, { passive: true });
    }

    /**
     * Video interactions
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
                    
                    // Speed up hero video for better pacing (user requested 3.5x)
                    if (videoEl.classList.contains('hero-video')) {
                        try {
                            videoEl.playbackRate = 3.5;
                        } catch (err) {
                            // ignore if playbackRate cannot be set on this platform
                        }
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
            // Expanded selectors including new animation classes
            const selectors = [
                '.autoBlur', '.autoDisplay', '.fadeInRight', 
                '.form-group', '.skill-card', '.project-card',
                '.slideInLeft', '.slideInRight', '.scaleIn', '.rotateIn', '.blurFadeIn'
            ];
            
            // Group elements by stagger group
            selectors.forEach(sel => {
                document.querySelectorAll(sel).forEach(el => {
                    const group = el.getAttribute('data-stagger-group') || `default-${sel.replace(/[^a-z]/g, '')}`;
                    if (!groups[group]) groups[group] = [];
                    groups[group].push(el);
                });
            });

            // Assign staggered delays with increased timing (120ms = 0.12s)
            const step = 0.12;
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

    initTechItemTilt() {
        if (this.state.isReducedMotion) return;

        const isTouch = window.matchMedia('(pointer: coarse)').matches;
        const items = Array.from(document.querySelectorAll('.tech-item'));
        if (!items.length) return;

        if (isTouch) {
            // Simple tap feedback for touch devices
            items.forEach(el => {
                el.addEventListener('touchstart', () => {
                    el.style.transition = 'transform 0.18s ease';
                    el.style.transform = 'scale(1.05)';
                    setTimeout(() => {
                        el.style.transform = '';
                        el.style.transition = '';
                    }, 180);
                }, { passive: true });
            });
            return;
        }

        items.forEach(el => {
            let rafId = null;
            let rect = null;

            const resetProps = () => {
                el.style.setProperty('--rotateX', '0deg');
                el.style.setProperty('--rotateY', '0deg');
                el.style.setProperty('--shine-x', '50%');
                el.style.setProperty('--shine-y', '50%');
            };

            const onEnter = () => {
                rect = el.getBoundingClientRect();
            };

            const onMove = (evt) => {
                const e = evt.touches ? evt.touches[0] : evt;
                if (!rect) rect = el.getBoundingClientRect();

                const relX = (e.clientX - rect.left);
                const relY = (e.clientY - rect.top);
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = Math.max(Math.min(((relY - centerY) / rect.height) * -20, 20), -20);
                const rotateY = Math.max(Math.min(((relX - centerX) / rect.width) * 20, 20), -20);

                const shineX = (relX / rect.width) * 100;
                const shineY = (relY / rect.height) * 100;

                if (rafId) cancelAnimationFrame(rafId);
                rafId = requestAnimationFrame(() => {
                    el.style.setProperty('--rotateX', `${rotateX}deg`);
                    el.style.setProperty('--rotateY', `${rotateY}deg`);
                    el.style.setProperty('--shine-x', `${shineX}%`);
                    el.style.setProperty('--shine-y', `${shineY}%`);
                });
            };

            const onLeave = () => {
                if (rafId) cancelAnimationFrame(rafId);
                // smooth settle
                el.style.transition = 'transform 0.4s var(--ease-smooth)';
                resetProps();
                setTimeout(() => { el.style.transition = ''; }, 400);
            };

            el.addEventListener('mouseenter', onEnter);
            el.addEventListener('mousemove', onMove);
            el.addEventListener('mouseleave', onLeave);

            // keyboard accessibility: reset on blur
            el.addEventListener('blur', resetProps);
        });
    }

    initUniversal3DTilt() {
        if (this.state.isReducedMotion) return;

        const isTouch = window.matchMedia('(pointer: coarse)').matches;

        // Configuration: selector -> intensity (degrees)
        const config = {
            '.tech-item': 20,
            '.btn': 15,
            '.skill-card': 10,
            '.project-card': 10,
            '.hero-visual': 8,
            '.hero-info': 6,
            '.about-hero': 8,
            '.about-hero-avatar': 10,
            '.contact-links a': 8,
            '.contact-social a': 8,
            '.form-group input': 6,
            '.form-group textarea': 6
        };

        const elems = [];
        Object.keys(config).forEach(sel => {
            document.querySelectorAll(sel).forEach(el => elems.push({ el, intensity: config[sel] }));
        });

        if (!elems.length) return;

        // Touch devices: simple tap feedback only
        if (isTouch) {
            elems.forEach(({ el }) => {
                el.addEventListener('touchstart', () => {
                    el.style.transition = 'transform 0.18s ease';
                    el.style.transform = 'scale(1.03)';
                    setTimeout(() => { el.style.transform = ''; el.style.transition = ''; }, 180);
                }, { passive: true });
            });
            return;
        }

        elems.forEach(({ el, intensity }) => {
            let raf = null;
            let rect = null;

            const reset = () => {
                el.style.setProperty('--rotateX', '0deg');
                el.style.setProperty('--rotateY', '0deg');
                el.style.setProperty('--shine-x', '50%');
                el.style.setProperty('--shine-y', '50%');
            };

            const onEnter = () => { rect = el.getBoundingClientRect(); };

            const onMove = (evt) => {
                const e = evt.touches ? evt.touches[0] : evt;
                if (!rect) rect = el.getBoundingClientRect();

                const relX = e.clientX - rect.left;
                const relY = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = Math.max(Math.min(((relY - centerY) / rect.height) * -intensity, intensity), -intensity);
                const rotateY = Math.max(Math.min(((relX - centerX) / rect.width) * intensity, intensity), -intensity);

                const shineX = (relX / rect.width) * 100;
                const shineY = (relY / rect.height) * 100;

                if (raf) cancelAnimationFrame(raf);
                raf = requestAnimationFrame(() => {
                    el.style.setProperty('--rotateX', `${rotateX}deg`);
                    el.style.setProperty('--rotateY', `${rotateY}deg`);
                    el.style.setProperty('--shine-x', `${shineX}%`);
                    el.style.setProperty('--shine-y', `${shineY}%`);
                });
            };

            const onLeave = () => {
                if (raf) cancelAnimationFrame(raf);
                el.style.transition = 'transform 0.35s var(--ease-smooth)';
                reset();
                setTimeout(() => { el.style.transition = ''; }, 350);
            };

            el.addEventListener('mouseenter', onEnter);
            el.addEventListener('mousemove', onMove);
            el.addEventListener('mouseleave', onLeave);
            el.addEventListener('blur', reset);
        });
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
            
            // Add floating label animation on input/textarea focus
            const input = group.querySelector('input, textarea, select');
            if (input) {
                input.addEventListener('focus', () => {
                    group.classList.add('input-focused');
                });
                
                input.addEventListener('blur', () => {
                    if (!input.value.trim()) {
                        group.classList.remove('input-focused');
                    }
                });
                
                // Maintain focus state if field has value on load
                if (input.value.trim()) {
                    group.classList.add('input-focused');
                }
            }
        });

        const submitBtn = document.querySelector('.btn-submit');
        if (submitBtn) {
            submitBtn.style.setProperty('--delay', `${(formGroups.length * step).toFixed(2)}s`);
            
            // Add spinner animation on submit
            submitBtn.addEventListener('click', () => {
                if (!submitBtn.disabled) {
                    submitBtn.classList.add('btn-loading');
                }
            });
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
        this.elements.formStatus.className = '';

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
            this.elements.formStatus.className = 'form-status-error';
            return;
        }

        // Submit form
        try {
            const submitBtn = form.querySelector('.btn-submit');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.classList.add('btn-loading');
            }
            
            this.elements.formStatus.textContent = 'Sending...';
            this.elements.formStatus.className = 'form-status-loading';
            
            // Check if EmailJS is configured
            if (!this.emailServiceID || this.emailServiceID === 'YOUR_SERVICE_ID_HERE') {
                this.elements.formStatus.textContent = 'Email service not configured. Please contact via email.';
                this.elements.formStatus.className = 'form-status-error';
                console.warn('EmailJS not configured. Add your credentials to initEmailJS()');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('btn-loading');
                }
                return;
            }

            // Send using EmailJS
            await emailjs.sendForm(
                this.emailServiceID,
                this.emailTemplateID,
                form
            );
            
            // Success state with animation
            this.elements.formStatus.textContent = '✓ Message sent successfully! I\'ll get back to you soon.';
            this.elements.formStatus.className = 'form-status-success';
            this.elements.formStatus.style.animation = 'slideInDown 0.5s var(--ease-smooth)';
            
            form.reset();
            
            // Clear form focused states
            fields.forEach(field => {
                if (field.el) {
                    const group = field.el.closest('.form-group');
                    if (group) {
                        group.classList.remove('input-focused');
                    }
                }
            });
            
            // Reset button state
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.classList.remove('btn-loading');
            }
            
            // Clear success message after 5 seconds
            setTimeout(() => {
                this.elements.formStatus.textContent = '';
                this.elements.formStatus.className = '';
                this.elements.formStatus.style.animation = '';
            }, 5000);
            
        } catch (err) {
            console.error('EmailJS Error:', err);
            
            // Error state with animation
            this.elements.formStatus.textContent = '✗ Failed to send message. Please try emailing directly.';
            this.elements.formStatus.className = 'form-status-error';
            this.elements.formStatus.style.animation = 'shake 0.4s var(--ease-smooth)';
            
            const submitBtn = form.querySelector('.btn-submit');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.classList.remove('btn-loading');
            }
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
        
        // Add shake animation for validation error
        field.style.animation = 'shake 0.4s var(--ease-smooth)';
        
        // Reset animation after it completes
        setTimeout(() => {
            field.style.animation = '';
        }, 400);
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.animation = 'fadeIn 0.3s var(--ease-smooth)';
        }
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