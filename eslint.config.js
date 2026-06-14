import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';
import globals from 'globals';

export default [
	// ── Global ignores (must be standalone object) ──
	{
		ignores: [
			'.svelte-kit/**',
			'.vercel/**',
			'.opencode/**',
			'build/**',
			'dist/**',
			'dev-dist/**',
			'static/**',
			'scripts/**',
			'node_modules/**',
			'graphify-out/**',
			'vite.config.ts'
		]
	},

	// ── Base configs ──
	js.configs.recommended,
	...tseslint.configs.recommended,
	...svelte.configs['flat/recommended'],

	// ── Global language options (browser + node globals) ──
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			}
		}
	},

	// ── TypeScript files (including .svelte.ts rune modules) ──
	{
		files: ['**/*.ts', '**/*.svelte.ts'],
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: {
				extraFileExtensions: ['.svelte']
			}
		}
	},

	// ── Svelte files: use svelte-eslint-parser with TS sub-parser ──
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parser: svelteParser,
			parserOptions: {
				parser: tseslint.parser
			}
		},
		rules: {
			// Svelte 5 $props() destructuring uses `let` by convention for reactive props
			'prefer-const': 'off',
			// This app uses hardcoded SPA-style routes, resolve() not needed
			'svelte/no-navigation-without-resolve': 'off',
			// Downgrade for gradual cleanup
			'svelte/no-unused-svelte-ignore': 'warn'
		}
	},

	// ── Svelte reactivity rules (downgrade for gradual adoption) ──
	{
		files: ['**/*.svelte.ts'],
		rules: {
			// Many Date/Set/Map usages are for one-shot computations, not reactive mutations
			'svelte/prefer-svelte-reactivity': 'off',
			// Same SPA-style hardcoded routes
			'svelte/no-navigation-without-resolve': 'off'
		}
	},

	// ── Custom rules for source code ──
	{
		files: ['src/**/*.{ts,js,svelte}'],
		rules: {
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					args: 'all',
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_'
				}
			],
			'@typescript-eslint/no-explicit-any': 'off',
			'eqeqeq': ['error', 'always']
		}
	},

	// ── prefer-const only for non-Svelte source files ──
	{
		files: ['src/**/*.{ts,js}'],
		ignores: ['src/**/*.svelte.ts'],
		rules: {
			'prefer-const': 'error'
		}
	}
];