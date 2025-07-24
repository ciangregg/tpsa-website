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