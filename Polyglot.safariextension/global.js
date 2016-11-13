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
	const {command} = event;
	if (command === 'translateSelectedText') {
		safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('getSelectedText');
	}
}

// Handle message from injected script
function handleMessage(msg) {
	const {name} = msg;
	if (name === 'finishedGetSelectedText') {
		handleFinishedGetSelectedText(msg);
	} else if (name === 'getSettings') {
		handleGetSettings(msg);
	}
}

async function handleFinishedGetSelectedText(msg) {
	if (msg.message === '') {
		return;
	}
	const target = msg.target;
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

	try {
		const response = await fetch(api);
		const body = await response.text();
		const data = JSON.parse(body.replace(/,,/g, ',null,').replace(/,,/g, ',null,'));
		console.log(data[0]);
		const translatedText = data[0]
			.map(sentence => sentence[0])
			.join('<br/>');
		target.page.dispatchMessage('updatePanel', translatedText);
	} catch (err) {
		target.page.dispatchMessage('updatePanel', err);
	}
}

function handleGetSettings(msg) {
	msg.target.page.dispatchMessage('settingsReceived', settings);
}

// Update setting values immediately
function settingsChanged(event) {
	settings[event.key] = event.newValue;
	safari.application.activeBrowserWindow.activeTab.page.dispatchMessage('settingsReceived', settings);
}
