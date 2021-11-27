import {Directive} from "../Directive";

export class If extends Directive {
	render(condition: boolean, node: Node) {
		return condition ? node : null;
	}
}

