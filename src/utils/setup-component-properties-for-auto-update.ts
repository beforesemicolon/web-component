import {turnCamelToKebabCasing} from "./turn-camel-to-kebab-casing";
import {proxify} from "./proxify";

export function setupComponentPropertiesForAutoUpdate(component: WebComponent, onUpdate: onUpdateCallback) {

	for (let property of Object.getOwnPropertyNames(component)) {
		const attr = turnCamelToKebabCasing(property);

		if (property[0] !== '_' && !(component.constructor as WebComponentConstructor).observedAttributes.includes(attr)) {
			let value = component[property];

			value = proxify(property, value, () => {
				onUpdate(property, value, value);
			})

			Object.defineProperty(component, property, {
				get() {
					return value;
				},
				set(newValue) {
					const oldValue = value;
					value = proxify(property, newValue, () => {
						onUpdate(property, oldValue, value);
					});

					if (newValue !== oldValue) {
						onUpdate(property, oldValue, newValue);
					}
				}
			})
		}
	}
}