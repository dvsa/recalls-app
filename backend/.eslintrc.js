module.exports = {
    'env': {
        'node': true,
        'es6': true,
        'mocha': true
    },
    "extends": "airbnb-base",
    'rules': {
        'import/no-extraneous-dependencies': ['error', {
            'devDependencies': ['**/*.test.js']
        }],
        "no-console": ["error", {
             allow: ["warn", "error", "info"]
        }],
        "no-restricted-syntax": ["warn", "WithStatement"]
    }
};
