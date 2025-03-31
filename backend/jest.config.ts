module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.ts?$": "ts-jest",
  },
  setupFilesAfterEnv: ["./prisma/singleton.ts"],
  transformIgnorePatterns: ["<rootDir>/node_modules/"],
};
