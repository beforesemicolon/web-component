export function parseNodeDirective(node: HTMLElement, name: string, value: string): Directive {
	const ogName = name;
	const dot = name.indexOf('.');
	let prop = null;

	if (dot >= 0) {
		prop = name.slice(dot + 1);
		name = name.slice(0, dot);
	}

	// @ts-ignore
	if (node[name] === undefined) {
		(node as any)[name] = [{value, prop}]
	} else {
		(node as any)[name].push({value, prop})
	}

	node.removeAttribute(ogName);

	return name as Directive;
}