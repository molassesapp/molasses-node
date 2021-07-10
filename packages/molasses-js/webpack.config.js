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
        use: [
          "babel-loader",
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
            },
          },
        ],
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

module.exports = config
