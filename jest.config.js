module.exports = {
    testRegex: '\\.test\\.ts$',
    testEnvironment: 'node',
    coveragePathIgnorePatterns: [
        '/node_modules/',
    ],
    moduleFileExtensions: [
        'js',
        'ts',
        'tsx',
    ],
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
    },
    globals: {
        'ts-jest': {
            tsconfig: 'tsconfig.json',
        },
    },
    preset: 'ts-jest',
    testMatch: null,
}