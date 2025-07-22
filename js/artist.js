// Artist page specific JavaScript

document.addEventListener('DOMContentLoaded', async function() {
    // Load content data
    const contentData = await loadData('/data/content.json');
    
    if (contentData) {
        // Load members
        loadMembers(contentData.members);
    }
    
    // Setup modal functionality
    setupModal();
});

// Load and display members
function loadMembers(membersData) {
    const membersGrid = document.getElementById('members-grid');
    
    if (!membersData || membersData.length === 0) {
        membersGrid.innerHTML = '<p class="no-content">メンバー情報を読み込めませんでした。</p>';
        return;
    }
    
    membersGrid.innerHTML = '';
    
    membersData.forEach(member => {
        const memberCard = createMemberCard(member);
        membersGrid.appendChild(memberCard);
    });
}

// Create member card element
function createMemberCard(member) {
    const card = document.createElement('div');
    card.className = 'member-card';
    card.onclick = () => showMemberDetail(member);
    
    card.innerHTML = `
        <div class="member-image">
            <img src="${member.profileImage}" alt="${member.name}" loading="lazy">
        </div>
        <h3 class="member-name">${member.name}</h3>
        <p class="member-name-en">${member.nameEn}</p>
        <p class="member-bio">${member.bio}</p>
    `;
    
    return card;
}

// Show member detail in modal
function showMemberDetail(member) {
    const modalBody = document.getElementById('modal-body');
    
    modalBody.innerHTML = `
        <div class="modal-member">
            <div class="modal-member-image">
                <img src="${member.profileImage}" alt="${member.name}">
            </div>
            <div class="modal-member-info">
                <h3>${member.name}</h3>
                <p class="member-name-en">${member.nameEn}</p>
                <p>${member.bio}</p>
                <div class="member-social-links">
                    ${member.socialLinks.map(link => `
                        <a href="${link.url}" target="_blank" rel="noopener noreferrer" aria-label="${link.platform}">
                            ${getSocialIcon(link.platform)}
                        </a>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    openModal();
}

// Get social media icon
function getSocialIcon(platform) {
    const icons = {
        twitter: 'X',
        instagram: 'IG',
        youtube: 'YT',
        tiktok: 'TT'
    };
    return icons[platform.toLowerCase()] || platform.charAt(0).toUpperCase();
}

// Setup modal functionality
function setupModal() {
    const modal = document.getElementById('member-modal');
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
    const modal = document.getElementById('member-modal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    const modal = document.getElementById('member-modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}