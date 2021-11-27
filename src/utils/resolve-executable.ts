import metadata from '../metadata';
import {evaluateStringInComponentContext} from "./evaluate-string-in-component-context";

export function resolveExecutable(component: WebComponent, node: Node, {match, executable}: Executable, newValue: string) {
	let res = evaluateStringInComponentContext(executable, component,metadata.get(node)?.$context ?? {});

	if (res && typeof res === 'object') {
		try {
			res = JSON.stringify(res)
		} catch (e) {
		}
	}

	return newValue.replace(match, res);
}
