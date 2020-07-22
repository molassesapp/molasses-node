const base = require("./jest.config.base.js")

module.exports = {
  ...base,
  projects: ["<rootDir>/packages/*/jest.config.js"],
  coverageDirectory: "<rootDir>/coverage/",
  preset: "ts-jest",
  globals: {
    "ts-jest": {
      extends: "./babel.config.js",
    },
  },
  moduleNameMapper: {
    "@molassesapp/(.*)$": "<rootDir>/packages/$1",
  },
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
}
