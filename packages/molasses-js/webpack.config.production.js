"use strict"

const webpack = require("webpack")

const config = {
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
config.plugins = [
  new webpack.optimize.OccurrenceOrderPlugin(),
  new webpack.DefinePlugin({
    "process.env.NODE_ENV": JSON.stringify("production"),
  }),
]
config.mode = "production"
module.exports = config
