// Main JavaScript functionality for AiRia website

// Global state management
const AppState = {
    members: [],
    events: [],
    social: {},
    isLoading: true
};

// Utility functions
const Utils = {
    // Fetch JSON data
    async fetchJSON(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching JSON:', error);
            return null;
        }
    },

    // Format date
    formatDate(dateString) {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long'
        };
        return new Date(dateString).toLocaleDateString('ja-JP', options);
    },

    // Get month and day for calendar display
    getDateParts(dateString) {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.toLocaleDateString('ja-JP', { month: 'short' });
        return { day, month };
    },

    // Check if event is upcoming
    isUpcoming(dateString) {
        const eventDate = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return eventDate >= today;
    },

    // Debounce function for performance
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
};

// Navigation functionality
const Navigation = {
    init() {
        this.setupMobileMenu();
        this.setupSmoothScrolling();
        this.setupActiveNavigation();
    },

    setupMobileMenu() {
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
                
                // Toggle aria-label
                const isOpen = navMenu.classList.contains('active');
                navToggle.setAttribute('aria-label', isOpen ? 'メニューを閉じる' : 'メニューを開く');
            });

            // Close menu when clicking on a link
            navMenu.addEventListener('click', (e) => {
                if (e.target.classList.contains('nav-link')) {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                    navToggle.setAttribute('aria-label', 'メニューを開く');
                }
            });
        }
    },

    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = target.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    },

    setupActiveNavigation() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');

        if (sections.length === 0) return;

        const observerOptions = {
            rootMargin: '-50% 0px -50% 0px',
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Remove active class from all links
                    navLinks.forEach(link => link.classList.remove('active'));
                    
                    // Add active class to current section link
                    const activeLink = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
                    if (activeLink) {
                        activeLink.classList.add('active');
                    }
                }
            });
        }, observerOptions);

        sections.forEach(section => observer.observe(section));
    }
};

// Members section functionality
const Members = {
    async init() {
        await this.loadMembers();
        this.renderMembers();
    },

    async loadMembers() {
        const data = await Utils.fetchJSON('data/members.json');
        if (data && data.members) {
            AppState.members = data.members;
        }
    },

    renderMembers() {
        const container = document.getElementById('membersGrid');
        if (!container) return;

        if (AppState.members.length === 0) {
            container.innerHTML = '<p class="text-center">メンバー情報を読み込み中...</p>';
            return;
        }

        const membersHTML = AppState.members.map(member => `
            <div class="member-card scroll-reveal" data-member-id="${member.id}">
                <div class="member-image">
                    ${member.displayName.charAt(0)}
                </div>
                <h4 class="member-name">${member.name}</h4>
                <p class="member-name-en">${member.displayName}</p>
                <p class="member-bio">${member.bio}</p>
                <div class="member-social">
                    ${member.socialLinks?.instagram ? 
                        `<a href="${member.socialLinks.instagram}" class="social-link" target="_blank" rel="noopener noreferrer" aria-label="${member.name}のInstagram">
                            📷
                        </a>` : ''}
                    ${member.socialLinks?.twitter ? 
                        `<a href="${member.socialLinks.twitter}" class="social-link" target="_blank" rel="noopener noreferrer" aria-label="${member.name}のTwitter">
                            🐦
                        </a>` : ''}
                </div>
            </div>
        `).join('');

        container.innerHTML = membersHTML;

        // Add click events for member cards
        container.addEventListener('click', (e) => {
            const memberCard = e.target.closest('.member-card');
            if (memberCard) {
                const memberId = memberCard.dataset.memberId;
                this.navigateToMemberPage(memberId);
            }
        });
    },

    navigateToMemberPage(memberId) {
        // Navigate to member detail page
        window.location.href = `member/${memberId}.html`;
    }
};

// Events section functionality
const Events = {
    async init() {
        await this.loadEvents();
        this.renderEvents();
    },

    async loadEvents() {
        const data = await Utils.fetchJSON('data/events.json');
        if (data && data.events) {
            // Sort events by date (upcoming first, then past)
            AppState.events = data.events.sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                
                // If both are upcoming or both are past, sort by date
                if (a.status === b.status) {
                    return a.status === 'upcoming' ? dateA - dateB : dateB - dateA;
                }
                
                // Upcoming events first
                return a.status === 'upcoming' ? -1 : 1;
            });
        }
    },

    renderEvents() {
        const container = document.getElementById('eventsCalendar');
        if (!container) return;

        if (AppState.events.length === 0) {
            container.innerHTML = '<p class="text-center">イベント情報を読み込み中...</p>';
            return;
        }

        const eventsHTML = AppState.events.map((event, index) => {
            const { day, month } = Utils.getDateParts(event.date);
            const isUpcoming = event.status === 'upcoming';
            
            return `
                <div class="event-card ${event.type} ${event.status} scroll-reveal" 
                     data-event-id="${event.id}" 
                     style="animation-delay: ${index * 0.1}s">
                    <div class="event-header">
                        <div class="event-date">
                            <div class="event-day">${day}</div>
                            <div class="event-month">${month}</div>
                        </div>
                        <div class="event-info">
                            <h4 class="event-title">${event.title}</h4>
                            <span class="event-type ${event.type}">
                                ${this.getEventTypeLabel(event.type)}
                            </span>
                            <div class="event-details">
                                ${event.time ? `<div class="event-time">⏰ ${event.time}</div>` : ''}
                                ${event.venue ? `<div class="event-venue">📍 ${event.venue}</div>` : ''}
                                <div class="event-description">${event.description}</div>
                                ${event.ticketUrl && isUpcoming ? 
                                    `<a href="${event.ticketUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary mt-2">
                                        チケット購入
                                    </a>` : ''}
                                ${event.externalUrl && isUpcoming ? 
                                    `<a href="${event.externalUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary mt-2">
                                        詳細を見る
                                    </a>` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = eventsHTML;

        // Add click events for event cards
        container.addEventListener('click', (e) => {
            const eventCard = e.target.closest('.event-card');
            if (eventCard && !e.target.closest('a')) {
                const eventId = eventCard.dataset.eventId;
                this.navigateToEventPage(eventId);
            }
        });
    },

    getEventTypeLabel(type) {
        const labels = {
            'live': 'ライブ',
            'street': '路上ライブ',
            'streaming': '配信'
        };
        return labels[type] || type;
    },

    navigateToEventPage(eventId) {
        // Navigate to event detail page
        window.location.href = `live/${eventId}.html`;
    }
};

// Social section functionality
const Social = {
    async init() {
        await this.loadSocialLinks();
        this.renderSocialLinks();
    },

    async loadSocialLinks() {
        const data = await Utils.fetchJSON('data/social.json');
        if (data) {
            AppState.social = data;
        }
    },

    renderSocialLinks() {
        const container = document.getElementById('socialLinks');
        if (!container) return;

        if (Object.keys(AppState.social).length === 0) {
            container.innerHTML = '<p class="text-center">SNSリンクを読み込み中...</p>';
            return;
        }

        const socialHTML = Object.entries(AppState.social).map(([platform, url], index) => `
            <div class="social-item scroll-reveal" style="animation-delay: ${index * 0.1}s">
                <a href="${url}" class="social-icon" target="_blank" rel="noopener noreferrer" aria-label="${this.getPlatformLabel(platform)}">
                    ${this.getPlatformIcon(platform)}
                </a>
                <div class="social-name">${this.getPlatformLabel(platform)}</div>
            </div>
        `).join('');

        container.innerHTML = socialHTML;
    },

    getPlatformIcon(platform) {
        const icons = {
            'instagram': '📷',
            'tiktok': '🎵',
            'line': '💬',
            'twitter': '🐦',
            'youtube': '📺'
        };
        return icons[platform] || '🔗';
    },

    getPlatformLabel(platform) {
        const labels = {
            'instagram': 'Instagram',
            'tiktok': 'TikTok',
            'line': 'LINE',
            'twitter': 'Twitter',
            'youtube': 'YouTube'
        };
        return labels[platform] || platform;
    }
};

// Loading state management
const LoadingManager = {
    show() {
        document.body.classList.add('loading');
    },

    hide() {
        document.body.classList.remove('loading');
        AppState.isLoading = false;
    }
};

// Error handling
const ErrorHandler = {
    showError(message, container) {
        if (container) {
            container.innerHTML = `
                <div class="alert alert-error">
                    <p>${message}</p>
                </div>
            `;
        }
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    try {
        LoadingManager.show();
        
        // Initialize components in parallel
        await Promise.all([
            Navigation.init(),
            Members.init(),
            Events.init(),
            Social.init()
        ]);

        // Initialize scroll animations after content is loaded (if available)
        if (typeof ScrollAnimations !== 'undefined') {
            ScrollAnimations.init();
        }
        
        LoadingManager.hide();
        
        // Add page load animation
        document.body.classList.add('page-loaded');
        
    } catch (error) {
        console.error('Error initializing application:', error);
        LoadingManager.hide();
    }
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && !AppState.isLoading) {
        // Refresh data when page becomes visible again
        Events.loadEvents().then(() => Events.renderEvents());
    }
});

// Expose global functions for debugging (development only)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.AiRiaApp = {
        state: AppState,
        utils: Utils,
        navigation: Navigation,
        members: Members,
        events: Events,
        social: Social
    };
}