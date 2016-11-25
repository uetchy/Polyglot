import url from 'url';
import 'whatwg-fetch'; // eslint-disable-line import/no-unassigned-import

export function translate(text, targetLanguage) {
	return new Promise((resolve, reject) => {
		const query = url.format({query: {
			client: 'gtx',
			sl: 'auto',
			tl: targetLanguage,
			dt: 't',
			q: text
		}});
		const endpoint = 'http://translate.googleapis.com/translate_a/single' + query;

		fetch(endpoint)
			.then(response => response.text())
			.then(body => {
				const data = JSON.parse(body.replace(/,,/g, ',null,').replace(/,,/g, ',null,'));
				const translatedText = data[0]
					.map(sentence => sentence[0])
					.join('<br/>');
				resolve(translatedText);
			})
			.catch(err => {
				reject(err);
			});
	});
}
