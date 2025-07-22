// Home page specific JavaScript

document.addEventListener('DOMContentLoaded', async function() {
    // Load content data
    const contentData = await loadData('/data/content.json');
    
    if (contentData) {
        // Load latest news
        loadLatestNews(contentData.news);
        
        // Load next live info
        loadNextLive(contentData.liveEvents);
    }
});

// Load and display latest news
function loadLatestNews(newsData) {
    const newsContainer = document.getElementById('latest-news');
    
    if (!newsData || newsData.length === 0) {
        newsContainer.innerHTML = '<p class="no-content">現在、ニュースはありません。</p>';
        return;
    }
    
    // Sort by date and get latest 3
    const latestNews = newsData
        .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate))
        .slice(0, 3);
    
    newsContainer.innerHTML = '';
    
    latestNews.forEach(news => {
        const newsItem = createNewsItem(news);
        newsContainer.appendChild(newsItem);
    });
}

// Create news item element
function createNewsItem(news) {
    const article = document.createElement('article');
    article.className = 'news-item';
    article.onclick = () => window.location.href = `/news.html#${news.id}`;
    
    article.innerHTML = `
        <time class="news-date">${formatDate(news.publishDate)}</time>
        <h3 class="news-title">${news.title}</h3>
        <p class="news-excerpt">${news.excerpt || news.content.substring(0, 100) + '...'}</p>
    `;
    
    return article;
}

// Load and display next live info
function loadNextLive(liveData) {
    const liveContainer = document.getElementById('next-live');
    
    if (!liveData || liveData.length === 0) {
        liveContainer.innerHTML = '<p class="no-content">現在、予定されているライブはありません。</p>';
        return;
    }
    
    // Get future lives and sort by date
    const now = new Date();
    const futureLives = liveData
        .filter(live => new Date(live.date) > now)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    if (futureLives.length === 0) {
        liveContainer.innerHTML = '<p class="no-content">現在、予定されているライブはありません。</p>';
        return;
    }
    
    const nextLive = futureLives[0];
    liveContainer.innerHTML = `
        <h3 class="live-title">${nextLive.title}</h3>
        <div class="live-details">
            <div class="live-detail">
                <span class="live-detail-label">日時:</span>
                <span class="live-detail-value">${formatLiveDate(nextLive.date)}</span>
            </div>
            <div class="live-detail">
                <span class="live-detail-label">会場:</span>
                <span class="live-detail-value">${nextLive.venue}</span>
            </div>
            ${nextLive.ticketUrl ? `
            <div class="live-tickets">
                <a href="${nextLive.ticketUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
                    チケット情報
                </a>
            </div>
            ` : ''}
        </div>
    `;
}

// Format live date with time
function formatLiveDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const weekday = weekdays[date.getDay()];
    
    return `${year}年${month}月${day}日(${weekday}) ${hours}:${minutes}`;
}