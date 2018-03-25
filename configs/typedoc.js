module.exports = {
	mode: 'modules',
	out: '../docs',
	excludes: [
		'**/*.spec.ts'
	],
	theme: 'minimal',
	ignoreCompilerErrors: true,
	excludePrivate: true,
	excludeNotExported: true,
	target: 'ES5',
	hideGenerator: true,
	moduleResolution: 'node',
	preserveConstEnums: true,
	stripInternal: true,
	suppressExcessPropertyErrors: true,
	suppressImplicitAnyIndexErrors: true,
	module: 'commonjs'
};