// Function to load saved settings from Chrome storage
function loadSettings() {
  chrome.storage.local.get({
    // Provide default values for all settings
    'newResponse': true,
    'enableNotifications': true,
    'enableShortcuts': true,
    'enableScolling': true,
    'topicChangeNotification': true
  }, function(items) {
    // Set the checkbox states based on the stored values with defaults
    document.getElementById('newResponse').checked = items.newResponse;
    document.getElementById('enableNotifications').checked = items.enableNotifications;
    document.getElementById('enableShortcuts').checked = items.enableShortcuts;
    document.getElementById('enableScolling').checked = items.enableScolling;
    document.getElementById('topicChangeNotification').checked = items.topicChangeNotification;
  });
}

// Call the loadSettings function when the page loads
document.addEventListener('DOMContentLoaded', function() {
  loadSettings();
  
  // Event listener for the "Save" button
  document.getElementById('saveSettings').addEventListener('click', function() {
    // Get the checkbox states
    const newResponse = document.getElementById('newResponse').checked;
    const enableNotifications = document.getElementById('enableNotifications').checked;
    const enableShortcuts = document.getElementById('enableShortcuts').checked;
    const enableScolling = document.getElementById('enableScolling').checked; // Fixed variable name
    const topicChangeNotification = document.getElementById('topicChangeNotification').checked;
    
    // Store the values in chrome.storage.local
    chrome.storage.local.set({
      'newResponse': newResponse,
      'enableNotifications': enableNotifications,
      'enableShortcuts': enableShortcuts,
      'enableScolling': enableScolling, // Fixed to match the variable name
      'topicChangeNotification': topicChangeNotification
    }, function() {
      // Automatically close the popup after saving
      window.close();
    });
  });
});
