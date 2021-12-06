import {directiveRegistry} from "./directives/registry";
import {defineNodeContextMetadata} from "./utils/define-node-context-metadata";
import metadata from "./metadata";

export class Directive {
	static register() {
		const name = this.name.toLowerCase();

		if (directiveRegistry[name] === undefined) {
			directiveRegistry[name] = this;
		}
	}

	parseValue(value: string, prop: string | null) {
		return value;
	}

	render(val: unknown, {element}: directiveRenderOptions): Node | null {
		return element;
	}

	setRef(name: string, node: Node) {}

	getContext(node: Node) {
		return metadata.get(node).$context ?? null;
	}

	setContext(node: Node, key: string, value: any) {
		defineNodeContextMetadata(node);
		metadata.get(node).updateContext(key, value);
	}
}
