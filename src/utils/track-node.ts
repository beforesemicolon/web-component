import {metadata} from "../metadata";
import {NodeTrack} from "../node-track";
import {defineNodeContextMetadata} from "./define-node-context-metadata";

export function trackNode(node: Node | HTMLElement | DocumentFragment, component: WebComponent, opt: trackerOptions) {
	const {nodeName, nodeValue, childNodes, nodeType} = node;

	if (!metadata.has(node)) {
		metadata.set(node, {});
	}

	if (/#comment|SCRIPT/.test(nodeName) || (nodeName === '#text' && !nodeValue?.trim())) {
		return;
	}

	let {customSlot = false, customSlotChildNodes = [], trackOnly = false} = opt
	
	if (nodeName === 'SLOT') {
		if (customSlot) {
			return renderCustomSlot(node as HTMLSlotElement, customSlotChildNodes)
				.forEach((child: Node) => trackNode(child, component, opt));
		}
		
		node.addEventListener('slotchange', () => {
			(node as HTMLSlotElement).assignedNodes().forEach((n: HTMLElement | Node) => {
				trackNode(n, component, opt);
			});
		});
		
		childNodes.forEach((n: HTMLElement | Node) => {
			trackNode(n, component, opt);
		});
	} else {
		// avoid fragments
		if (nodeType !== 11) {
			const isElement = nodeType === 1;
			const isTextNode = !isElement && nodeName === '#text';
			const isRepeatedNode = isElement && (node as HTMLElement).hasAttribute('repeat');

			defineNodeContextMetadata(node);

			if (isElement || (isTextNode && nodeValue?.trim())) {
				const track: NodeTrack = new NodeTrack(node, component);
				if (!track.empty) {
					metadata.get(node).track = track;

					if (!trackOnly && track.updateNode(trackOnly) !== node) {
						return;
					}
				}
			}
			
			if (
				isRepeatedNode ||
				/#text|TEXTAREA|STYLE/.test(node.nodeName)
			) {
				return;
			}
		}
		
		Array.from(node.childNodes).forEach(child => trackNode(child, component, opt));
	}
}

function renderCustomSlot(node: HTMLSlotElement, childNodes: Array<Node>) {
	const name = node.getAttribute('name');
	let nodeList: any;
	let comment = document.createComment(`slotted [${name || ''}]`);
	node.parentNode?.replaceChild(comment, node);
	
	if (name) {
		nodeList = childNodes.filter(n => {
			return n.nodeType === 1 && (n as HTMLElement).getAttribute('slot') === name;
		});
	} else {
		nodeList = childNodes.filter(n => {
			return n.nodeType !== 1 || !(n as HTMLElement).hasAttribute('slot');
		});
	}
	
	if (!nodeList.length) {
		nodeList = node.childNodes;
	}
	
	let anchor = comment;
	
	for (let n of nodeList) {
		anchor.after(n);
		anchor = n;
	}
	
	comment.parentNode?.removeChild(comment);
	
	return nodeList;
}
