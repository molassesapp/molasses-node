// Jest configuration for api
const base = require("../../jest.config.base.js")

module.exports = {
  ...base,
  name: "js",
  displayName: "Molassesjs",
  collectCoverageFrom: ["src/**/*.{ts,tsx}"],
  rootDir: "../..",
}
