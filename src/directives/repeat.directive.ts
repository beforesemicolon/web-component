import {Directive} from "../directive";

export class Repeat extends Directive {
	render(repeatData: any, {element, rawElementOuterHTML, anchorNode}: directiveRenderOptions) {
		anchorNode = (anchorNode ?? []) as Array<HTMLElement>;
		const list: Array<HTMLElement> = [];

		if (element.nodeType === 1) {
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
				if (anchorNode[index]) {
					this.updateNodeContext(anchorNode[index], index, repeatData);
					list.push(anchorNode[index]);
					continue
				}

				const el = this.cloneRepeatedNode(rawElementOuterHTML);
				this.updateNodeContext(el, index, repeatData)
				list.push(el);
			}
		}

		return list;
	}
	
	updateNodeContext(el: Node, index: number, list: Array<any> = []) {
		const [key, value] = list[index] ?? [index, index + 1];
		// set context so this and inner nodes can catch these values
		this.setContext(el, '$key', key);
		this.setContext(el, '$item', value);
	}

	cloneRepeatedNode(rawElementOuterHTML: string): HTMLElement {
		const n = document.createElement('div');
		n.innerHTML = rawElementOuterHTML;
		const clone = n.children[0] as HTMLElement;
		// remove the repeat node to avoid infinite loop where the clone node also repeat
		clone.removeAttribute('repeat');
		// remove the if because the if directive is execute before any directive
		// which means if the node reached the repeat, it was already processed by possibly
		// existing if directive
		clone.removeAttribute('if');
		
		return clone;
	}
}

