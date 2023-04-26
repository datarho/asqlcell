module.exports = {
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:react/recommended",
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: "tsconfig.eslint.json",
        sourceType: "module"
    },
    plugins: ["@typescript-eslint"],
    rules: {
        "@typescript-eslint/no-unused-vars": ["warn", { args: "none" }],
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-namespace": "off",
        "@typescript-eslint/no-use-before-define": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        // "@typescript-eslint/quotes": [
        //     "error",
        //     "double",
        //     { avoidEscape: true, allowTemplateLiterals: false }
        // ],
        "react/display-name": "off",
        curly: ["error", "all"],
        eqeqeq: "error",
        "prefer-arrow-callback": "error"
    }
};