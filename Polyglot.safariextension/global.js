import url from 'url';
import 'whatwg-fetch';

// Get settings
let targetLanguage = safari.extension.settings.targetLanguage;
let keyboardShortcut = safari.extension.settings.keyboardShortcut;

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
		default:

	}
}

// Handle message from injected script
function handleMessage(msg) {
	switch (msg.name) {
		case 'finishedGetSelectedText':
			handleFinishedGetSelectedText(msg);
			break;
		case 'requestKeyboardShortcut':
			handleRequestKeyboardShortcut(msg);
			break;
		default:
	}
}

function handleFinishedGetSelectedText(msg) {
	console.log(msg);
	if (msg.message === '') {
		return;
	}
	var target = msg.target;
	target.page.dispatchMessage('showPanel', '<div class="polyglot__loader">Loading</div>');

	if (targetLanguage === '') {
		target.page.dispatchMessage('updatePanel', 'Set target language');
		return;
	}

	const query = url.format({query: {
		client: 'gtx',
		sl: 'auto',
		tl: targetLanguage,
		dt: 't',
		q: msg.message
	}});
	const api = 'http://translate.googleapis.com/translate_a/single' + query;

	fetch(api)
		.then(response => {
			return response.text();
		}).then(body => {
			const data = JSON.parse(body.replace(/,,/g, ',null,').replace(/,,/g, ',null,'));
			const translatedText = data[0][0][0];
			target.page.dispatchMessage('updatePanel', translatedText);
		})
		.catch(err => {
			target.page.dispatchMessage('updatePanel', err);
		});
}

function handleRequestKeyboardShortcut(msg) {
	msg.target.page.dispatchMessage('keyboardShortcutReceived', keyboardShortcut);
}

// Update setting values immediately
function settingsChanged(event) {
	switch (event.key) {
		case 'targetLanguage':
			targetLanguage = event.newValue;
			break;
		case 'keyboardShortcut':
			keyboardShortcut = event.newValue;
			safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('keyboardShortcutReceived', keyboardShortcut);
			break;
		default:

	}
}
