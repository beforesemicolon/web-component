export function evaluateStringInComponentContext(
	executableString: string,
	src: WebComponent,
	propertyNames: Array<string> | null = null,
	values: unknown[] | null = null
) {
	propertyNames = propertyNames ? propertyNames : Object.getOwnPropertyNames(src);
	values = values ? values : propertyNames.map(p => src[p]);

	const fn = new Function(...propertyNames, `"use strict";\n return ${executableString};`);

	return fn.apply(src, values) ?? '';
}
