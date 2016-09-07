import url from 'url';
import 'whatwg-fetch';

// Get settings
let settings = {};
Object.keys(safari.extension.settings).forEach(key => {
	settings[key] = safari.extension.settings[key];
});

// Set event handler
safari.application.addEventListener('command', performCommand, false);
safari.application.addEventListener('message', handleMessage, false);
safari.extension.settings.addEventListener('change', settingsChanged, false);

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
		case 'getSettings':
			handleGetSettings(msg);
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

	if (settings.targetLanguage === '') {
		target.page.dispatchMessage('updatePanel', 'Set target language');
		return;
	}

	const query = url.format({query: {
		client: 'gtx',
		sl: 'auto',
		tl: settings.targetLanguage,
		dt: 't',
		q: msg.message
	}});
	const api = 'http://translate.googleapis.com/translate_a/single' + query;

	fetch(api)
		.then(response => {
			return response.text();
		})
		.then(body => {
			const data = JSON.parse(body.replace(/,,/g, ',null,').replace(/,,/g, ',null,'));
			const translatedText = data[0][0][0];
			target.page.dispatchMessage('updatePanel', translatedText);
		})
		.catch(err => {
			target.page.dispatchMessage('updatePanel', err);
		});
}

function handleGetSettings(msg) {
	msg.target.page.dispatchMessage('settingsReceived', settings);
}

// Update setting values immediately
function settingsChanged(event) {
	settings[event.key] = event.newValue;
}
