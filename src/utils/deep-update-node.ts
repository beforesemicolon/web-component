import {$} from "../metadata";
import {trackNode} from "./track-node";

export function deepUpdateNode(n: Node, comp: WebComponent) {
	if (!$.has(n)) {
		if (n.nodeName === '#text' && !n.nodeValue?.trim()) {
			return;
		}

		return trackNode(n, comp, {
			customSlot: comp.customSlot,
			customSlotChildNodes: comp.customSlot ? comp._childNodes : []
		});
	}

	const {shadowNode, track} = $.get(n) || {};

	if (shadowNode) {
		return $.get(shadowNode).track.updateNode();
	}

	if (track) {
		if (track.component === comp) {
			const res = track.updateNode();

			if (res !== n) {
				return;
			}
		} else {
			$.set(n, {});
			return trackNode(n, comp, {
				customSlot: comp.customSlot,
				customSlotChildNodes: comp.customSlot ? comp._childNodes : []
			});
		}
	}

	if (!/#text|TEXTAREA|STYLE|#comment|SCRIPT/.test(n.nodeName)) {
		n.childNodes.forEach((c: Node) => deepUpdateNode(c, comp))
	}
}