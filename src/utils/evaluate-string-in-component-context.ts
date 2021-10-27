export function evaluateStringInComponentContext(executableString: string, src: WebComponent) {
	const keys = Object.getOwnPropertyNames(src).filter(n => !n.startsWith('_'));
	keys.push('context')
	const values = keys.map(key => src[key]);

	const fn = new Function(...keys, `return ${executableString}`);

	return fn.apply(src, values) ?? '';
}