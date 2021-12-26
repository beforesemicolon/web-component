import {proxify} from './proxify';
import boolAttr from './boolean-attributes.json';
import {directives} from "../directives";
import {jsonParse} from "./json-parse";

export function setComponentPropertiesFromObservedAttributes(
	comp: WebComponent,
	attrs: string[],
	attrsMap: ObjectLiteral = {},
	cb: onUpdateCallback
): string[] {
	const properties: string[] = [];

	attrs.forEach(attr => {
		attr = attr.trim();

		if (!directives.has(attr) && !(attr.startsWith('data-') || attr === 'class' || attr === 'style')) {
			let value: string | boolean = comp.getAttribute(attr) ?? '';
			let prop = attrsMap[attr];

			properties.push(prop);

			value = proxify(prop, jsonParse(value), (name, val) => {
				cb(name, val, val);
			});
			
			if ((boolAttr).hasOwnProperty(prop)) {
				value = (boolAttr as booleanAttributes)[prop].value;
				prop = (boolAttr as booleanAttributes)[prop].name;
			}

			Object.defineProperty(comp, prop, {
				get() {
					return value;
				},
				set(newValue) {
					if (value !== newValue) {
						const oldValue = value;
						value = proxify(prop, newValue, () => {
							cb(prop, oldValue, value);
						});
						cb(prop, oldValue, newValue);
					}
				}
			})
		}
	})

	return properties;
}
