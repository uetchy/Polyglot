import request from 'superagent';

// Get settings
var apiKey = safari.extension.secureSettings.apiKey;
var targetLanguage = safari.extension.settings.targetLanguage;
var keyboardShortcut = safari.extension.settings.keyboardShortcut;

// Set event handler
safari.application.addEventListener('command', performCommand, false);
safari.application.addEventListener('message', handleMessage, false);
safari.extension.settings.addEventListener('change', settingsChanged, false);
safari.extension.secureSettings.addEventListener('change', settingsChanged, false);

// Perform commands from users
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
      var target = msg.target;
      target.page.dispatchMessage('showPanel', '<div class="polyglot__loader">Loading</div>');

      if (apiKey === '') {
        target.page.dispatchMessage('updatePanel', 'Set API key. See <a href="https://git.io/vzQ2y" target="_blank">visual guide</a>');
        return;
      } else if (targetLanguage === '') {
        target.page.dispatchMessage('updatePanel', 'Set target language');
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
          // Handle errors
          if (res.body.error) {
            var error = res.body.error.errors[0];
            switch (error.reason) {
              case 'invalid':
                target.page.dispatchMessage('updatePanel', "Target language is invalid. please check it");
                break;
              case 'keyInvalid':
                target.page.dispatchMessage('updatePanel', 'API key is invalid. please check it');
                break;
            }
            return;
          }

          var translations = res.body.data.translations;
          var result = '';
          for (var t of translations) {
            result += t.translatedText + '<br/>';
          }

          target.page.dispatchMessage('updatePanel', result);
        });

      break;
    case 'requestKeyboardShortcut':
      msg.target.page.dispatchMessage('keyboardShortcutReceived', keyboardShortcut);
  }
}

// Update setting values immediately
function settingsChanged(event) {
  switch (event.key) {
    case 'apiKey':
      apiKey = event.newValue;
      break;
    case 'targetLanguage':
      targetLanguage = event.newValue;
      break;
    case 'keyboardShortcut':
      keyboardShortcut = event.newValue;
      safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('keyboardShortcutReceived', keyboardShortcut);
      break;
  }
}
