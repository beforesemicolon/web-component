export function getRepeatItemAndKey(component: WebComponent, node: Node, executable: string): ObjectLiteral {
	let {$item, $key} = node as ObjectLiteral;

	if (/(?:^|\W)\$(index|key|item)(?:$|\W)/.test(executable) && $item === undefined) {
		let parent: any = node.parentNode;

		while (parent && !(parent instanceof ShadowRoot) && parent !== component) {
			if (parent['$item'] !== undefined) {
				$item = parent['$item'];
				$key = parent['$key'];
				break;
			}

			parent = parent.parentNode;
		}
	}

	return {$item, $key};
}
