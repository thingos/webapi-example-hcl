module.exports = {
	env: {
		browser: true,
		es2021: true,
	},
	extends: [
		'eslint:recommended',
		'plugin:react/recommended',
		'plugin:@typescript-eslint/recommended',
		'prettier',
	],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
		},
		ecmaVersion: 12,
		sourceType: 'module',
	},
	plugins: ['react', '@typescript-eslint'],
	rules: {
		'react/prop-types': 0,
		'react/react-in-jsx-scope': 'off',
	},
	settings: {
		react: {
			pragma: 'React',
			// Pragma to use, default to "React"
			version: 'detect', // React version. "detect" automatically picks the version you have installed.
		},

		componentWrapperFunctions: [
			// The name of any function used to wrap components, e.g. Mobx `observer` function. If this isn't set, components wrapped by these functions will be skipped.
			{
				property: 'styled',
			},
			// `object` is optional
			{
				property: 'observer',
				object: 'Mobx',
			},
		],
	},
};
