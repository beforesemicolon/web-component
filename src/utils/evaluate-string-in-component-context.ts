export function evaluateStringInComponentContext(
	executableString: string,
	src: WebComponent,
	propertyNames: Array<string> = [],
	values: unknown[] = []
) {
	const fn = new Function(...propertyNames, `"use strict";\n return ${executableString};`);

	return fn.apply(src, values) ?? '';
}
