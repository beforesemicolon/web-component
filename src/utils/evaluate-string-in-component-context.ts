export function evaluateStringInComponentContext(executableString: string, src: WebComponent, propertyNames: Array<string> = []) {
	const values = propertyNames.map(key => src[key]);

	const fn = new Function(...propertyNames, `"use strict";\nreturn ${executableString}`);

	return fn.apply(src, values) ?? '';
}
