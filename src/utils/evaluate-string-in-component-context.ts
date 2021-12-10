export function evaluateStringInComponentContext(
	executable: string,
	component: WebComponent,
	nodeData: ObjectLiteral = {}
) {
	if (!executable.trim()) {
		return '';
	}

	try {
		const ctx = component.$context;
		const keys = Array.from(new Set([
			...Object.getOwnPropertyNames(nodeData),
			...Object.getOwnPropertyNames(ctx),
			...component.$properties
		]));

		return (
			new Function(...keys, `"use strict";\n return ${executable};`)
		).apply(component, keys.map((key: string) => nodeData[key] ?? component[key] ?? ctx[key] ?? null)) ?? '';
	} catch (e) {
		component.onError(e as Error);
	}
}
