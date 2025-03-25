// notification-check.js
// This script runs in the page context and doesn't rely on Chrome APIs

// Function to dispatch our custom event
function triggerNotificationCheck() {
  document.dispatchEvent(new CustomEvent('yidtishCheckNotifications'));
}

// Set up a debounce mechanism
let notificationCheckTimeout = null;
function debouncedCheck() {
  if (notificationCheckTimeout) {
    clearTimeout(notificationCheckTimeout);
  }
  notificationCheckTimeout = setTimeout(function() {
    triggerNotificationCheck();
  }, 1000); // Wait 1 second after interaction before checking
}

// Check notifications when page loads
document.addEventListener('DOMContentLoaded', function() {
  triggerNotificationCheck();
});

// Check notifications after user interactions (clicks)
document.addEventListener('click', function() {
  debouncedCheck();
});

// Also check on page visibility changes (when user returns to the tab)
document.addEventListener('visibilitychange', function() {
  if (document.visibilityState === 'visible') {
    triggerNotificationCheck();
  }
});

// Check when user submits forms (posting replies, etc.)
document.addEventListener('submit', function() {
  debouncedCheck();
});

console.log('Yidtish notification check script loaded in page context');
