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

	protected parseValue(value: string, prop: string | null) {
		return value;
	}

	protected render(val: any, node: Node, rawNodeOuterHTML: string): Node | null {
		return node;
	}

	protected setRef(name: string, node: Node) {}

	protected getContext(node: Node) {
		return metadata.get(node).$context ?? null;
	}

	protected setContext(node: Node, key: string, value: any) {
		defineNodeContextMetadata(node);
		metadata.get(node).updateContext(key, value);
	}
}
