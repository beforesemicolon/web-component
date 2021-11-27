export function evaluateStringInComponentContext(
	executable: string,
	component: WebComponent,
	nodeData: ObjectLiteral
) {
	try {
		if (!executable.trim()) {
			return;
		}

		const ctx = component.$context;
		const keys = [
			...Object.getOwnPropertyNames(nodeData),
			...Object.getOwnPropertyNames(ctx),
			...component.$properties
		];

		const values = keys.map((key: string) => {
			// @ts-ignore
			return nodeData[key] ?? component[key] ?? ctx[key] ?? null;
		});

		const fn = new Function(...keys, `"use strict";\n return ${executable};`);

		return fn.apply(component, values) ?? '';
	} catch(e) {
		component.onError(e as Error)
	}
}
