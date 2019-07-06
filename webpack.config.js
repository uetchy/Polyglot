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
        test: /\.ts$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-typescript'],
          },
        },
      },
    ],
  },
}
