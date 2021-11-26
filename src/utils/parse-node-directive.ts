export function parseNodeDirective(node: Element, name: string, value: string): [string, DirectiveValue] {
	const ogName = name;
	const dot = name.indexOf('.');
	let prop = null;

	if (dot >= 0) {
		prop = name.slice(dot + 1);
		name = name.slice(0, dot);
	}

	node.removeAttribute(ogName);

	return [name, {value, prop}];
}
