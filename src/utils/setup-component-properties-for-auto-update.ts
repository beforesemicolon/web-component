import {turnCamelToKebabCasing} from "./turn-camel-to-kebab-casing";
import {proxify} from "./proxify";

export function setupComponentPropertiesForAutoUpdate(component: WebComponent, onUpdate: onUpdateCallback) {

	for (let property of Object.getOwnPropertyNames(component)) {
		const attr = turnCamelToKebabCasing(property);

		// ignore private properties and $ properties as well as attribute properties
		if (!/\$|_/.test(property[0]) && !(component.constructor as WebComponentConstructor).observedAttributes.includes(attr)) {
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