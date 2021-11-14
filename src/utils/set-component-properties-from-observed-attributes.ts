import {turnKebabToCamelCasing} from './turn-kebab-to-camel-casing';
import {proxify} from './proxify';
import boolAttr from './boolean-attributes.json';
import {directives} from "./directives";

export function setComponentPropertiesFromObservedAttributes(component: HTMLElement, observedAttributes: string[], onUpdate: onUpdateCallback) {
	observedAttributes.forEach(prop => {
		prop = prop.trim();

		if (!directives.has(prop) && !(prop.startsWith('data-') || prop === 'class' || prop === 'style')) {
			let value: string | boolean = component.getAttribute(prop) ?? '';
			prop = turnKebabToCamelCasing(prop);

			if (value) {
				try {
					value = JSON.parse(value);
				} catch (e) {
				}
			}

			value = proxify(prop, value, () => {
				onUpdate(prop, value, value);
			})

			if ((boolAttr).hasOwnProperty(prop)) {
				value = (boolAttr as booleanAttributes)[prop].value;
				prop = (boolAttr as booleanAttributes)[prop].name;
			}

			Object.defineProperty(component, prop, {
				get() {
					return value;
				},
				set(newValue) {
					if (value !== newValue) {
						const oldValue = value;
						value = proxify(prop, newValue, () => {
							onUpdate(prop, oldValue, value);
						});
						onUpdate(prop, oldValue, newValue);
					}
				}
			})
		}
	})
}