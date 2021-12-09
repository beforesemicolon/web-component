import metadata from "../metadata";
import {NodeTrack} from "../node-track";

export function renderNode(node: Node | HTMLElement | DocumentFragment, component: WebComponent, opt: renderOptions = {}) {
	const {customSlot = false, customSlotChildNodes = []} = opt
	// it is possible that the node is already rendered by the parent component
	// and then picked up by the child component via slot
	// in that case we do not need to render it again since it will already be
	// ready to do anything it needs and also prevent it from being tracked again
	if (metadata.get(node)?.__rendered || node.nodeName === '#comment' || node.nodeName === 'SCRIPT') {
		return;
	}
	
	if (node.nodeName === 'SLOT') {
		if (customSlot) {
			return renderCustomSlot(node as HTMLSlotElement, customSlotChildNodes)
				.forEach((child: Node) => renderNode(child, component, opt));
		}
		
		node.addEventListener('slotchange', () => {
			(node as HTMLSlotElement).assignedNodes().forEach((n: HTMLElement | Node) => {
				renderNode(n, component, opt);
			});
		});
		
		node.childNodes.forEach((n: HTMLElement | Node) => {
			renderNode(n, component, opt);
		});
	} else {
		// avoid fragments
		if (node.nodeType !== 11) {
			if (!metadata.has(node)) {
				metadata.set(node, Object.create(null));
			}
			
			// mark the node as rendered so it gets skipped if picked via slot
			metadata.get(node).__rendered = true;
			
			const isElement = node.nodeType === 1;
			const isTextNode = !isElement && node.nodeName === '#text';
			const isRepeatedNode = isElement && (node as HTMLElement).hasAttribute('repeat');
			
			if (isElement || (isTextNode && node.nodeValue?.trim())) {
				const track = new NodeTrack(node, component as WebComponent);
				if (!track.empty) {
					metadata.get(component).trackers.set(node, track);
					track.updateNode();
				}
			}
			
			if (isRepeatedNode || node.nodeName === 'TEXTAREA' || node.nodeName === 'STYLE') {
				return;
			}
		}
		
		node.childNodes.forEach(child => renderNode(child, component, opt));
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
