import {directiveRegistry} from "./directives/registry";
import metadata from "./metadata";
import {defineNodeContextMetadata} from "./utils/define-node-context-metadata";

export class Directive {

	constructor(component: WebComponent) {
		metadata.set(this, {component})
	}

	static register() {
		const name = this.name.toLowerCase();

		if (directiveRegistry[name] === undefined) {
			directiveRegistry[name] = this;
		}
	}

	parseValue(value: string, prop: string | null) {
		return value;
	}

	render(val: unknown, {element}: directiveRenderOptions): directiveRenderOptions['anchorNode'] | Array<directiveRenderOptions['anchorNode']> | null {
		return element;
	}

	setRef(name: string, node: Node) {
		metadata.get(this).component.$refs[name] = node;
	}

	getContext(node: Node) {
		return metadata.get(node).$context ?? null;
	}

	setContext(node: Node, key: string, value: any) {
		defineNodeContextMetadata(node, metadata.get(this).component);
		metadata.get(node)?.updateContext(key, value);
	}
}
