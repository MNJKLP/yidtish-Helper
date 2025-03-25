// content-script-loader.js
// This script checks Chrome storage settings before loading and executing other scripts

// Function to load a script conditionally based on storage setting
function loadScriptConditionally(scriptPath, settingKey) {
  try {
    // Get the setting from Chrome storage
    chrome.storage.local.get([settingKey], function(result) {
      try {
        // Only enable scripts when the setting is explicitly true
        const isEnabled = result[settingKey] === true;
        
        // Only load and execute the script if the setting is enabled
        if (isEnabled) {
          const script = document.createElement('script');
          script.src = chrome.runtime.getURL(scriptPath);
          script.onload = function() {
            // Optional: Remove the script element after loading
            this.remove();
          };
          (document.head || document.documentElement).appendChild(script);
        }
      } catch (e) {
        console.log("Extension context may have been invalidated during execution");
      }
    });
  } catch (e) {
    console.log("Extension context may have been invalidated");
  }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeScripts);
} else {
  initializeScripts();
}

// Initialize all scripts based on settings
function initializeScripts() {
  try {
    // Get settings and load scripts conditionally
    chrome.storage.local.get(['newResponse', 'enableNotifications', 'enableShortcuts', 'enableScolling', 'topicChangeNotification'], function(result) {
      try {
        // Load each script conditionally based on its corresponding setting
        loadScriptConditionally('js/newResponseNotification.js', 'newResponse');
        loadScriptConditionally('js/keyboard_shortcuts.js', 'enableShortcuts'); // Keyboard shortcuts controlled by enableShortcuts
        loadScriptConditionally('js/buttons.js', 'enableScolling'); // Post buttons controlled by enableScolling
        loadScriptConditionally('js/topicChangeNotification.js', 'topicChangeNotification'); // Topic change notification
        
        // Always load the notification check script
        // This is now loaded as a web accessible resource to comply with CSP
        const notificationCheckScript = document.createElement('script');
        notificationCheckScript.src = chrome.runtime.getURL('js/notification-check.js');
        (document.head || document.documentElement).appendChild(notificationCheckScript);
      } catch (e) {
        console.log("Extension context may have been invalidated during script loading");
      }
    });
  } catch (e) {
    console.log("Extension context may have been invalidated during initialization");
  }
}

// Create a custom event for notification checking
document.addEventListener('yidtishCheckNotifications', function() {
  try {
    chrome.runtime.sendMessage({type: 'checkNotifications'});
  } catch (e) {
    console.log("Could not send notification check message - extension context may be invalidated");
  }
});

// Initial check when content script loads
try {
  chrome.runtime.sendMessage({type: 'checkNotifications'});
} catch (e) {
  console.log("Could not send initial notification check message");
}
