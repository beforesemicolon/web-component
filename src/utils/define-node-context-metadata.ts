import {$} from "../metadata";

export function defineNodeContextMetadata(node: Node) {
	if ($.get(node)?.$context) {
		return;
	}

	if (!$.has(node)) {
		$.set(node, {});
	}

	let ctx: {[key: string]: any} = {};

	Object.defineProperty($.get(node), '$context', {
		get() {
			// all node context is shared with children deeply
			// and this allows that
			return {...$.get(node.parentNode)?.$context, ...ctx};
		}
	})

	$.get(node).updateContext = (newCtx: ObjectLiteral) => {
		if (typeof newCtx === 'object') {
			ctx = {...ctx, ...newCtx};
		}
	}
}
