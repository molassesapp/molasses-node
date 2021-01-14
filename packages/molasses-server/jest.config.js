// Jest configuration for api
const base = require("../../jest.config.base.js")

module.exports = {
  ...base,
  name: "Server",
  displayName: "MolassesServer",
  collectCoverageFrom: ["src/**/*.{ts,tsx}"],
  rootDir: "../..",
  setupFiles: ["./packages/molasses-server/__tests__/setupFiles"],
}
