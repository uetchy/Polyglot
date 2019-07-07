const { resolve } = require('path')
const extensionPath = resolve(__dirname, 'PolyglotSafariExtension')

module.exports = {
  mode: 'development',
  entry: './PolyglotSafariExtension/Sources/content.ts',
  output: {
    filename: 'content.bundle.js',
    path: resolve(extensionPath, 'ContentScript'),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
    ],
  },
}
