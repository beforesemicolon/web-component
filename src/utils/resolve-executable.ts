import {execString} from "./exec-string";
import {getRepeatItemAndKey} from "./get-repeat-item-and-key";

export function resolveExecutable(component: WebComponent, node: Node, {match, executable}: Executable, newValue: string) {
	let res = execString(component, executable, getRepeatItemAndKey(component, node, executable));

	if (res && typeof res === 'object') {
		try {
			res = JSON.stringify(res)
		} catch (e) {
		}
	}

	return newValue.replace(match, res);
}
