function showPopup(title, message) {
  document.getElementById('popup-title').textContent = title;
  document.getElementById('popup-message').innerHTML = message;
  document.getElementById('popup').style.display = 'block';
  
  // Prevent body scrolling when popup is open
  document.body.style.overflow = 'hidden';
}

function closePopup() {
  document.getElementById('popup').style.display = 'none';
  
  // Restore body scrolling
  document.body.style.overflow = 'auto';
}

// Close popup when pressing Escape key
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    closePopup();
  }
});

// Language switching functionality
function switchLanguage(language) {
    const englishContent = document.getElementById('content-english');
    const irishContent = document.getElementById('content-irish');
    const englishNotice = document.getElementById('pdf-notice-english');
    const irishNotice = document.getElementById('pdf-notice-irish');
    const englishBtn = document.getElementById('btn-english');
    const irishBtn = document.getElementById('btn-irish');

    // Check if elements exist (we're on constitution page)
    if (!englishContent || !irishContent) return;

    if (language === 'english') {
        englishContent.style.display = 'block';
        irishContent.style.display = 'none';
        if (englishNotice) englishNotice.style.display = 'block';
        if (irishNotice) irishNotice.style.display = 'none';
        if (englishBtn) englishBtn.classList.add('active');
        if (irishBtn) irishBtn.classList.remove('active');
    } else if (language === 'irish') {
        englishContent.style.display = 'none';
        irishContent.style.display = 'block';
        if (englishNotice) englishNotice.style.display = 'none';
        if (irishNotice) irishNotice.style.display = 'block';
        if (englishBtn) englishBtn.classList.remove('active');
        if (irishBtn) irishBtn.classList.add('active');
    }
}

// Initialize language toggle when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit more to ensure all content is loaded
    setTimeout(function() {
        if (document.getElementById('content-english')) {
            switchLanguage('english');
        }
    }, 100);
});

// Hero language toggle functionality
let currentHeroLanguage = 'english';

function toggleHeroLanguage() {
    const englishContent = document.getElementById('content-english');
    const irishContent = document.getElementById('content-irish');
    
    if (!englishContent || !irishContent) return;
    
    if (currentHeroLanguage === 'english') {
        englishContent.style.display = 'none';
        irishContent.style.display = 'block';
        currentHeroLanguage = 'irish';
    } else {
        englishContent.style.display = 'block';
        irishContent.style.display = 'none';
        currentHeroLanguage = 'english';
    }
}