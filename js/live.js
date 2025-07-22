// Live page specific JavaScript

document.addEventListener('DOMContentLoaded', async function() {
    // Load content data
    const contentData = await loadData('/data/content.json');
    
    if (contentData) {
        // Load live events
        loadLiveEvents(contentData.liveEvents);
    }
});

// Load and display live events
function loadLiveEvents(liveData) {
    if (!liveData || liveData.length === 0) {
        document.getElementById('upcoming-lives').innerHTML = '<p class="no-content">現在、予定されているライブはありません。</p>';
        document.getElementById('past-lives').innerHTML = '<p class="no-content">過去のライブ情報はありません。</p>';
        return;
    }
    
    const now = new Date();
    const upcomingLives = [];
    const pastLives = [];
    
    // Separate upcoming and past lives
    liveData.forEach(live => {
        if (new Date(live.date) > now) {
            upcomingLives.push(live);
        } else {
            pastLives.push(live);
        }
    });
    
    // Sort upcoming lives by date (ascending)
    upcomingLives.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Sort past lives by date (descending)
    pastLives.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Display upcoming lives
    const upcomingContainer = document.getElementById('upcoming-lives');
    if (upcomingLives.length === 0) {
        upcomingContainer.innerHTML = '<p class="no-content">現在、予定されているライブはありません。</p>';
    } else {
        upcomingContainer.innerHTML = '';
        upcomingLives.forEach(live => {
            const liveItem = createLiveItem(live, false);
            upcomingContainer.appendChild(liveItem);
        });
    }
    
    // Display past lives
    const pastContainer = document.getElementById('past-lives');
    if (pastLives.length === 0) {
        pastContainer.innerHTML = '<p class="no-content">過去のライブ情報はありません。</p>';
    } else {
        pastContainer.innerHTML = '';
        pastLives.forEach(live => {
            const liveItem = createLiveItem(live, true);
            pastContainer.appendChild(liveItem);
        });
    }
}

// Create live item element
function createLiveItem(live, isPast) {
    const liveDate = new Date(live.date);
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    
    const item = document.createElement('div');
    item.className = 'live-item';
    
    item.innerHTML = `
        <div class="live-date-block">
            <div class="live-month">${months[liveDate.getMonth()]}</div>
            <div class="live-day">${liveDate.getDate()}</div>
            <div class="live-year">${liveDate.getFullYear()}</div>
        </div>
        <div class="live-info">
            <h3 class="live-title">${live.title}</h3>
            <div class="live-details">
                <div class="live-detail">
                    <span class="detail-icon">📍</span>
                    <span>${live.venue}</span>
                </div>
                <div class="live-detail">
                    <span class="detail-icon">🕒</span>
                    <span>${formatTime(liveDate)}</span>
                </div>
            </div>
            ${live.description ? `<p class="live-description">${live.description}</p>` : ''}
        </div>
        <div class="live-ticket">
            ${!isPast && live.ticketUrl ? 
                `<a href="${live.ticketUrl}" target="_blank" rel="noopener noreferrer" class="ticket-btn">チケット情報</a>` : 
                isPast ? '' : '<span class="ticket-sold-out">SOLD OUT</span>'
            }
        </div>
    `;
    
    return item;
}

// Format time
function formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}