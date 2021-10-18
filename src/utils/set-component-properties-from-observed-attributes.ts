import {turnKebabToCamelCasing} from './turn-kebab-to-camel-casing';
import boolAttr from './boolean-attributes.json';

export function setComponentPropertiesFromObservedAttributes(component: HTMLElement, observedAttributes: string[], onUpdate: onUpdateCallback) {
	observedAttributes.forEach(prop => {
		prop = prop.trim();

		if (!(prop.startsWith('data-') || prop === 'class' || prop === 'style')) {
			let value: string | boolean = component.getAttribute(prop) ?? '';
			prop = turnKebabToCamelCasing(prop);

			if ((boolAttr).hasOwnProperty(prop)) {
				value = (boolAttr as booleanAttributes)[prop].value ?? '';
				prop = (boolAttr as booleanAttributes)[prop].name;
			}

			Object.defineProperty(component, prop, {
				get() {
					return value;
				},
				set(newValue) {
					if (value !== newValue) {
						const oldValue = value;
						value = newValue;
						onUpdate(prop, oldValue, newValue);
					}
				}
			})
		}
	})
}