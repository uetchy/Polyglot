const { resolve } = require('path')
const extensionPath = resolve(__dirname, 'PolyglotSafariExtension')

module.exports = {
  context: extensionPath,
  entry: {
    content: ['../ContentScript/content.js'],
  },
  output: {
    path: extensionPath,
    filename: '[name].bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
}
