import jest from "eslint-plugin-jest";

export default [
    {
        files: [ "test/**/*.test.ts" ],
        ...jest.configs["flat/recommended"]
    }
]
