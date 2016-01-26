var request = window.superagent;

// Get settings
var apiKey = safari.extension.secureSettings.apiKey;
var targetLanguage = safari.extension.settings.targetLanguage;
var keyboardShortcut = safari.extension.settings.keyboardShortcut;

safari.application.addEventListener('command', performCommand, false);
safari.application.addEventListener('message', handleMessage, false);
safari.extension.settings.addEventListener('change', settingsChanged, false);
safari.extension.secureSettings.addEventListener('change', settingsChanged, false);

// Perform context menu commands
function performCommand(event) {
  switch (event.command) {
    case 'translateSelectedText':
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
      }

      safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('showPanel', '<div class="polyglot__loader">Loading</div>');

      if (apiKey === '') {
        safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('updatePanel', 'Set api key');
        return;
      } else if (targetLanguage === '') {
        safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('updatePanel', 'Set target language');
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
          if (res.body.error) {
            var error = res.body.error.errors[0];
            switch(error.reason) {
              case 'invalid':
                safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('updatePanel', "Target language is invalid. please check it again");
                break;
              case 'keyInvalid':
                safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('updatePanel', 'API key is invalid. please check it again');
                break;
            }
            return;
          }
          var translations = res.body.data.translations;
          var result = '';
          for (var t of translations) {
            result += t.translatedText + '<br/>';
          }
          safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('updatePanel', result);
        });

      break;
    case 'requestKeyboardShortcut':
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