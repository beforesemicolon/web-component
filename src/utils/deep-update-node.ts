import {metadata} from "../metadata";
import {trackNode} from "./track-node";

export function deepUpdateNode(n: Node, comp: WebComponent) {
	if (!metadata.has(n)) {
		return trackNode(n, comp, {
			customSlot: comp.customSlot,
			customSlotChildNodes: comp.customSlot ? comp._childNodes : []
		});
	}

	const {shadowNode, track} = metadata.get(n) || {};

	if (shadowNode) {
		metadata.get(shadowNode).track.updateNode();
	} else {
		if (track) {
			if (track.component === comp) {
				const res = track.updateNode();

				if (res !== n) {
					return;
				}
			} else {
				metadata.set(n, {});
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
}