module.exports = {
  presets: [
    "@babel/preset-typescript",
    "@babel/preset-react",
    [
      "@babel/preset-env",
      {
        // useBuiltIns: "entry",
        targets: {
          node: "current",
        },
      },
    ],
  ],
  plugins: ["@babel/plugin-proposal-class-properties"],
}
