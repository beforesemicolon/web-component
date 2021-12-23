import {$} from "../metadata";

export function defineNodeContextMetadata(node: Node) {
	if ($.has(node) && $.get(node)?.$context) {
		return;
	}

	let ctx: ObjectLiteral = {};
	let subs: Array<ObserverCallback> = [];
	const dt: ObjectLiteral = $.get(node) || {};

	dt.subscribe = (cb: ObserverCallback) => {
		subs.push(cb);
		return () => {
			subs = subs.filter((c) => c !== cb);
		}
	}

	dt.updateContext = (newCtx: ObjectLiteral) => {
		if (typeof newCtx === 'object') {
			ctx = {...ctx, ...newCtx};
			$.get(node)?.track?.updateNode();
			notify();
		}
	}

	Object.defineProperty(dt, '$context', {
		get() {
			return {...$.get(getParent())?.$context, ...ctx}
		}
	})

	function notify() {
		subs.forEach((cb) => {
			cb(dt.$context);
		});

		((node as WebComponent).root ?? node).childNodes
			.forEach((n) => {
				if (typeof $.get(n)?.updateContext === 'function') {
					$.get(n).updateContext({});
				}
			});
	}

	function getParent() {
		return node.parentNode instanceof ShadowRoot
			? node.parentNode.host
			: node.parentNode
	}

	$.set(node, dt);
}

