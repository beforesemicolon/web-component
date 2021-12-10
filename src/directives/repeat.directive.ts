import {Directive} from "../directive";
import {parse} from "../utils/parse";

export class Repeat extends Directive {
	parseValue(value: string): string {
		const idx = value.lastIndexOf(';');
		let iPart = value;
		let kPart = '';
		
		if (idx > 0) {
			iPart = value.slice(0, idx);
			kPart = value.slice(idx + 1);
		}
		
		const [v, vAs = "$item"] = `${iPart} `.split(/\s+as\s+/g).map(s => s.trim());
		const [k, kAs = "$key"] = `${kPart} `.split(/\s+as\s+/g).map(s => s.trim());
		
		return `[${v}, "${vAs}", "${k === '$key' ? kAs : ''}"]`;
	}
	
	render([repeatData, vAs, kAs]: any, {element, rawElementOuterHTML, anchorNode}: directiveRenderOptions) {
		anchorNode = (anchorNode ?? []) as Array<Element>;
		const list: Array<Element> = [];

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
					this.updateNodeContext(anchorNode[index], index, vAs, kAs, repeatData);
					list.push(anchorNode[index]);
					continue
				}

				const el = this.cloneRepeatedNode(rawElementOuterHTML);
				this.updateNodeContext(el, index, vAs, kAs, repeatData)
				list.push(el);
			}
		}

		return list;
	}
	
	updateNodeContext(el: Node, index: number, vAs: string, kAs: string, list: Array<any> = []) {
		const [key, value] = list[index] ?? [index, index + 1];
		// set context so this and inner nodes can catch these values
		this.setContext(el, kAs || '$key', key);
		this.setContext(el, vAs || '$item', value);
	}

	cloneRepeatedNode(rawElementOuterHTML: string): Element {
		const clone = parse(rawElementOuterHTML).children[0];
		// remove the repeat node to avoid infinite loop where the clone node also repeat
		clone.removeAttribute('repeat');
		// remove the if because the if directive is execute before any directive
		// which means if the node reached the repeat, it was already processed by possibly
		// existing if directive
		clone.removeAttribute('if');
		
		return clone;
	}
}

