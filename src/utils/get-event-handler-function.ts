import {getComponentNodeEventListener} from "./get-component-node-event-listener";
import metadata from '../metadata';

export function getEventHandlerFunction(component: WebComponent, node: Node, attribute: Attr): EventListenerCallback | null {
	const dt = metadata.get(node)?.$context ?? {};
	const props = [...Object.getOwnPropertyNames(dt), '$refs', '$context'];
	const values = props.map(k => {
		if (k === '$refs') {
			return component.$refs;
		} else if (k === '$context') {
			return component.$context;
		}

		return dt[k];
	});

	const fn = getComponentNodeEventListener(component, attribute.name, attribute.value, props, values);

	if (fn) {
		return fn;
	} else {
		component.onError(new Error(`${component.constructor.name}: Invalid event handler for "${attribute.name}" >>> "${attribute.value}".`))
	}

	return null
}
