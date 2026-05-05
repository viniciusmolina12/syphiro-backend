/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    globalSetup: './setup-tests.ts',
    roots: ['<rootDir>/src'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    testMatch: ['**/?(*.)+(spec|test).[tj]s?(x)'],
    clearMocks: true,
    maxWorkers: 1,

    coverageDirectory: 'coverage',
    moduleNameMapper: {
        '^@shared/(.*)$': '<rootDir>/src/@shared/$1',
        '^@character/(.*)$': '<rootDir>/src/character/$1',
        '^@class/(.*)$': '<rootDir>/src/class/$1',
        '^@combat/(.*)$': '<rootDir>/src/combat/$1',
        '^@enemy/(.*)$': '<rootDir>/src/enemy/$1',
        '^@instance/(.*)$': '<rootDir>/src/instance/$1',
        '^@player/(.*)$': '<rootDir>/src/player/$1',
        '^@profession/(.*)$': '<rootDir>/src/profession/$1',
        '^@skill/(.*)$': '<rootDir>/src/skill/$1',
        '^@auth/(.*)$': '<rootDir>/src/auth/$1',
        '^@campaign/(.*)$': '<rootDir>/src/campaign/$1',
    },
};

