// background.js for yidtish forum
const notificationUrl = "https://forum.yidtish.com/ucp.php?i=ucp_notifications";

const defualtPreferences = {
  hideUserName: false,
  alwaysCopyTopic: false,
  copyAttachments: true,
  getBrowserNotifications: false,
  warnOnLosingPost: true,
  debugMode: false,
  backgroundSync: true,
  backgroundSyncPosts: 20000,
  backgroundSyncNotif: 1,
  cachedTopicMappingExpire: 3600,
  forceUpdateTopicMapCache: false,
  stickyPostButtons: false,
  // Add these new settings
  newResponse: true,
  enableNotifications: true,
  enableShortcuts: true,
  enableScolling: true,
  topicChangeNotification: true
};

let debugQueue = {};
let debugQueueTimeout;
const debugLogPrefix = 'debug-';

let checkNewNotification = function () {
  // First check if notifications are enabled before proceeding
  chrome.storage.local.get(['enableNotifications'], function(items) {
    // Only proceed if notifications are explicitly enabled
    if (items.enableNotifications === true) {
      fetch(notificationUrl)
        .then((response) => response.text())
        .then((data) => {
        // Updated regex to match the yidtish HTML structure
        let matches = 
          data.match(/id="notification_list_button"[\s\S]*?<strong class="badge">(\d+)<\/strong>/) || [];
        let newCount = matches.length === 2 ? matches[1] : "0";

        if (newCount !== "0") {
          chrome.action.setBadgeText({ text: newCount });
          chrome.action.setBadgeBackgroundColor({ color: '#FF0000' });
        } else {
          chrome.action.setBadgeText({ text: "" });
        }

        // trigger browser notifications
        chrome.storage.local.get(['getBrowserNotifications'], function(items){
          if(items.getBrowserNotifications){
            parseAndSendNotifications(data);
          }
        });

        const debugDate = new Date();
        debugLog('backgroundSync', `checkNewNotification: newCount(${newCount}), ${debugDate.getUTCMinutes()}:${debugDate.getUTCSeconds()})`);
      })
      .catch(error => {
        console.error("Error fetching notifications:", error);
        debugLog('backgroundSync', `Error fetching notifications: ${error.message}`);
      });
    } else {
      // Clear any existing badge when notifications are disabled
      chrome.action.setBadgeText({ text: "" });
    }
  });
};

chrome.alarms.onAlarm.addListener(() => {
  checkNewNotification();
});

chrome.runtime.onInstalled.addListener((details) => {
  // Migrate settings from sync storage to local storage
  chrome.storage.sync.get(null, function (items) {
    if (Object.keys(items).length > 0) {
      Object.keys(items).forEach((key) => {
        chrome.storage.local.set({ [key]: items[key] });
        chrome.storage.sync.remove(key);
      });
    }
  });

  if (details.reason === "update" || details.reason === "install") {
    // Get current settings in local storage
    chrome.storage.local.get(null, (currentSettings) => {
      const updatedSettings = { ...currentSettings };
      const addedSettings = []; // Track added settings

      // Add missing settings from defaultPreferences
      Object.keys(defualtPreferences).forEach((key) => {
        if (!(key in currentSettings)) {
          updatedSettings[key] = defualtPreferences[key];
          addedSettings.push(key); // Track the key being added
        }
      });

      // Save updated settings back to local storage
      chrome.storage.local.set(updatedSettings, () => {
        // Settings saved
      });
    });
  }

  // Set default settings to storage if not already present (fresh install or otherwise)
  chrome.storage.local.get({
    ...defualtPreferences,
    isFreshInstall: true // needed for initial notifications
  }, function(items){
    if(items && Object.keys(items).length)
      chrome.storage.local.set(items);

    // Only set up alarm if notifications are enabled
    chrome.storage.local.get(['enableNotifications'], function(notifItems) {
      if (notifItems.enableNotifications === true) {
        alarmToFetch(items.backgroundSync, parseInt(items.backgroundSyncNotif));
      }
    });
  });
  
  // Run immediately after installation only if notifications are enabled
  chrome.storage.local.get(['enableNotifications'], function(items) {
    if (items.enableNotifications === true) {
      checkNewNotification();
    }
  });
});

chrome.runtime.onMessage.addListener(function (request) {
  if(request.type === 'badgeText'){
    chrome.action.setBadgeText({ text: request.text });
  }

  // global method to send a notification
  if(request.type === 'browserNotification'){
    // Check if notifications are enabled before sending
    chrome.storage.local.get(['enableNotifications'], function(items) {
      if (items.enableNotifications === true) {
        queueNotification(request);
      }
    });
  }
  
  // Add handler for checkNotifications message from content script
  if(request.type === 'checkNotifications'){
    // Check if notifications are enabled before proceeding
    chrome.storage.local.get(['enableNotifications'], function(items) {
      if (items.enableNotifications === true) {
        checkNewNotification();
      }
    });
  }
});

chrome.storage.onChanged.addListener((changes, area) => {
  if(area !== 'local')
    return;

  // clean debug logs when turned off
  if(changes.debugMode && changes.debugMode.newValue === false){
    chrome.storage.local.get(null, items => {
      Object.keys(items).forEach(key => {
        if(key.indexOf(debugLogPrefix) === 0)
          chrome.storage.local.remove(key);
      })
    })
  }

  // Handle notification setting changes
  if(changes.enableNotifications) {
    if(changes.enableNotifications.newValue === true) {
      // Notifications were enabled, set up alarm
      chrome.storage.local.get(['backgroundSync', 'backgroundSyncNotif'], items => {
        alarmToFetch(items.backgroundSync, parseInt(items.backgroundSyncNotif));
      });
    } else {
      // Notifications were disabled, clear alarm and badge
      chrome.alarms.clear("alarm");
      chrome.action.setBadgeText({ text: "" });
    }
  }

  if(changes.backgroundSync || changes.backgroundSyncNotif){
    // Only update alarm if notifications are enabled
    chrome.storage.local.get(['enableNotifications', 'backgroundSync', 'backgroundSyncNotif'], items => {
      if (items.enableNotifications === true) {
        alarmToFetch(items.backgroundSync, parseInt(items.backgroundSyncNotif));
      }
    });
  }
});

function alarmToFetch(create, frequency){
  debugLog('backgroundSync', `alarmToFetch(${create}, ${frequency})`);
  if(create){
    chrome.alarms.create("alarm", { periodInMinutes: frequency });
  }
  else {
    chrome.alarms.clear("alarm");
  }
}

// will create a storage entry and keep on adding values
function debugLog(name, valueToPush){
  debugQueue[name] = debugQueue[name] ? debugQueue[name].push(valueToPush) && debugQueue[name] : [valueToPush];

  if(debugQueueTimeout)
    clearTimeout(debugQueueTimeout);

  debugQueueTimeout = setTimeout(() => {
    chrome.storage.local.get('debugMode', items => {
      if(items.debugMode){
        // log all from the queue
        Object.keys(debugQueue).forEach(key => {
          commitDebugLog(key, debugQueue[key]);
          delete debugQueue[key];
        });
      }
    });
  }, 1000);
}

function commitDebugLog(name, values){
  name = debugLogPrefix + name;
  chrome.storage.local.get(name, ({[name]: item}) => {
    if(item)
      chrome.storage.local.set({[name]: item.concat(values)});
    else
      chrome.storage.local.set({[name]: values});
  })
}

// Basic notification parsing function
function parseAndSendNotifications(data) {
  // This is a placeholder - you'll need to create a more complete notifications.js file
  // or add the notification parsing logic here
}

// Placeholder for notification queue
function queueNotification(request) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: chrome.runtime.getURL("images/icon48.png"),
    title: request.title || "Yidtish Forum",
    message: request.message || "You have new notifications!"
  });
}
