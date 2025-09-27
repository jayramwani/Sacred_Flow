// Sacred Flow Presentation Script
class SacredFlowPresentation {
    constructor() {
        this.currentSlide = 0;
        this.totalSlides = 10;
        this.slides = document.querySelectorAll('.slide');
        this.indicators = document.querySelectorAll('.indicator');
        this.progressFill = document.querySelector('.progress-fill');
        this.nextBtn = document.getElementById('nextBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.isAnimating = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateProgress();
        this.animateCurrentSlide();
        this.preloadSlides();
    }

    setupEventListeners() {
        // Navigation buttons
        this.nextBtn.addEventListener('click', () => this.nextSlide());
        this.prevBtn.addEventListener('click', () => this.prevSlide());

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (this.isAnimating) return;
            
            if (e.key === 'ArrowRight' || e.key === ' ') {
                e.preventDefault();
                this.nextSlide();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.prevSlide();
            } else if (e.key === 'Home') {
                e.preventDefault();
                this.goToSlide(0);
            } else if (e.key === 'End') {
                e.preventDefault();
                this.goToSlide(this.totalSlides - 1);
            }
        });

        // Indicator clicks
        this.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                if (!this.isAnimating) {
                    this.goToSlide(index);
                }
            });
        });

        // Touch/swipe support
        this.setupTouchNavigation();

        // Auto-animate elements when slide becomes active
        this.setupIntersectionObserver();

        // Window resize handler
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));
    }

    setupTouchNavigation() {
        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;

        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            if (this.isAnimating) return;
            
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;
            this.handleSwipe(startX, startY, endX, endY);
        }, { passive: true });
    }

    handleSwipe(startX, startY, endX, endY) {
        const threshold = 50;
        const diffX = startX - endX;
        const diffY = startY - endY;

        // Only handle horizontal swipes if they're more significant than vertical
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > threshold) {
            if (diffX > 0) {
                this.nextSlide();
            } else {
                this.prevSlide();
            }
        }
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.target.classList.contains('active')) {
                    this.animateSlideElements(entry.target);
                }
            });
        }, { threshold: 0.1 });

        this.slides.forEach(slide => observer.observe(slide));
    }

    nextSlide() {
        if (this.currentSlide < this.totalSlides - 1) {
            this.goToSlide(this.currentSlide + 1);
        }
    }

    prevSlide() {
        if (this.currentSlide > 0) {
            this.goToSlide(this.currentSlide - 1);
        }
    }

    goToSlide(slideIndex) {
        if (slideIndex >= 0 && slideIndex < this.totalSlides && !this.isAnimating) {
            this.isAnimating = true;
            
            // Remove active class from current slide and indicator
            this.slides[this.currentSlide].classList.remove('active');
            this.indicators[this.currentSlide].classList.remove('active');

            // Add prev class to current slide for exit animation
            if (slideIndex > this.currentSlide) {
                this.slides[this.currentSlide].classList.add('prev');
            }

            // Update current slide
            this.currentSlide = slideIndex;

            // Add active class to new slide and indicator
            this.slides[this.currentSlide].classList.add('active');
            this.indicators[this.currentSlide].classList.add('active');

            // Clean up prev classes and reset animation flag after transition
            setTimeout(() => {
                this.slides.forEach(slide => slide.classList.remove('prev'));
                this.isAnimating = false;
            }, 1000);

            // Update progress and animate elements
            this.updateProgress();
            this.updateNavButtons();
            this.animateCurrentSlide();
            
            // Add ripple effect to clicked indicator
            this.addRippleEffect(this.indicators[slideIndex]);
        }
    }

    updateProgress() {
        const progress = ((this.currentSlide + 1) / this.totalSlides) * 100;
        this.progressFill.style.width = `${progress}%`;
    }

    updateNavButtons() {
        // Update button states
        this.prevBtn.style.opacity = this.currentSlide === 0 ? '0.5' : '1';
        this.nextBtn.style.opacity = this.currentSlide === this.totalSlides - 1 ? '0.5' : '1';
        this.prevBtn.style.pointerEvents = this.currentSlide === 0 ? 'none' : 'auto';
        this.nextBtn.style.pointerEvents = this.currentSlide === this.totalSlides - 1 ? 'none' : 'auto';
        
        // Update button text for last slide
        if (this.currentSlide === this.totalSlides - 1) {
            this.nextBtn.innerHTML = '<span>Restart</span><span>↻</span>';
            this.nextBtn.style.pointerEvents = 'auto';
            this.nextBtn.style.opacity = '1';
            this.nextBtn.onclick = () => this.goToSlide(0);
        } else {
            this.nextBtn.innerHTML = '<span>Next</span><span>→</span>';
            this.nextBtn.onclick = () => this.nextSlide();
        }
    }

    animateCurrentSlide() {
        const currentSlideElement = this.slides[this.currentSlide];
        this.animateSlideElements(currentSlideElement);
    }

    animateSlideElements(slide) {
        const animatedElements = slide.querySelectorAll('[data-animation]');
        
        // Reset all animations first
        animatedElements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = this.getInitialTransform(element.dataset.animation);
            element.classList.remove(`animate-${element.dataset.animation}`);
        });

        // Trigger animations with staggered delays
        animatedElements.forEach((element, index) => {
            const animation = element.dataset.animation;
            const delay = parseInt(element.dataset.delay) || (index * 150);
            
            setTimeout(() => {
                element.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                element.style.opacity = '1';
                element.style.transform = 'translate3d(0, 0, 0) scale(1)';
                
                // Add animation class for CSS animations
                element.classList.add(`animate-${animation}`);
            }, delay);
        });

        // Animate stat numbers with counting effect
        this.animateStatNumbers(slide);
        
        // Add special effects for specific slides
        this.addSlideSpecificEffects(slide);
    }

    getInitialTransform(animation) {
        const transforms = {
            'fade-up': 'translate3d(0, 50px, 0)',
            'slide-left': 'translate3d(-50px, 0, 0)',
            'slide-right': 'translate3d(50px, 0, 0)',
            'slide-up': 'translate3d(0, 50px, 0)',
            'scale-up': 'translate3d(0, 0, 0) scale(0.8)'
        };
        return transforms[animation] || 'translate3d(0, 30px, 0)';
    }

    animateStatNumbers(slide) {
        const statNumbers = slide.querySelectorAll('.stat-number');
        
        statNumbers.forEach((stat, index) => {
            const finalText = stat.textContent;
            const isPercentage = finalText.includes('%');
            const isCurrency = finalText.includes('₹');
            const hasPlus = finalText.includes('+');
            
            // Extract numeric value
            let numericValue = parseInt(finalText.replace(/[^\d]/g, ''));
            if (isNaN(numericValue)) numericValue = 0;
            
            let currentValue = 0;
            const increment = numericValue / 60; // 60 steps for smooth animation
            const delay = index * 300;
            
            setTimeout(() => {
                const counter = setInterval(() => {
                    currentValue += increment;
                    if (currentValue >= numericValue) {
                        currentValue = numericValue;
                        clearInterval(counter);
                    }
                    
                    let displayValue = Math.floor(currentValue);
                    
                    // Format the display value
                    if (isCurrency) {
                        if (displayValue >= 1000) {
                            displayValue = `₹${(displayValue / 1000).toFixed(0)},000Cr`;
                        } else {
                            displayValue = `₹${displayValue}Cr`;
                        }
                    } else if (displayValue >= 1000000) {
                        displayValue = `${Math.floor(displayValue / 1000000)}M${hasPlus ? '+' : ''}`;
                    } else if (displayValue >= 1000) {
                        displayValue = `${Math.floor(displayValue / 1000)}K${hasPlus ? '+' : ''}`;
                    } else {
                        displayValue = `${displayValue}${isPercentage ? '%' : ''}${hasPlus ? '+' : ''}`;
                    }
                    
                    stat.textContent = displayValue;
                }, 50);
            }, delay);
        });
    }

    addSlideSpecificEffects(slide) {
        const slideIndex = parseInt(slide.dataset.slide);
        
        switch (slideIndex) {
            case 0: // Title slide
                this.addFloatingParticles();
                break;
            case 8: // Demo slide
                this.animatePhoneScreen(slide);
                break;
            case 9: // CTA slide
                this.addCelebrationEffect();
                break;
        }
    }

    addFloatingParticles() {
        const particleCount = 20;
        const container = document.body;
        
        for (let i = 0; i < particleCount; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'floating-particle';
                particle.style.cssText = `
                    position: fixed;
                    width: 4px;
                    height: 4px;
                    background: rgba(255, 215, 0, 0.6);
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 1;
                    left: ${Math.random() * window.innerWidth}px;
                    top: ${window.innerHeight + 10}px;
                    animation: floatUp 4s linear forwards;
                `;
                
                container.appendChild(particle);
                
                setTimeout(() => {
                    particle.remove();
                }, 4000);
            }, i * 200);
        }
    }

    animatePhoneScreen(slide) {
        const phoneScreen = slide.querySelector('.phone-screen');
        if (phoneScreen) {
            setTimeout(() => {
                phoneScreen.style.animation = 'screenGlow 2s ease-in-out infinite alternate';
            }, 1000);
        }
    }

    addCelebrationEffect() {
        // Create confetti effect
        const colors = ['#ffd700', '#ff6b35', '#ff9933', '#dc2626'];
        const confettiCount = 50;
        
        for (let i = 0; i < confettiCount; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.cssText = `
                    position: fixed;
                    width: 8px;
                    height: 8px;
                    background: ${colors[Math.floor(Math.random() * colors.length)]};
                    left: ${Math.random() * window.innerWidth}px;
                    top: -10px;
                    z-index: 1000;
                    animation: confettiFall 3s linear forwards;
                    transform: rotate(${Math.random() * 360}deg);
                `;
                
                document.body.appendChild(confetti);
                
                setTimeout(() => {
                    confetti.remove();
                }, 3000);
            }, i * 50);
        }
    }

    addRippleEffect(element) {
        const ripple = document.createElement('div');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${rect.width / 2 - size / 2}px;
            top: ${rect.height / 2 - size / 2}px;
            background: radial-gradient(circle, rgba(255, 215, 0, 0.4) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
        `;
        
        element.style.position = 'relative';
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    preloadSlides() {
        // Preload next and previous slides for smoother transitions
        const preloadSlides = [
            this.currentSlide - 1,
            this.currentSlide + 1
        ].filter(index => index >= 0 && index < this.totalSlides);
        
        preloadSlides.forEach(index => {
            const slide = this.slides[index];
            if (slide) {
                slide.style.willChange = 'transform, opacity';
            }
        });
    }

    handleResize() {
        // Recalculate positions and sizes on resize
        this.updateProgress();
        this.preloadSlides();
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Auto-advance slides (optional)
    startAutoAdvance(interval = 15000) {
        this.autoAdvanceInterval = setInterval(() => {
            if (this.currentSlide < this.totalSlides - 1) {
                this.nextSlide();
            } else {
                this.goToSlide(0); // Loop back to first slide
            }
        }, interval);
    }

    stopAutoAdvance() {
        if (this.autoAdvanceInterval) {
            clearInterval(this.autoAdvanceInterval);
            this.autoAdvanceInterval = null;
        }
    }

    // Fullscreen API support
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }
}

// Special effects and interactions
class PresentationEffects {
    constructor() {
        this.init();
    }

    init() {
        this.addCustomCursor();
        this.addHoverEffects();
        this.addKeyboardShortcuts();
        this.addDynamicStyles();
    }

    addCustomCursor() {
        let cursor = document.querySelector('.custom-cursor');
        if (!cursor) {
            cursor = document.createElement('div');
            cursor.className = 'custom-cursor';
            cursor.style.cssText = `
                position: fixed;
                width: 20px;
                height: 20px;
                background: radial-gradient(circle, rgba(255,215,0,0.8) 0%, transparent 70%);
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                transition: transform 0.1s ease;
                mix-blend-mode: difference;
            `;
            document.body.appendChild(cursor);
        }
        
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX - 10 + 'px';
            cursor.style.top = e.clientY - 10 + 'px';
        });

        // Hide cursor when mouse leaves window
        document.addEventListener('mouseleave', () => {
            cursor.style.opacity = '0';
        });

        document.addEventListener('mouseenter', () => {
            cursor.style.opacity = '1';
        });
    }

    addHoverEffects() {
        // Add ripple effect to clickable elements
        const clickableElements = document.querySelectorAll('.nav-btn, .indicator, .problem-card, .solution-card, .stat-card, .tech-item');
        
        clickableElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                element.style.transform = element.style.transform + ' scale(1.02)';
            });

            element.addEventListener('mouseleave', () => {
                element.style.transform = element.style.transform.replace(' scale(1.02)', '');
            });

            element.addEventListener('click', (e) => {
                this.createRipple(e, element);
            });
        });
    }

    createRipple(event, element) {
        const ripple = document.createElement('div');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: radial-gradient(circle, rgba(255,215,0,0.3) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
            transform: scale(0);
            animation: rippleEffect 0.6s ease-out;
        `;
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    addKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'f':
                        e.preventDefault();
                        presentation.toggleFullscreen();
                        break;
                    case 'r':
                        e.preventDefault();
                        presentation.goToSlide(0);
                        break;
                }
            }
        });
    }

    addDynamicStyles() {
        // Add dynamic CSS animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes rippleEffect {
                to {
                    transform: scale(2);
                    opacity: 0;
                }
            }
            
            @keyframes floatUp {
                0% {
                    transform: translateY(0) rotate(0deg);
                    opacity: 1;
                }
                100% {
                    transform: translateY(-100vh) rotate(360deg);
                    opacity: 0;
                }
            }
            
            @keyframes confettiFall {
                0% {
                    transform: translateY(0) rotate(0deg);
                    opacity: 1;
                }
                100% {
                    transform: translateY(100vh) rotate(720deg);
                    opacity: 0;
                }
            }
            
            @keyframes screenGlow {
                0% {
                    box-shadow: inset 0 0 20px rgba(255, 215, 0, 0.1);
                }
                100% {
                    box-shadow: inset 0 0 40px rgba(255, 215, 0, 0.3);
                }
            }
            
            .nav-btn, .problem-card, .solution-card, .stat-card, .tech-item {
                position: relative;
                overflow: hidden;
            }
            
            /* Accessibility improvements */
            @media (prefers-reduced-motion: reduce) {
                * {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
            }
            
            /* High contrast mode */
            @media (prefers-contrast: high) {
                .slide {
                    background: #000 !important;
                    color: #fff !important;
                }
                
                .glass-bg {
                    background: rgba(255, 255, 255, 0.9) !important;
                    color: #000 !important;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize presentation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize main presentation
    window.presentation = new SacredFlowPresentation();
    
    // Initialize effects
    const effects = new PresentationEffects();
    
    // Add loading animation
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 1s ease-in-out';
        document.body.style.opacity = '1';
    }, 100);
    
    // Optional: Start auto-advance (uncomment to enable)
    // presentation.startAutoAdvance(20000); // 20 seconds per slide
    
    // Add presentation controls info
    console.log(`
    🕉️ Sacred Flow Presentation Controls:
    ← → Arrow Keys: Navigate slides
    Space: Next slide
    Home: First slide
    End: Last slide
    Ctrl+F: Toggle fullscreen
    Ctrl+R: Restart presentation
    
    Touch: Swipe left/right to navigate
    Mouse: Click indicators or navigation buttons
    `);
    
    console.log('Sacred Flow Presentation initialized successfully! 🚀');
});