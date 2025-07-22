// Contact page specific JavaScript

document.addEventListener('DOMContentLoaded', async function() {
    // Load content data
    const contentData = await loadData('/data/content.json');
    
    if (contentData && contentData.siteSettings) {
        // Update LINE information
        updateLineInfo(contentData.siteSettings.lineOfficialAccount);
    }
});

// Update LINE information
function updateLineInfo(lineInfo) {
    if (!lineInfo) return;
    
    const lineAddButton = document.getElementById('line-add-button');
    const lineId = document.getElementById('line-id');
    const lineQrCode = document.getElementById('line-qr-code');
    
    // Update LINE add button URL
    if (lineAddButton && lineInfo.addFriendUrl) {
        lineAddButton.href = lineInfo.addFriendUrl;
    }
    
    // Update LINE ID
    if (lineId && lineInfo.lineId) {
        lineId.textContent = lineInfo.lineId;
    }
    
    // Update QR code image
    if (lineQrCode && lineInfo.qrCodeImage) {
        lineQrCode.src = lineInfo.qrCodeImage;
    }
}