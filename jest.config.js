/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  roots: ["<rootDir>/src"],
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: [
    "<rootDir>/src/__mocks__/dom.js"
  ],
};
