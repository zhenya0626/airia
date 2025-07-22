// News page specific JavaScript

let allNews = [];
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', async function() {
    // Load content data
    const contentData = await loadData('/data/content.json');
    
    if (contentData) {
        allNews = contentData.news || [];
        // Load news
        loadNews();
    }
    
    // Setup filter functionality
    setupFilters();
    
    // Setup modal functionality
    setupModal();
    
    // Check for hash in URL to open specific news
    checkUrlHash();
});

// Load and display news
function loadNews() {
    const newsGrid = document.getElementById('news-grid');
    
    if (!allNews || allNews.length === 0) {
        newsGrid.innerHTML = '<p class="no-content">ニュース記事がありません。</p>';
        return;
    }
    
    // Filter news by category
    let filteredNews = allNews;
    if (currentFilter !== 'all') {
        filteredNews = allNews.filter(news => news.category === currentFilter);
    }
    
    // Sort by date (newest first)
    filteredNews.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
    
    newsGrid.innerHTML = '';
    
    filteredNews.forEach(news => {
        const newsCard = createNewsCard(news);
        newsGrid.appendChild(newsCard);
    });
}

// Create news card element
function createNewsCard(news) {
    const card = document.createElement('article');
    card.className = 'news-card';
    card.onclick = () => showNewsDetail(news);
    
    const categoryLabels = {
        'release': 'リリース',
        'live': 'ライブ',
        'info': 'お知らせ'
    };
    
    card.innerHTML = `
        ${news.featuredImage ? `
        <div class="news-image">
            <img src="${news.featuredImage}" alt="${news.title}" loading="lazy">
        </div>
        ` : ''}
        <div class="news-content">
            <span class="news-category ${news.category}">${categoryLabels[news.category] || news.category}</span>
            <time class="news-date">${formatDate(news.publishDate)}</time>
            <h3 class="news-title">${news.title}</h3>
            <p class="news-excerpt">${news.content.substring(0, 120)}...</p>
        </div>
    `;
    
    return card;
}

// Show news detail in modal
function showNewsDetail(news) {
    const newsDetail = document.getElementById('news-detail');
    
    const categoryLabels = {
        'release': 'リリース',
        'live': 'ライブ',
        'info': 'お知らせ'
    };
    
    newsDetail.innerHTML = `
        <div class="news-detail-header">
            <span class="news-detail-category ${news.category}">${categoryLabels[news.category] || news.category}</span>
            <h1 class="news-detail-title">${news.title}</h1>
            <time class="news-detail-date">${formatDate(news.publishDate)}</time>
        </div>
        ${news.featuredImage ? `
        <div class="news-detail-image">
            <img src="${news.featuredImage}" alt="${news.title}">
        </div>
        ` : ''}
        <div class="news-detail-content">
            ${news.content.split('\n').map(paragraph => `<p>${paragraph}</p>`).join('')}
        </div>
        <div class="share-buttons">
            <p class="share-title">この記事をシェア</p>
            <div class="share-links">
                <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(news.title + ' - AiRia Official Website')}&url=${encodeURIComponent(window.location.href + '#' + news.id)}" 
                   target="_blank" rel="noopener noreferrer" class="share-link" aria-label="Twitterでシェア">
                    X
                </a>
                <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href + '#' + news.id)}" 
                   target="_blank" rel="noopener noreferrer" class="share-link" aria-label="Facebookでシェア">
                    FB
                </a>
                <a href="https://line.me/R/msg/text/?${encodeURIComponent(news.title + ' - AiRia Official Website\n' + window.location.href + '#' + news.id)}" 
                   target="_blank" rel="noopener noreferrer" class="share-link" aria-label="LINEでシェア">
                    LINE
                </a>
            </div>
        </div>
    `;
    
    openModal();
    
    // Update URL hash
    window.location.hash = news.id;
}

// Setup filter functionality
function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active state
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Update filter and reload news
            currentFilter = this.dataset.category;
            loadNews();
        });
    });
}

// Setup modal functionality
function setupModal() {
    const modal = document.getElementById('news-modal');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalClose = document.getElementById('modal-close');
    
    // Close modal when clicking overlay or close button
    modalOverlay.addEventListener('click', closeModal);
    modalClose.addEventListener('click', closeModal);
    
    // Close modal with ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

// Open modal
function openModal() {
    const modal = document.getElementById('news-modal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    const modal = document.getElementById('news-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Clear URL hash
    history.pushState('', document.title, window.location.pathname);
}

// Check URL hash and open specific news
function checkUrlHash() {
    const hash = window.location.hash.substring(1);
    if (hash) {
        const news = allNews.find(n => n.id === hash);
        if (news) {
            showNewsDetail(news);
        }
    }
}