import {turnKebabToCamelCasing} from "./turn-kebab-to-camel-casing";

export function setupComponentPropertiesForAutoUpdate(component: WebComponent, onUpdate: onUpdateCallback) {
	for (let property of Object.getOwnPropertyNames(component)) {
		const prop = turnKebabToCamelCasing(property);

		// @ts-ignore
		if (!property.startsWith('_') && !component.constructor.observedAttributes.includes(prop)) {
			let value = component[property];

			delete component[property];

			Object.defineProperty(component, property, {
				get() {
					return value;
				},
				set(newValue) {
					const oldValue = value;
					value = newValue;
					console.log('-- set', property);

					if (newValue !== oldValue) {
						onUpdate(property, oldValue, newValue);
					}
				}
			})
		}
	}
}