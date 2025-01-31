export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
      '^.+\\.ts?$': 'ts-jest',
    },
    transformIgnorePatterns: ['<rootDir>/node_modules/'],
    // globalSetup: "<rootDir>/test/globalSetup.ts",
    // globalTeardown: "<rootDir>/test/globalTeardown.ts",
    // setUpFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  };