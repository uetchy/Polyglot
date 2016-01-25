var request = window.superagent;

// Get settings
var apiKey = safari.extension.secureSettings.apiKey;
var targetLanguage = safari.extension.settings.targetLanguage;
var keyboardShortcut = safari.extension.settings.keyboardShortcut;
console.log(safari.extension);
safari.application.addEventListener('command', performCommand, false);
safari.application.addEventListener('message', handleMessage, false);
safari.extension.settings.addEventListener('change', settingsChanged, false);

// Perform context menu commands
function performCommand(event) {
  switch (event.command) {
    case 'contextMenuTranslate':
      safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('getSelectedText');
      break;
  }
}

// Handle message from injected script
function handleMessage(msg) {
  switch (msg.name) {
    case 'finishedGetSelectedText':
      if (msg.message === '') {
        return;
      } else if (apiKey === '') {
        console.log("Set api key");
        return;
      } else if (targetLanguage === '') {
        console.log("Set target language");
        return;
      }

      request
        .get('https://www.googleapis.com/language/translate/v2')
        .query({
          key: apiKey,
          target: targetLanguage,
          q: msg.message
        })
        .set('Accept', 'application/json')
        .end(function(err, res) {
          var translations = res.body.data.translations;
          for (var t of translations) {
            console.log(t.translatedText, t.detectedSourceLanguage);
          }
          safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('showPanel', translations);
        });

      break;
    case 'requestKeyboardShortcut':
      console.log(keyboardShortcut);
      safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('keyboardShortcutReceived', keyboardShortcut);
  }
}

function settingsChanged(e) {
  switch (e.key) {
    case 'apiKey':
      apiKey = e.newValue;
      break;
    case 'targetLanguage':
      targetLanguage = e.newValue;
      break;
    case 'keyboardShortcut':
      keyboardShortcut = e.newValue;
      break;
  }
}
