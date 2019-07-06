const { resolve } = require('path')
const extensionPath = resolve(__dirname, 'PolyglotSafariExtension')

module.exports = {
  mode: 'development',
  entry: './PolyglotSafariExtension/src/content.ts',
  output: {
    filename: 'content.bundle.js',
    path: resolve(extensionPath, 'dist'),
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
