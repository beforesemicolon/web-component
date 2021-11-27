import {ShadowRootModeExtended} from "./enums/ShadowRootModeExtended.enum";
import {WebComponent} from "./web-component";

/**
 * a special WebComponent that handles slot tag differently allowing for render template right into HTML files
 */
export class ContextProviderComponent extends WebComponent {
	private _childNodes: Array<ChildNode> = [];

	static mode = ShadowRootModeExtended.NONE;

	get template() {
		return '<slot></slot>';
	}

	connectedCallback() {
		if (!super.parsed) {
			this._childNodes = Array.from(this.childNodes);
			this.innerHTML = '';
		}

		super.connectedCallback();

		this._childNodes = [];
	}

	_renderSlotNode(node: HTMLSlotElement) {
		const name = node.getAttribute('name');
		let nodeList: any;
		let comment = document.createComment(`slotted [${name || ''}]`);
		node.parentNode?.replaceChild(comment, node);

		if (name) {
			nodeList = this._childNodes.filter(n => {
				return n.nodeType === 1 && (n as HTMLElement).getAttribute('slot') === name;
			});
		} else {
			nodeList = this._childNodes.filter(n => {
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

		for (let n of nodeList) {
			super._render(n);
		}
	}
}
