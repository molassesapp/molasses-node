// Jest configuration for api
const base = require("../../jest.config.base.js")

module.exports = {
  ...base,
  name: "common",
  displayName: "MolassesCommon",
  collectCoverageFrom: ["src/**/*.{ts,tsx}"],
  rootDir: "../..",
}
