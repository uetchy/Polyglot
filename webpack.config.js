const { resolve } = require("path");
const TerserPlugin = require("terser-webpack-plugin");

const extensionPath = resolve(__dirname, "PolyglotSafariExtension");

const isDevelopment = process.env.NODE_ENV !== "production";

module.exports = {
  devtool: isDevelopment ? "eval-source-map" : undefined,
  entry: "./PolyglotSafariExtension/Sources/content.ts",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: "ts-loader",
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "content.bundle.js",
    path: resolve(extensionPath, "ContentScript"),
  },
  optimization: {
    minimize: !isDevelopment,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
          },
        },
      }),
    ],
  },
};
