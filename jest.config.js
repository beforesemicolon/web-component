module.exports = {
  "roots": ["<rootDir>/src"],
  "testMatch": ["**/__tests__/**/*.+(ts)", "**/?(*.)+(spec|test).+(ts)"],
  "transform": {"^.+\\.(ts)$": "ts-jest"},
  "setupFiles": [
    "<rootDir>/src/__mocks__/dom.js"
  ],
}
