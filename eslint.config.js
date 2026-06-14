import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';

export default [
	js.configs.recommended,

	...tseslint.configs.recommended,

	...svelte.configs['flat/recommended'],

	{
		ignores: [
			'.svelte-kit/**',
			'build/**',
			'dist/**',
			'static/**'
		]
	},

	{
		files: ['**/*.{ts,js,svelte}'],
		ignores: ['eslint.config.js', 'svelte.config.js', 'vite.config.ts'],

		languageOptions: {
			parserOptions: {
				projectService: {
					allowDefaultProject: ['*.js']
				},
				tsconfigRootDir: import.meta.dirname,
				extraFileExtensions: ['.svelte']
			}
		},

		rules: {
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					args: 'all',
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_'
				}
			],

			'no-console': 'error',
			'prefer-const': 'error',
			'eqeqeq': ['error', 'always']
		}
	}
];