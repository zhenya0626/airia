// Calendar functionality for events display

const Calendar = {
    currentDate: new Date(),
    events: [],
    
    init() {
        this.setupEventListeners();
        this.loadEvents();
    },

    setupEventListeners() {
        // Listen for custom events from main app
        document.addEventListener('eventsLoaded', (e) => {
            this.events = e.detail.events;
            this.renderCalendarView();
        });

        // Calendar navigation
        const prevButton = document.getElementById('calendarPrev');
        const nextButton = document.getElementById('calendarNext');
        const todayButton = document.getElementById('calendarToday');

        if (prevButton) {
            prevButton.addEventListener('click', () => this.navigateToPrevMonth());
        }
        if (nextButton) {
            nextButton.addEventListener('click', () => this.navigateToNextMonth());
        }
        if (todayButton) {
            todayButton.addEventListener('click', () => this.navigateToToday());
        }
    },

    async loadEvents() {
        try {
            const response = await fetch('data/events.json');
            const data = await response.json();
            this.events = data.events || [];
            this.renderCalendarView();
        } catch (error) {
            console.error('Error loading events for calendar:', error);
        }
    },

    renderCalendarView() {
        const container = document.getElementById('calendarContainer');
        if (!container) return;

        const calendarHTML = this.generateCalendarHTML();
        container.innerHTML = calendarHTML;
        
        this.addEventListeners();
    },

    generateCalendarHTML() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        
        const monthNames = [
            '1月', '2月', '3月', '4月', '5月', '6月',
            '7月', '8月', '9月', '10月', '11月', '12月'
        ];
        
        const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
        
        let html = `
            <div class="calendar-header">
                <button id="calendarPrev" class="calendar-nav-btn">‹</button>
                <h3 class="calendar-title">${year}年${monthNames[month]}</h3>
                <button id="calendarNext" class="calendar-nav-btn">›</button>
            </div>
            <div class="calendar-controls">
                <button id="calendarToday" class="btn btn-secondary">今月</button>
            </div>
            <div class="calendar-grid">
                <div class="calendar-days-header">
        `;
        
        // Day headers
        dayNames.forEach(day => {
            html += `<div class="calendar-day-header">${day}</div>`;
        });
        
        html += `</div><div class="calendar-days">`;
        
        // Empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            html += `<div class="calendar-day calendar-day-empty"></div>`;
        }
        
        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const eventsForDay = this.getEventsForDate(currentDateStr);
            const isToday = this.isToday(year, month, day);
            const hasEvents = eventsForDay.length > 0;
            
            html += `
                <div class="calendar-day ${isToday ? 'calendar-day-today' : ''} ${hasEvents ? 'calendar-day-has-events' : ''}" 
                     data-date="${currentDateStr}">
                    <div class="calendar-day-number">${day}</div>
                    <div class="calendar-day-events">
            `;
            
            // Add event indicators
            eventsForDay.slice(0, 3).forEach(event => {
                const eventClass = event.type || 'default';
                html += `
                    <div class="calendar-event-indicator ${eventClass}" 
                         title="${event.title}">
                        <span class="event-dot"></span>
                        <span class="event-title">${this.truncateTitle(event.title, 10)}</span>
                    </div>
                `;
            });
            
            if (eventsForDay.length > 3) {
                html += `<div class="calendar-more-events">+${eventsForDay.length - 3}</div>`;
            }
            
            html += `</div></div>`;
        }
        
        html += `</div></div>`;
        
        // Event details section
        html += `<div class="calendar-event-details" id="calendarEventDetails"></div>`;
        
        return html;
    },

    getEventsForDate(dateStr) {
        return this.events.filter(event => event.date === dateStr);
    },

    isToday(year, month, day) {
        const today = new Date();
        return today.getFullYear() === year && 
               today.getMonth() === month && 
               today.getDate() === day;
    },

    truncateTitle(title, maxLength) {
        if (title.length <= maxLength) return title;
        return title.substring(0, maxLength) + '...';
    },

    addEventListeners() {
        // Day click events
        document.querySelectorAll('.calendar-day').forEach(dayElement => {
            dayElement.addEventListener('click', (e) => {
                const date = dayElement.dataset.date;
                this.showEventsForDate(date);
                
                // Update selected day styling
                document.querySelectorAll('.calendar-day-selected').forEach(el => {
                    el.classList.remove('calendar-day-selected');
                });
                dayElement.classList.add('calendar-day-selected');
            });
        });

        // Navigation buttons
        const prevButton = document.getElementById('calendarPrev');
        const nextButton = document.getElementById('calendarNext');
        const todayButton = document.getElementById('calendarToday');

        if (prevButton) {
            prevButton.addEventListener('click', () => this.navigateToPrevMonth());
        }
        if (nextButton) {
            nextButton.addEventListener('click', () => this.navigateToNextMonth());
        }
        if (todayButton) {
            todayButton.addEventListener('click', () => this.navigateToToday());
        }
    },

    showEventsForDate(dateStr) {
        const container = document.getElementById('calendarEventDetails');
        if (!container) return;

        const eventsForDay = this.getEventsForDate(dateStr);
        const formattedDate = this.formatDateForDisplay(dateStr);

        if (eventsForDay.length === 0) {
            container.innerHTML = `
                <div class="calendar-no-events">
                    <h4>${formattedDate}</h4>
                    <p>この日はイベントがありません</p>
                </div>
            `;
            return;
        }

        let html = `
            <div class="calendar-events-list">
                <h4>${formattedDate}のイベント</h4>
                <div class="calendar-events">
        `;

        eventsForDay.forEach(event => {
            html += `
                <div class="calendar-event-item ${event.type}" data-event-id="${event.id}">
                    <div class="calendar-event-time">
                        ${event.time || '時間未定'}
                    </div>
                    <div class="calendar-event-info">
                        <h5 class="calendar-event-title">${event.title}</h5>
                        <p class="calendar-event-venue">${event.venue || ''}</p>
                        <p class="calendar-event-description">${event.description}</p>
                        ${event.ticketUrl ? 
                            `<a href="${event.ticketUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
                                チケット
                            </a>` : ''}
                    </div>
                </div>
            `;
        });

        html += `</div></div>`;
        container.innerHTML = html;

        // Add click events for event items
        container.querySelectorAll('.calendar-event-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('a')) {
                    const eventId = item.dataset.eventId;
                    window.location.href = `live/${eventId}.html`;
                }
            });
        });
    },

    formatDateForDisplay(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });
    },

    navigateToPrevMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.renderCalendarView();
    },

    navigateToNextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.renderCalendarView();
    },

    navigateToToday() {
        this.currentDate = new Date();
        this.renderCalendarView();
        
        // Show today's events if any
        const todayStr = this.formatDateString(this.currentDate);
        this.showEventsForDate(todayStr);
    },

    formatDateString(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    // Public method to update events from external source
    updateEvents(events) {
        this.events = events;
        this.renderCalendarView();
    },

    // Get upcoming events for quick display
    getUpcomingEvents(limit = 5) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return this.events
            .filter(event => {
                const eventDate = new Date(event.date);
                return eventDate >= today;
            })
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, limit);
    }
};

// CSS for calendar styling (to be added to components.css)
const calendarStyles = `
.calendar-container {
    background: white;
    border-radius: 15px;
    padding: 1.5rem;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem;
}

.calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #f0f0f0;
}

.calendar-title {
    font-size: 1.5rem;
    margin: 0;
    color: #333;
}

.calendar-nav-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
    transition: background-color 0.3s ease;
    color: #666;
}

.calendar-nav-btn:hover {
    background-color: #f0f0f0;
    color: #333;
}

.calendar-controls {
    text-align: center;
    margin-bottom: 1rem;
}

.calendar-grid {
    width: 100%;
}

.calendar-days-header {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 1px;
    margin-bottom: 1rem;
}

.calendar-day-header {
    text-align: center;
    font-weight: 600;
    padding: 0.5rem;
    color: #666;
    font-size: 0.9rem;
}

.calendar-days {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 1px;
    background-color: #f0f0f0;
    border: 1px solid #f0f0f0;
}

.calendar-day {
    background: white;
    min-height: 80px;
    padding: 0.5rem;
    cursor: pointer;
    transition: background-color 0.3s ease;
    position: relative;
}

.calendar-day:hover {
    background-color: #f8f9fa;
}

.calendar-day-empty {
    background-color: #fafafa;
    cursor: default;
}

.calendar-day-today {
    background: linear-gradient(135deg, #ff6b9d, #a855f7);
    color: white;
}

.calendar-day-today .calendar-day-number {
    color: white;
    font-weight: 700;
}

.calendar-day-has-events {
    border-left: 3px solid #ff6b9d;
}

.calendar-day-selected {
    background-color: #e3f2fd;
    border: 2px solid #2196f3;
}

.calendar-day-number {
    font-weight: 600;
    margin-bottom: 0.25rem;
    color: #333;
}

.calendar-day-events {
    font-size: 0.75rem;
}

.calendar-event-indicator {
    display: flex;
    align-items: center;
    margin-bottom: 0.125rem;
    padding: 0.125rem;
    border-radius: 3px;
    background-color: rgba(255, 107, 157, 0.1);
}

.calendar-event-indicator.live {
    background-color: rgba(255, 107, 157, 0.2);
}

.calendar-event-indicator.street {
    background-color: rgba(59, 130, 246, 0.2);
}

.calendar-event-indicator.streaming {
    background-color: rgba(168, 85, 247, 0.2);
}

.event-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background-color: #ff6b9d;
    margin-right: 0.25rem;
    flex-shrink: 0;
}

.event-title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.calendar-more-events {
    color: #666;
    font-size: 0.7rem;
    text-align: center;
    padding: 0.125rem;
}

.calendar-event-details {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 2px solid #f0f0f0;
}

.calendar-no-events {
    text-align: center;
    color: #666;
    padding: 2rem;
}

.calendar-events-list h4 {
    margin-bottom: 1rem;
    color: #333;
}

.calendar-event-item {
    display: flex;
    background: white;
    border-radius: 10px;
    padding: 1rem;
    margin-bottom: 1rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    border-left: 4px solid #ff6b9d;
}

.calendar-event-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.calendar-event-item.live {
    border-left-color: #ff6b9d;
}

.calendar-event-item.street {
    border-left-color: #3b82f6;
}

.calendar-event-item.streaming {
    border-left-color: #a855f7;
}

.calendar-event-time {
    min-width: 80px;
    font-weight: 600;
    color: #666;
    margin-right: 1rem;
}

.calendar-event-info {
    flex: 1;
}

.calendar-event-title {
    margin: 0 0 0.5rem 0;
    color: #333;
    font-size: 1.1rem;
}

.calendar-event-venue {
    margin: 0 0 0.5rem 0;
    color: #666;
    font-weight: 500;
}

.calendar-event-description {
    margin: 0 0 1rem 0;
    color: #555;
    font-size: 0.9rem;
    line-height: 1.5;
}

@media (max-width: 768px) {
    .calendar-day {
        min-height: 60px;
        padding: 0.25rem;
    }
    
    .calendar-day-number {
        font-size: 0.9rem;
    }
    
    .calendar-event-indicator {
        font-size: 0.7rem;
    }
    
    .calendar-event-item {
        flex-direction: column;
    }
    
    .calendar-event-time {
        margin-right: 0;
        margin-bottom: 0.5rem;
    }
}
`;

// Auto-initialize if calendar container exists
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('calendarContainer')) {
        Calendar.init();
    }
});

// Export for use by other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Calendar;
}