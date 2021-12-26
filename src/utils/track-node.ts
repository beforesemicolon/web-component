import {$} from "../metadata";
import {NodeTrack} from "../node-track";
import {defineNodeContextMetadata} from "./define-node-context-metadata";

export function trackNode(node: Node | HTMLElement | DocumentFragment, component: WebComponent, opt: trackerOptions) {
	const {nodeName, nodeValue, childNodes, nodeType} = node;

	if ($.get(node)?.tracked || (nodeName === '#text' && !nodeValue?.trim())) {
		return;
	}

	if (nodeType !== 11 && nodeName !== 'SLOT') {
		defineNodeContextMetadata(node);
	}

	if (/#comment|SCRIPT/.test(nodeName)) {
		return;
	}

	let {customSlot = false, customSlotChildNodes = [], trackOnly = false, tracks} = opt
	
	if (nodeName === 'SLOT') {
		const attrs = Array.from((node as HTMLSlotElement).attributes);

		if (customSlot) {
			return renderCustomSlot(node as HTMLSlotElement, customSlotChildNodes, attrs)
				.forEach((child: Node) => trackNode(child, component, opt));
		}

		renderSlot(node as HTMLSlotElement, attrs, (nodes) => {
			nodes.forEach((n: HTMLElement | Node) => {
				trackNode(n, component, opt);
			});
		})
	} else {
		// avoid fragments
		if (nodeType !== 11) {
			if (nodeType === 1 || nodeName === '#text') {
				const track: NodeTrack = new NodeTrack(node, component);
				if (!track.empty) {
					$.get(node).track = track;
					tracks.set(node, track);

					if (!trackOnly) {
						const res = track.updateNode();
						if (res !== node) {
							trackOnly = true;

							if (Array.isArray(res)) {
							   return;
							}
						}
					}

					tracks = track.tracks;
				}
			}

			$.get(node).tracked = true;
			
			if (/#text|TEXTAREA|STYLE/.test(nodeName)) {
				return;
			}
		}

		Array.from(childNodes).forEach(c => trackNode(c, component, {...opt, trackOnly, tracks}));
	}
}

function renderSlot(node: HTMLSlotElement, attrs: Attr[], cb: (c: Node[]) => void) {
	const onSlotChange = () => {
		const nodes = (node as HTMLSlotElement).assignedNodes();

		nodes.forEach((n: HTMLElement | Node) => {
			if (n.nodeType === 1) {
				attrs.forEach(({name, value}) => name !== 'name' && (n as HTMLElement).setAttribute(name, value));
			}
		});

		cb(nodes);

		node.removeEventListener('slotchange', onSlotChange, false);
	};

	node.addEventListener('slotchange', onSlotChange, false);

	cb(Array.from(node.childNodes));
}

function renderCustomSlot(node: HTMLSlotElement, childNodes: Array<Node>, attrs: Array<Attr>) {
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
		if (n.nodeType === 1) {
			attrs.forEach(a => a.name !== 'name' && (n as HTMLElement).setAttribute(a.name, a.value));
		}
		anchor.after(n);
		anchor = n;
	}
	
	comment.parentNode?.removeChild(comment);
	
	return nodeList;
}
