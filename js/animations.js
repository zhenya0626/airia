// Animation controller for AiRia website

const ScrollAnimations = {
    observers: [],
    
    init() {
        this.setupScrollReveal();
        this.setupParallax();
        this.setupHeaderAnimation();
        this.setupPageTransitions();
    },

    setupScrollReveal() {
        // Create intersection observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    // Optionally unobserve after animation
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe all elements with scroll-reveal classes
        const revealElements = document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right');
        revealElements.forEach(element => {
            observer.observe(element);
        });

        this.observers.push(observer);
    },

    setupParallax() {
        const parallaxElements = document.querySelectorAll('.parallax');
        if (parallaxElements.length === 0) return;

        const handleScroll = this.throttle(() => {
            const scrollTop = window.pageYOffset;
            
            parallaxElements.forEach(element => {
                const speed = element.dataset.speed || 0.5;
                const yPos = -(scrollTop * speed);
                element.style.transform = `translate3d(0, ${yPos}px, 0)`;
            });
        }, 16); // ~60fps

        window.addEventListener('scroll', handleScroll);
        
        // Store reference for cleanup
        this.scrollHandler = handleScroll;
    },

    setupHeaderAnimation() {
        const header = document.querySelector('.header');
        if (!header) return;

        let lastScrollTop = 0;
        let isScrollingDown = false;

        const handleScroll = this.throttle(() => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                // Scrolling down
                if (!isScrollingDown) {
                    header.classList.add('header-hidden');
                    isScrollingDown = true;
                }
            } else {
                // Scrolling up
                if (isScrollingDown) {
                    header.classList.remove('header-hidden');
                    isScrollingDown = false;
                }
            }

            // Add background when scrolled
            if (scrollTop > 50) {
                header.classList.add('header-scrolled');
            } else {
                header.classList.remove('header-scrolled');
            }

            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        }, 16);

        window.addEventListener('scroll', handleScroll);
        
        // Store reference for cleanup
        this.headerScrollHandler = handleScroll;
    },

    setupPageTransitions() {
        // Add page transition animations
        document.body.classList.add('page-transition');
        
        // Animate page load
        window.addEventListener('load', () => {
            setTimeout(() => {
                document.body.classList.add('page-loaded');
            }, 100);
        });

        // Handle link clicks for smooth transitions
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href && !link.target && !link.href.startsWith('mailto:') && !link.href.startsWith('tel:')) {
                // Check if it's an internal link
                if (link.hostname === window.location.hostname) {
                    e.preventDefault();
                    this.transitionToPage(link.href);
                }
            }
        });
    },

    transitionToPage(url) {
        document.body.classList.add('page-transitioning');
        
        setTimeout(() => {
            window.location.href = url;
        }, 300);
    },

    // Animation utility functions
    animateCountUp(element, target, duration = 2000) {
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current);
        }, 16);
    },

    animateTypewriter(element, text, speed = 100) {
        element.textContent = '';
        let i = 0;
        
        const timer = setInterval(() => {
            element.textContent += text.charAt(i);
            i++;
            if (i > text.length) {
                clearInterval(timer);
            }
        }, speed);
    },

    fadeIn(element, duration = 500) {
        element.style.opacity = '0';
        element.style.display = 'block';
        
        const start = performance.now();
        
        const fade = (timestamp) => {
            const progress = (timestamp - start) / duration;
            element.style.opacity = Math.min(progress, 1);
            
            if (progress < 1) {
                requestAnimationFrame(fade);
            }
        };
        
        requestAnimationFrame(fade);
    },

    fadeOut(element, duration = 500) {
        const start = performance.now();
        const startOpacity = parseFloat(getComputedStyle(element).opacity);
        
        const fade = (timestamp) => {
            const progress = (timestamp - start) / duration;
            element.style.opacity = startOpacity * (1 - Math.min(progress, 1));
            
            if (progress >= 1) {
                element.style.display = 'none';
            } else {
                requestAnimationFrame(fade);
            }
        };
        
        requestAnimationFrame(fade);
    },

    slideUp(element, duration = 500) {
        element.style.height = element.scrollHeight + 'px';
        element.style.overflow = 'hidden';
        element.style.transition = `height ${duration}ms ease-out`;
        
        requestAnimationFrame(() => {
            element.style.height = '0px';
        });
        
        setTimeout(() => {
            element.style.display = 'none';
            element.style.height = '';
            element.style.overflow = '';
            element.style.transition = '';
        }, duration);
    },

    slideDown(element, duration = 500) {
        element.style.display = 'block';
        element.style.height = '0px';
        element.style.overflow = 'hidden';
        element.style.transition = `height ${duration}ms ease-out`;
        
        const targetHeight = element.scrollHeight + 'px';
        
        requestAnimationFrame(() => {
            element.style.height = targetHeight;
        });
        
        setTimeout(() => {
            element.style.height = '';
            element.style.overflow = '';
            element.style.transition = '';
        }, duration);
    },

    // Utility functions
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    debounce(func, delay) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    },

    // Loading animations
    showLoadingSpinner(container) {
        container.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
            </div>
        `;
    },

    hideLoadingSpinner(container) {
        const loading = container.querySelector('.loading');
        if (loading) {
            this.fadeOut(loading);
        }
    },

    // Card animations
    animateCards() {
        const cards = document.querySelectorAll('.member-card, .event-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('animate-fadeInUp');
        });
    },

    // Hero section animations
    animateHero() {
        const heroTitle = document.querySelector('.hero-title');
        const heroSubtitle = document.querySelector('.hero-subtitle');
        const heroDescription = document.querySelector('.hero-description');

        if (heroTitle) {
            heroTitle.classList.add('animate-fadeInUp');
        }
        if (heroSubtitle) {
            heroSubtitle.style.animationDelay = '0.2s';
            heroSubtitle.classList.add('animate-fadeInUp');
        }
        if (heroDescription) {
            heroDescription.style.animationDelay = '0.4s';
            heroDescription.classList.add('animate-fadeInUp');
        }
    },

    // Navigation animations
    animateNavigation() {
        const nav = document.querySelector('.nav');
        if (nav) {
            nav.classList.add('animate-slideDown');
        }

        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach((link, index) => {
            link.style.animationDelay = `${0.1 + (index * 0.1)}s`;
            link.classList.add('animate-fadeIn');
        });
    },

    // Social links animation
    animateSocialLinks() {
        const socialItems = document.querySelectorAll('.social-item');
        socialItems.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.15}s`;
            item.classList.add('animate-fadeInUp');
        });
    },

    // Cleanup function
    destroy() {
        // Remove event listeners
        if (this.scrollHandler) {
            window.removeEventListener('scroll', this.scrollHandler);
        }
        if (this.headerScrollHandler) {
            window.removeEventListener('scroll', this.headerScrollHandler);
        }

        // Disconnect observers
        this.observers.forEach(observer => observer.disconnect());
        this.observers = [];
    },

    // Performance monitoring
    measurePerformance(name, fn) {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        console.log(`${name} took ${end - start} milliseconds`);
        return result;
    }
};

// Mouse follower effect (optional enhancement)
const MouseFollower = {
    follower: null,
    
    init() {
        this.createFollower();
        this.setupEventListeners();
    },

    createFollower() {
        this.follower = document.createElement('div');
        this.follower.className = 'mouse-follower';
        this.follower.style.cssText = `
            position: fixed;
            width: 20px;
            height: 20px;
            background: radial-gradient(circle, rgba(255, 107, 157, 0.8), rgba(168, 85, 247, 0.8));
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            transition: transform 0.1s ease-out;
            transform: translate(-50%, -50%);
            opacity: 0;
        `;
        document.body.appendChild(this.follower);
    },

    setupEventListeners() {
        document.addEventListener('mousemove', (e) => {
            this.follower.style.left = e.clientX + 'px';
            this.follower.style.top = e.clientY + 'px';
            this.follower.style.opacity = '1';
        });

        document.addEventListener('mouseenter', () => {
            this.follower.style.opacity = '1';
        });

        document.addEventListener('mouseleave', () => {
            this.follower.style.opacity = '0';
        });

        // Scale up on interactive elements
        document.addEventListener('mouseover', (e) => {
            if (e.target.matches('a, button, .interactive')) {
                this.follower.style.transform = 'translate(-50%, -50%) scale(1.5)';
            }
        });

        document.addEventListener('mouseout', (e) => {
            if (e.target.matches('a, button, .interactive')) {
                this.follower.style.transform = 'translate(-50%, -50%) scale(1)';
            }
        });
    }
};

// CSS animations for performance
const performanceStyles = `
.header-hidden {
    transform: translateY(-100%);
    transition: transform 0.3s ease-out;
}

.header-scrolled {
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(20px);
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
}

.page-transition {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.4s ease, transform 0.4s ease;
}

.page-loaded {
    opacity: 1;
    transform: translateY(0);
}

.page-transitioning {
    opacity: 0;
    transform: translateY(-20px);
}

/* Smooth scrolling for all browsers */
html {
    scroll-behavior: smooth;
}

/* Hardware acceleration for animated elements */
.hero-gradient,
.member-card,
.event-card,
.social-icon {
    transform: translate3d(0, 0, 0);
    will-change: transform;
}

/* Reduce animations on slower devices */
@media (prefers-reduced-motion: reduce) {
    .scroll-reveal,
    .scroll-reveal-left,
    .scroll-reveal-right {
        opacity: 1 !important;
        transform: none !important;
    }
}
`;

// Initialize animations when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    ScrollAnimations.init();
    
    // Optional: Enable mouse follower on desktop
    if (window.innerWidth > 768) {
        MouseFollower.init();
    }
});

// Handle page visibility changes for performance
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
        // Pause animations when page is not visible
        document.body.classList.add('animations-paused');
    } else {
        // Resume animations when page becomes visible
        document.body.classList.remove('animations-paused');
    }
});

// Export for external use
if (typeof window !== 'undefined') {
    window.ScrollAnimations = ScrollAnimations;
    window.MouseFollower = MouseFollower;
}