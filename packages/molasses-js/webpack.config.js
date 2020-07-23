"use strict"

const webpack = require("webpack")

const config = {
  mode: "development",
  module: {
    rules: [
      {
        test: /(\.js|\.jsx)$/,
        use: { loader: "babel-loader" },
        exclude: /node_modules/,
      },
      {
        test: /\.ts(x?)$/,
        use: ["babel-loader", "ts-loader"],
        exclude: /node_modules/,
      },
    ],
  },
  output: {
    library: "MolassesJS",
    libraryTarget: "umd",
  },
  resolve: {
    extensions: [".jsx", ".js", ".tsx", ".ts"],
  },
}
config.plugins = [new webpack.optimize.OccurrenceOrderPlugin()]

module.exports = config
