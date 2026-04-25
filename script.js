/* ============================================
   MARCOS COUTINHO PORTFOLIO - SCRIPT
   ============================================ */

// ============================================
// 1. GLOBAL CONFIG & UTILS
// ============================================

const App = {
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    isMobile: window.matchMedia('(max-width: 768px)').matches,
    
    // Debounce utility for performance
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
    },

    // Throttle utility for scroll events
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// ============================================
// 2. THEME MANAGER
// ============================================

const ThemeManager = {
    currentTheme: 'dark',
    
    init() {
        const saved = localStorage.getItem('portfolio-theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.currentTheme = saved || (prefersDark ? 'dark' : 'light');
        this.apply(this.currentTheme);
        
        const select = document.getElementById('themeSelect');
        if (select) {
            select.value = this.currentTheme;
            select.addEventListener('change', (e) => this.apply(e.target.value));
        }
    },
    
    apply(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('portfolio-theme', theme);
    }
};

// ============================================
// 3. SETTINGS PANEL
// ============================================

const SettingsPanel = {
    panel: null,
    btn: null,
    closeBtn: null,
    overlay: null,
    
    init() {
        this.panel = document.getElementById('settingsPanel');
        this.btn = document.getElementById('settingsBtn');
        this.closeBtn = document.getElementById('settingsClose');
        
        if (!this.panel || !this.btn) return;
        
        // Create overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'settings-overlay';
        this.overlay.style.cssText = `
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 1002;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
        `;
        document.body.appendChild(this.overlay);
        
        this.overlay.addEventListener('click', () => this.close());
        this.btn.addEventListener('click', () => this.open());
        this.closeBtn.addEventListener('click', () => this.close());
        
        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) this.close();
        });
        
        // Animation toggle
        const animToggle = document.getElementById('animToggle');
        const savedAnim = localStorage.getItem('portfolio-animations');
        if (savedAnim !== null) animToggle.checked = savedAnim === 'true';
        animToggle.addEventListener('change', (e) => {
            document.body.classList.toggle('animations-disabled', !e.target.checked);
            localStorage.setItem('portfolio-animations', e.target.checked);
        });
        if (!animToggle.checked) document.body.classList.add('animations-disabled');
        
        // Particles toggle
        const particlesToggle = document.getElementById('particlesToggle');
        const savedParticles = localStorage.getItem('portfolio-particles');
        if (savedParticles !== null) particlesToggle.checked = savedParticles === 'true';
        particlesToggle.addEventListener('change', (e) => {
            ParticleSystem.setEnabled(e.target.checked);
            localStorage.setItem('portfolio-particles', e.target.checked);
        });
    },
    
    open() {
        this.panel.classList.add('open');
        this.panel.setAttribute('aria-hidden', 'false');
        this.btn.setAttribute('aria-expanded', 'true');
        this.overlay.style.opacity = '1';
        this.overlay.style.pointerEvents = 'auto';
        document.body.style.overflow = 'hidden';
    },
    
    close() {
        this.panel.classList.remove('open');
        this.panel.setAttribute('aria-hidden', 'true');
        this.btn.setAttribute('aria-expanded', 'false');
        this.overlay.style.opacity = '0';
        this.overlay.style.pointerEvents = 'none';
        document.body.style.overflow = '';
    },
    
    isOpen() {
        return this.panel.classList.contains('open');
    }
};

// ============================================
// 4. PRELOADER
// ============================================

const Preloader = {
    init() {
        const preloader = document.getElementById('preloader');
        if (!preloader) return;
        
        window.addEventListener('load', () => {
            setTimeout(() => {
                preloader.style.opacity = '0';
                setTimeout(() => {
                    preloader.style.display = 'none';
                }, 500);
            }, 800);
        });
    }
};

// ============================================
// 5. SCROLL REVEAL (IntersectionObserver)
// ============================================

const ScrollReveal = {
    observer: null,
    
    init() {
        if (App.prefersReducedMotion) {
            document.querySelectorAll('.hidden').forEach(el => el.classList.add('show'));
            return;
        }
        
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show');
                    // Optionally unobserve after showing
                    // this.observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        document.querySelectorAll('.hidden').forEach((el) => this.observer.observe(el));
    }
};

// ============================================
// 6. NAVBAR & MOBILE MENU
// ============================================

const Navbar = {
    header: null,
    menuToggle: null,
    navLinks: null,
    
    init() {
        this.header = document.querySelector('header');
        this.menuToggle = document.querySelector('.menu-toggle');
        this.navLinks = document.querySelectorAll('header nav ul li a');
        
        if (!this.header) return;
        
        // Sticky on scroll
        window.addEventListener('scroll', App.throttle(() => {
            this.header.classList.toggle('sticky', window.scrollY > 50);
        }, 100));
        
        // Mobile menu toggle
        if (this.menuToggle) {
            this.menuToggle.addEventListener('click', () => this.toggleMobileMenu());
        }
        
        // Close menu when clicking a link
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (this.header.classList.contains('mobile-open')) {
                    this.closeMobileMenu();
                }
                // Smooth scroll to section
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    setTimeout(() => {
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                }
            });
        });
    },
    
    toggleMobileMenu() {
        const isOpen = this.header.classList.toggle('mobile-open');
        const icon = this.menuToggle.querySelector('i');
        this.menuToggle.setAttribute('aria-expanded', isOpen);
        
        if (isOpen) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-xmark');
        } else {
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-bars');
        }
    },
    
    closeMobileMenu() {
        this.header.classList.remove('mobile-open');
        this.menuToggle.setAttribute('aria-expanded', 'false');
        const icon = this.menuToggle.querySelector('i');
        icon.classList.remove('fa-xmark');
        icon.classList.add('fa-bars');
    }
};

// ============================================
// 7. TYPEWRITER EFFECT
// ============================================

const Typewriter = {
    textElement: null,
    words: ['Desenvolvedor Web', 'Criativo', 'Apaixonado por Tech', 'Freelancer'],
    wordIndex: 0,
    charIndex: 0,
    isDeleting: false,
    
    init() {
        this.textElement = document.querySelector('.typing-text');
        if (!this.textElement) return;
        this.type();
    },
    
    type() {
        const currentWord = this.words[this.wordIndex];
        
        if (this.isDeleting) {
            this.textElement.textContent = currentWord.substring(0, this.charIndex--);
        } else {
            this.textElement.textContent = currentWord.substring(0, this.charIndex++);
        }
        
        let typeSpeed = this.isDeleting ? 100 : 200;
        
        if (!this.isDeleting && this.charIndex === currentWord.length + 1) {
            this.isDeleting = true;
            typeSpeed = 2000;
        } else if (this.isDeleting && this.charIndex === 0) {
            this.isDeleting = false;
            this.wordIndex = (this.wordIndex + 1) % this.words.length;
            typeSpeed = 500;
        }
        
        setTimeout(() => this.type(), typeSpeed);
    }
};

// ============================================
// 8. 3D TILT EFFECT ON CARDS
// ============================================

const TiltEffect = {
    init() {
        if (App.isMobile || App.prefersReducedMotion) return;
        
        const cards = document.querySelectorAll('.project-card');
        
        cards.forEach(card => {
            card.addEventListener('dragstart', (e) => e.preventDefault());
            
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = ((y - centerY) / centerY) * -8;
                const rotateY = ((x - centerX) / centerX) * 8;
                
                card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02) translateY(-10px)`;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }
};

// ============================================
// 9. ABOUT IMAGE CAROUSEL
// ============================================

const AboutCarousel = {
    images: [
        { src: 'studio1.png', title: 'Studio Codar' },
        { src: 'project2.png', title: 'Barbearia Online' },
        { src: 'project3.png', title: 'Painel de Administrador' }
    ],
    currentIndex: 0,
    
    init() {
        const img = document.querySelector('.sobre-img figure img');
        const title = document.querySelector('.sobre-img figure .photo-title');
        
        if (!img || !title) return;
        
        this.update(img, title);
        
        setInterval(() => {
            this.currentIndex = (this.currentIndex + 1) % this.images.length;
            this.update(img, title);
        }, 3000);
    },
    
    update(img, title) {
        const item = this.images[this.currentIndex];
        // Fade out
        img.style.opacity = '0';
        setTimeout(() => {
            img.src = item.src;
            img.alt = item.title;
            title.textContent = item.title;
            img.style.opacity = '1';
        }, 300);
    }
};

// ============================================
// 10. PARTICLE SYSTEM (Canvas)
// ============================================

const ParticleSystem = {
    canvas: null,
    ctx: null,
    particles: [],
    enabled: true,
    animationId: null,
    
    init() {
        this.canvas = document.getElementById('particles-canvas');
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        
        window.addEventListener('resize', App.debounce(() => this.resize(), 200));
        
        const saved = localStorage.getItem('portfolio-particles');
        this.enabled = saved !== null ? saved === 'true' : true;
        
        if (this.enabled && !App.prefersReducedMotion) {
            this.createParticles();
            this.animate();
        }
    },
    
    resize() {
        if (!this.canvas) return;
        const hero = document.querySelector('.hero');
        if (hero) {
            this.canvas.width = hero.offsetWidth;
            this.canvas.height = hero.offsetHeight;
        }
    },
    
    createParticles() {
        const count = App.isMobile ? 25 : 50;
        this.particles = [];
        
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 0.5,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                opacity: Math.random() * 0.5 + 0.2
            });
        }
    },
    
    animate() {
        if (!this.enabled || !this.ctx) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const theme = document.documentElement.getAttribute('data-theme') || 'dark';
        const colors = {
            dark: '255, 255, 255',
            light: '0, 0, 0',
            cyberpunk: '0, 255, 204',
            ocean: '0, 170, 255'
        };
        const color = colors[theme] || colors.dark;
        
        this.particles.forEach((p, i) => {
            p.x += p.speedX;
            p.y += p.speedY;
            
            // Wrap around edges
            if (p.x < 0) p.x = this.canvas.width;
            if (p.x > this.canvas.width) p.x = 0;
            if (p.y < 0) p.y = this.canvas.height;
            if (p.y > this.canvas.height) p.y = 0;
            
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${color}, ${p.opacity})`;
            this.ctx.fill();
            
            // Draw connections
            for (let j = i + 1; j < this.particles.length; j++) {
                const p2 = this.particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.strokeStyle = `rgba(${color}, ${0.1 * (1 - distance / 100)})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            }
        });
        
        this.animationId = requestAnimationFrame(() => this.animate());
    },
    
    setEnabled(value) {
        this.enabled = value;
        if (value && !this.animationId) {
            this.createParticles();
            this.animate();
        } else if (!value && this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
            if (this.ctx) {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
        }
    }
};

// ============================================
// 11. FOOTER YEAR/*  */
// ============================================

const FooterYear = {
    init() {
        const yearSpan = document.getElementById('year');
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear();
        }
    }
};

// ============================================
// 12. SCROLL RESTORATION
// ============================================

const ScrollRestoration = {
    init() {
        if (history.scrollRestoration) {
            history.scrollRestoration = 'manual';
        }
        window.scrollTo(0, 0);
    }
};

// ============================================
// 13. ACTIVE NAV LINK HIGHLIGHTING
// ============================================

const ActiveNavLink = {
    init() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('header nav ul li a');
        
        window.addEventListener('scroll', App.throttle(() => {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                if (scrollY >= sectionTop - 200) {
                    current = section.getAttribute('id');
                }
            });
            
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        }, 100));
    }
};

// ============================================
// 14. SKILLS TABS
// ============================================

const SkillsTabs = {
    tabs: null,
    contents: null,
    
    init() {
        this.tabs = document.querySelectorAll('.skills-tab-btn');
        this.contents = document.querySelectorAll('.tab-content');
        
        if (!this.tabs.length || !this.contents.length) return;
        
        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab));
        });
    },
    
    switchTab(activeTab) {
        const targetId = activeTab.getAttribute('aria-controls');
        
        // Update buttons
        this.tabs.forEach(tab => {
            tab.classList.remove('active');
            tab.setAttribute('aria-selected', 'false');
        });
        activeTab.classList.add('active');
        activeTab.setAttribute('aria-selected', 'true');
        
        // Update content
        this.contents.forEach(content => {
            content.classList.remove('active');
            if (content.id === targetId) {
                content.classList.add('active');
            }
        });
    }
};

// ============================================
// 15. CERTIFICATE LIGHTBOX
// ============================================

const CertificateLightbox = {
    lightbox: null,
    img: null,
    inner: null,
    cursor: null,
    isZoomed: false,
    isOverImage: false,
    
    init() {
        const certCards = document.querySelectorAll('.certificate-card');
        if (!certCards.length) return;
        
        // Create lightbox element (sem botão X)
        this.lightbox = document.createElement('div');
        this.lightbox.className = 'cert-lightbox';
        this.lightbox.innerHTML = `
            <div class="cert-lightbox-inner">
                <img src="" alt="">
            </div>
            <div class="cert-lightbox-cursor" aria-hidden="true">
                <div class="cursor-icon cursor-zoom">
                    <i class="fa-solid fa-magnifying-glass-plus"></i>
                </div>
                <div class="cursor-icon cursor-close">
                    <div class="cursor-close-circle">
                        <i class="fa-solid fa-xmark"></i>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(this.lightbox);
        
        this.inner = this.lightbox.querySelector('.cert-lightbox-inner');
        this.img = this.lightbox.querySelector('img');
        this.cursor = this.lightbox.querySelector('.cert-lightbox-cursor');
        
        // Events nos cards
        certCards.forEach(card => {
            card.addEventListener('click', () => this.open(card.querySelector('img')));
        });
        
        // Mouse tracking
        this.lightbox.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.lightbox.addEventListener('mouseleave', () => this.handleMouseLeave());
        
        // Click para fechar (fora da imagem) ou zoom (na imagem)
        this.lightbox.addEventListener('click', (e) => this.handleClick(e));
        
        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.close();
        });
        
        // Detectar se é desktop (tem mouse)
        this.isDesktop = !window.matchMedia('(pointer: coarse)').matches;
    },
    
    handleMouseMove(e) {
        if (!this.isDesktop) return;
        
        const rect = this.img.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;
        
        // Verificar se mouse está sobre a imagem
        const wasOverImage = this.isOverImage;
        this.isOverImage = (
            x >= rect.left && x <= rect.right &&
            y >= rect.top && y <= rect.bottom
        );
        
        // Atualizar posição do cursor customizado
        this.cursor.style.left = `${x}px`;
        this.cursor.style.top = `${y}px`;
        
        // Atualizar estado visual
        if (this.isOverImage !== wasOverImage) {
            this.updateCursorState();
        }
    },
    
    handleMouseLeave() {
        if (!this.isDesktop) return;
        this.isOverImage = false;
        this.updateCursorState();
    },
    
    updateCursorState() {
        if (this.isOverImage) {
            this.cursor.classList.remove('cursor-mode-close');
            this.cursor.classList.add('cursor-mode-zoom');
            this.lightbox.classList.add('cursor-zoom-active');
            this.lightbox.classList.remove('cursor-close-active');
        } else {
            this.cursor.classList.remove('cursor-mode-zoom');
            this.cursor.classList.add('cursor-mode-close');
            this.lightbox.classList.add('cursor-close-active');
            this.lightbox.classList.remove('cursor-zoom-active');
        }
    },
    
    handleClick(e) {
        const rect = this.img.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;
        
        const clickedOnImage = (
            x >= rect.left && x <= rect.right &&
            y >= rect.top && y <= rect.bottom
        );
        
        if (clickedOnImage) {
            // Toggle zoom
            this.toggleZoom();
        } else {
            // Fechar lightbox
            this.close();
        }
    },
    
    toggleZoom() {
        this.isZoomed = !this.isZoomed;
        if (this.isZoomed) {
            this.img.classList.add('zoomed');
            this.cursor.querySelector('.cursor-zoom i').classList.remove('fa-magnifying-glass-plus');
            this.cursor.querySelector('.cursor-zoom i').classList.add('fa-magnifying-glass-minus');
        } else {
            this.img.classList.remove('zoomed');
            this.cursor.querySelector('.cursor-zoom i').classList.remove('fa-magnifying-glass-minus');
            this.cursor.querySelector('.cursor-zoom i').classList.add('fa-magnifying-glass-plus');
        }
    },
    
    open(sourceImg) {
        if (!sourceImg) return;
        this.img.src = sourceImg.src;
        this.img.alt = sourceImg.alt;
        this.isZoomed = false;
        this.img.classList.remove('zoomed');
        
        // Reset cursor zoom icon
        const zoomIcon = this.cursor.querySelector('.cursor-zoom i');
        zoomIcon.classList.remove('fa-magnifying-glass-minus');
        zoomIcon.classList.add('fa-magnifying-glass-plus');
        
        this.lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Ativar cursor customizado no desktop
        if (this.isDesktop) {
            this.cursor.style.display = 'block';
            // Estado inicial: fora da imagem (close)
            this.isOverImage = false;
            this.updateCursorState();
        }
    },
    
    close() {
        this.lightbox.classList.remove('active');
        this.lightbox.classList.remove('cursor-zoom-active');
        this.lightbox.classList.remove('cursor-close-active');
        document.body.style.overflow = '';
        this.isZoomed = false;
        this.img.classList.remove('zoomed');

        // Reset cursor zoom icon
        const zoomIcon = this.cursor.querySelector('.cursor-zoom i');
        zoomIcon.classList.remove('fa-magnifying-glass-minus');
        zoomIcon.classList.add('fa-magnifying-glass-plus');

        if (this.isDesktop) {
            this.cursor.style.display = 'none';
        }
    }
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    ScrollRestoration.init();
    Preloader.init();
    ThemeManager.init();
    SettingsPanel.init();
    ScrollReveal.init();
    Navbar.init();
    Typewriter.init();
    TiltEffect.init();
    AboutCarousel.init();
    ParticleSystem.init();
    FooterYear.init();
    ActiveNavLink.init();
    SkillsTabs.init();
    CertificateLightbox.init();
});
