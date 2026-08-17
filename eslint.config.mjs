import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['srv/**/*.ts'],
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': 'error',
            'no-console': 'warn',
        },
    },
    {
        files: ['test/**/*.js'],
        rules: {
            'no-undef': 'off',
            '@typescript-eslint/no-require-imports': 'off',
        },
    },
    {
        ignores: ['gen/', '@cds-models/', 'node_modules/', 'coverage/', 'app/', 'srv/handlers/*.js', 'dist/'],
    }
);
