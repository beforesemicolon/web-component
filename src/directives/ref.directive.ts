import {Directive} from "../directive";

export class Ref extends Directive {
	parseValue(value: string): string {
		return `"${value}"`;
	}

	render(name: string, node: Node) {
		if (/^[a-z$_][a-z0-9$_]*$/i.test(name)) {
			this.setRef(name, node);
			return node;
		}

		throw new Error(`Invalid "ref" property name "${name}"`)
	}
}

