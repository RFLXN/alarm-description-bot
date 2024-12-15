import eslint from "@eslint/js";
import typescriptEslint from "typescript-eslint";
import stylistic from "./eslint.style.mjs";
import jest from "./eslint.jest.mjs"

const config = typescriptEslint.config(
    eslint.configs.recommended,
    {
        files: [ "**/*.ts" ],
        languageOptions: {
            parserOptions: {
                project: [ "./tsconfig.json", "./tsconfig.test.json" ],
                tsconfigRootDir: import.meta.dirname
            }
        }
    },
    ...typescriptEslint.configs.recommendedTypeChecked,
    ...typescriptEslint.configs.stylisticTypeChecked,
    ...stylistic,
    ...jest
)

export default config;
