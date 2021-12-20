import {$} from "../metadata";

export function defineNodeContextMetadata(node: Node, parent?: HTMLElement) {
	if ($.has(node) && $.get(node)?.$context) {
		return;
	}
	
	parent = parent ?? node.parentNode as HTMLElement;
	
	let ctx: ObjectLiteral = {};
	let subs: Array<ObserverCallback> = [];
	const dt: ObjectLiteral = {...$.get(node)};
	let subbed = false;
	let unsub = () => {};
	
	if (parent) {
		unsub = $.get(parent)?.subscribe(notify);
		subbed = true;
	}
	
	dt.subscribe = (cb: ObserverCallback) => {
		subs.push(cb);
		return () => {
			subs = subs.filter((c) => c !== cb);
		}
	}
	
	dt.unsubscribe = () => {
		if (typeof unsub === 'function') {
			unsub();
		}
	}
	
	dt.updateContext = (newCtx: ObjectLiteral) => {
		if (typeof newCtx === 'object') {
			ctx = {...ctx, ...newCtx};
			notify();
		}
	}
	
	Object.defineProperty(dt, '$context', {
		get() {
			return {...$.get(toggleSub())?.$context, ...ctx}
		}
	})
	
	function notify() {
		if (node.parentNode && node.isConnected) {
			subs.forEach((cb) => {
				cb(dt.$context);
			});
		}
	}
	
	function toggleSub() {
		if (node.parentNode) {
			if (!subbed && $.has(node.parentNode)) {
				unsub = $.get(node.parentNode).subscribe(notify);
				subbed = true;
			}
		} else if (subbed) {
			dt.unsubscribe();
			unsub = () => null;
			subbed = false;
		}
		
		return node.parentNode instanceof ShadowRoot ? node.parentNode.host : node.parentNode
	}
	
	$.set(node, dt);
}

