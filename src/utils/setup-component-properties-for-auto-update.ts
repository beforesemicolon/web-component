import {turnCamelToKebabCasing} from "./turn-camel-to-kebab-casing";

export function setupComponentPropertiesForAutoUpdate(component: WebComponent, onUpdate: onUpdateCallback) {
	for (let property of Object.getOwnPropertyNames(component)) {
		const attr = turnCamelToKebabCasing(property);

		// @ts-ignore
		if (!property.startsWith('_') && !component.constructor.observedAttributes.includes(attr)) {
			let value = component[property];

			delete component[property];

			Object.defineProperty(component, property, {
				get() {
					return value;
				},
				set(newValue) {
					const oldValue = value;
					value = newValue;

					if (newValue !== oldValue) {
						onUpdate(property, oldValue, newValue);
					}
				}
			})
		}
	}
}