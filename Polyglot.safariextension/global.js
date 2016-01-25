var request = window.superagent;

safari.application.addEventListener('command', performCommand, false);
safari.application.addEventListener('message', handleMessage, false);

function performCommand(event) {
  if (event.command === 'contextMenuTranslate') {
    safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('getSelectedText');
  }
}

function handleMessage(msg) {
  console.log(window.top);
  if (msg.name === 'finishedGetSelectedText') {
    console.log(msg.message);
    var apiKey = safari.extension.secureSettings.apiKey;
    var targetLanguage = safari.extension.settings.targetLanguage;

    if (msg.message === '') {
      console.log("Select message first");
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
        console.log(res);
        var translations = res.body.data.translations;
        for (var t of translations) {
          console.log(t.translatedText, t.detectedSourceLanguage);
        }
        safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('showPanel', translations);
      });
  }
}

// safari.application.addEventListener("popover", popoverHandler, true);
