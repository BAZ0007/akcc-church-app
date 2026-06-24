import type { Config } from "jest";

const config: Config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: { jsx: "react-jsx" } }],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^next/navigation$": "<rootDir>/src/__mocks__/next-navigation.ts",
    "^next/image$": "<rootDir>/src/__mocks__/next-image.tsx",
    "^next/server$": "<rootDir>/src/__mocks__/next-server.ts",
  },
  testMatch: ["**/__tests__/**/*.test.ts?(x)"],
};

export default config;
