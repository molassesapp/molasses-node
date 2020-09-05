// Jest configuration for api
const base = require("../../jest.config.base.js")

module.exports = {
  ...base,
  name: "react",
  displayName: "ReactMolasses",
  collectCoverageFrom: ["src/**/*.{ts,tsx}"],
  rootDir: "../..",
}
