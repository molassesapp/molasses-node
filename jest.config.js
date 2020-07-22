// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  moduleFileExtensions: ["ts", "tsx", "js"],
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.ts?$",
  testPathIgnorePatterns: ["/node_modules/", "(/__tests__/.*|(\\.|/)(test|spec))\\.d.ts$"],
  // setupFilesAfterEnv: ['<rootDir>packages/setupTests.ts'],
  clearMocks: true,

  coverageDirectory: "coverage",
  coverageProvider: "babel",

  testEnvironment: "node",
  coverageReporters: ["text", "html"],
}
