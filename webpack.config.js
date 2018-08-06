const { resolve } = require('path')

const extensionPath = resolve(__dirname, 'PolyglotSafariExtension')

module.exports = {
  context: extensionPath,
  entry: {
    global: ['./global.js'],
    content: ['./content.js'],
  },
  output: {
    path: extensionPath,
    filename: '[name].entry.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: 'babel-loader',
      },
    ],
  },
}
