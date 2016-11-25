const {resolve} = require('path');

const extensionPath = resolve(__dirname, 'Polyglot.safariextension');

module.exports = {
	context: extensionPath,
	entry: {
		global: ['babel-polyfill', './global.js'],
		injected: ['babel-polyfill', './injected.js']
	},
	output: {
		path: extensionPath,
		filename: '[name].entry.js'
	},
	module: {
		loaders: [{
			test: /\.js$/,
			exclude: /(node_modules|bower_components)/,
			loader: 'babel',
			query: {
				presets: ['es2015']
			}
		}]
	}
};
