const base = require("./jest.config.base.js")

module.exports = {
  ...base,
  projects: ["<rootDir>/packages/*/jest.config.js"],
  coverageDirectory: "<rootDir>/coverage/",
  globals: {
    "ts-jest": {
      extends: "./babel.config.js",
    },
  },
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
}
