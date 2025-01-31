module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.ts?$": "ts-jest",
  },
  setupFilesAfterEnv: ["./backend/test/setup.ts"],
  transformIgnorePatterns: ["<rootDir>/node_modules/"],
};
