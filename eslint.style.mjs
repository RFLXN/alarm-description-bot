import stylistic from "@stylistic/eslint-plugin";

export default [
    stylistic.configs.customize({
        braceStyle: "1tbs",
        indent: 4,
        quotes: "double",
        semi: true,
        blockSpacing: true,
        commaDangle: "never"
    })
]
