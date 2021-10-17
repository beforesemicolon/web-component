export function bindData(src: WebComponent, executableString: string) {
	const keys = Object.getOwnPropertyNames(src);
	const values = keys.map(key => src[key]);

	const fn = new Function(...keys, `return ${executableString}`);

	return fn.apply(src, values)
}