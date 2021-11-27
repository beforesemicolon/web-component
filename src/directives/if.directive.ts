import {Directive} from "../directive";

export class If extends Directive {
	render(condition: boolean, node: Node) {
		return condition ? node : null;
	}
}

