import {metadata} from "../metadata";

export function defineNodeContextMetadata(node: Node, component: WebComponent) {
	if (metadata.get(node)?.$context) {
		return;
	}

	if (!metadata.has(node)) {
		metadata.set(node, {});
	}

	let ctx: {[key: string]: any} = {};

	Object.defineProperty(metadata.get(node), '$context', {
		get() {
			// all node context is shared with children deeply
			// and this allows that
			return {...metadata.get(node.parentNode)?.$context, ...ctx};
		}
	})

	metadata.get(node).updateContext = (key: string, val: any) => {
		ctx[key] = val;
		metadata.get(component).trackers.get(node)?.updateNode();
		node.childNodes.forEach(child => metadata.get(child)?.updateContext());
	}
}
