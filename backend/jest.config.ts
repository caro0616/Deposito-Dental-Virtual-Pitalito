import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.spec.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: [
    'src/modules/catalog/**/*.ts',
    'src/modules/orders/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.module.ts',
    '!src/**/presentation/**/*.ts',
    '!src/**/dto/*.ts',
    '!src/**/infrastructure/persistence/**/*.ts',
    '!src/**/infrastructure/**/schemas/*.ts',
  ],
  coverageDirectory: 'coverage',
  clearMocks: true,
};

export default config;
