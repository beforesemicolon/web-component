import {Directive} from "../Directive";

export class Repeat extends Directive {
	render(repeatData: any, node: Node, rawNodeOuterHTML: string) {
		const frag = document.createDocumentFragment();

		if (node.nodeType === 1) {
			let times: number;

			if (Number.isInteger(repeatData)) {
				times = repeatData;
			} else {
				repeatData = repeatData instanceof Set ? Object.entries(Array.from(repeatData))
					: repeatData instanceof Map ? Array.from(repeatData.entries())
						: repeatData[Symbol.iterator] ? Object.entries([...repeatData])
							: Object.entries(repeatData);
				times = repeatData.length;
			}

			for (let index = 0; index < times; index++) {
				const nodeClone = this.cloneRepeatedNode(rawNodeOuterHTML, index, repeatData);
				frag.appendChild(nodeClone);
			}
		}

		return frag;
	}

	cloneRepeatedNode(rawNodeOuterHTML: string, index: number, list: Array<any> = []) {
		const n = document.createElement('div');
		n.innerHTML = rawNodeOuterHTML;
		const clone = n.children[0] as HTMLElement;
		// remove the repeat node to avoid infinite loop where the clone node also repeat
		clone.removeAttribute('repeat');
		// remove the if because the if directive is execute before any directive
		// which means if the node reached the repeat, it was already processed by possibly
		// existing if directive
		clone.removeAttribute('if');

		const [key, value] = list[index] ?? [index, index + 1];
		this.setContext(clone, '$key', key);
		this.setContext(clone, '$item', value);

		return clone;
	}
}

