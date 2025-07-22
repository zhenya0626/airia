// Music page specific JavaScript

document.addEventListener('DOMContentLoaded', async function() {
    // Load content data
    const contentData = await loadData('/data/content.json');
    
    if (contentData) {
        // Load songs
        loadSongs(contentData.songs);
    }
    
    // Setup audio player
    setupAudioPlayer();
});

// Load and display songs
function loadSongs(songsData) {
    const songsGrid = document.getElementById('songs-grid');
    
    if (!songsData || songsData.length === 0) {
        songsGrid.innerHTML = '<p class="no-content">楽曲情報を読み込めませんでした。</p>';
        return;
    }
    
    // Sort by release date (newest first)
    const sortedSongs = songsData.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
    
    songsGrid.innerHTML = '';
    
    sortedSongs.forEach(song => {
        const songCard = createSongCard(song);
        songsGrid.appendChild(songCard);
    });
}

// Create song card element
function createSongCard(song) {
    const card = document.createElement('div');
    card.className = 'song-card';
    
    card.innerHTML = `
        <div class="song-cover" onclick="playPreview('${song.previewUrl}', '${song.title}', '${song.coverArt}')">
            <img src="${song.coverArt}" alt="${song.title}" loading="lazy">
            <div class="play-overlay">
                <div class="play-button">▶</div>
            </div>
        </div>
        <div class="song-info">
            <h3 class="song-title">${song.title}</h3>
            <p class="song-date">${formatDate(song.releaseDate)}</p>
            <div class="streaming-links">
                ${song.streamingLinks.map(link => `
                    <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="streaming-link" onclick="event.stopPropagation()">
                        ${link.platform}
                    </a>
                `).join('')}
            </div>
        </div>
    `;
    
    return card;
}

// Play preview
function playPreview(previewUrl, title, coverArt) {
    const player = document.getElementById('audio-player');
    const playerAudio = document.getElementById('player-audio');
    const playerSource = document.getElementById('player-source');
    const playerTitle = document.getElementById('player-title');
    const playerCover = document.getElementById('player-cover');
    
    // Update player info
    playerTitle.textContent = title;
    playerCover.src = coverArt;
    playerCover.alt = title;
    
    // Update audio source
    playerSource.src = previewUrl;
    playerAudio.load();
    playerAudio.play();
    
    // Show player
    player.classList.add('active');
}

// Setup audio player
function setupAudioPlayer() {
    const player = document.getElementById('audio-player');
    const playerClose = document.getElementById('player-close');
    const playerAudio = document.getElementById('player-audio');
    
    // Close player
    playerClose.addEventListener('click', function() {
        playerAudio.pause();
        player.classList.remove('active');
    });
    
    // Close player when audio ends
    playerAudio.addEventListener('ended', function() {
        setTimeout(() => {
            player.classList.remove('active');
        }, 1000);
    });
}

// Make playPreview function global
window.playPreview = playPreview;