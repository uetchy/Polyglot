var path = require("path");

module.exports = {
  context: path.join(__dirname, "Polyglot.safariextension"),
  entry: {
    global: "./global.js",
    injected: "./injected.js"
  },
  output: {
    path: path.join(__dirname, "Polyglot.safariextension"),
    filename: "[name].entry.js"
  }
  // module: {
  //   loaders: [{
  //     test: /\.js$/,
  //     exclude: /(node_modules|bower_components)/,
  //     loader: 'babel',
  //     query: {
  //       presets: ['es2015'],
  //       plugins: ['transform-runtime']
  //     }
  //   }]
  // }
};
