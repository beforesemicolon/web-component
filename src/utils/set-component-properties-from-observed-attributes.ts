import {turnKebabToCamelCasing} from './turn-kebab-to-camel-casing';
import {proxify} from './proxify';
import boolAttr from './boolean-attributes.json';
import {directives} from "../directives";
import {jsonParse} from "./json-parse";

export function setComponentPropertiesFromObservedAttributes(
	component: HTMLElement,
	observedAttributes: string[],
	onUpdate: onUpdateCallback
): string[] {
	const properties: string[] = [];

	observedAttributes.forEach(prop => {
		prop = prop.trim();

		if (!directives.has(prop) && !(prop.startsWith('data-') || prop === 'class' || prop === 'style')) {
			let value: string | boolean = component.getAttribute(prop) ?? '';
			prop = turnKebabToCamelCasing(prop);

			properties.push(prop);

			value = proxify(prop, jsonParse(value), (name, val) => {
				onUpdate(name, val, val);
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

	return properties;
}
