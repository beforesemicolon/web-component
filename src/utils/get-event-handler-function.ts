import {getComponentNodeEventListener} from "./get-component-node-event-listener";
import {getRepeatItemAndKey} from "./get-repeat-item-and-key";

export function getEventHandlerFunction(component: WebComponent, node: Node, attribute: Attr): EventListenerCallback | null {
	const dt = getRepeatItemAndKey(component, node, attribute.value);
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
