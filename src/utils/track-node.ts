import metadata from "../metadata";
import {NodeTrack} from "../node-track";

export function trackNode(node: Node | HTMLElement | DocumentFragment, component: WebComponent, opt: trackerOptions = {}) {
	// it is possible that the node is already rendered by the parent component
	// and then picked up by the child component via slot
	// in that case we do not need to render it again since it will already be
	// ready to do anything it needs and also prevent it from being tracked again.
	// Also, scripts and comments are ignored since comments is never seen and script tags
	// contain logic inside that does not need any tracking because it may cause issues
	if (metadata.get(node)?.__tracked || node.nodeName === '#comment' || node.nodeName === 'SCRIPT') {
		return;
	}

	let {customSlot = false, customSlotChildNodes = [], trackOnly = false} = opt
	
	if (node.nodeName === 'SLOT') {
		if (customSlot) {
			return renderCustomSlot(node as HTMLSlotElement, customSlotChildNodes)
				.forEach((child: Node) => trackNode(child, component, opt));
		}
		
		node.addEventListener('slotchange', () => {
			(node as HTMLSlotElement).assignedNodes().forEach((n: HTMLElement | Node) => {
				trackNode(n, component, opt);
			});
		});
		
		node.childNodes.forEach((n: HTMLElement | Node) => {
			trackNode(n, component, opt);
		});
	} else {
		// avoid fragments
		if (node.nodeType !== 11) {
			if (!metadata.has(node)) {
				metadata.set(node, {__tracked: true});
			}
			
			const isElement = node.nodeType === 1;
			const isTextNode = !isElement && node.nodeName === '#text';
			const isRepeatedNode = isElement && (node as HTMLElement).hasAttribute('repeat');
			
			if (isElement || (isTextNode && node.nodeValue?.trim())) {
				const track = new NodeTrack(node, component as WebComponent);
				if (!track.empty) {
					metadata.get(component).trackers.set(node, track);
					trackOnly = !trackOnly && track.updateNode() !== node;
				}
			}
			
			if (
				isRepeatedNode ||
				node.nodeName === 'TEXTAREA' ||
				node.nodeName === 'STYLE'
			) {
				return;
			}
		}
		
		node.childNodes.forEach(child => trackNode(child, component, {...opt, trackOnly}));
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
