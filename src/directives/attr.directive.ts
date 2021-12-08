import {Directive} from "../directive";
import {turnKebabToCamelCasing} from "../utils/turn-kebab-to-camel-casing";
import {turnCamelToKebabCasing} from "../utils/turn-camel-to-kebab-casing";
import booleanAttr from "../utils/boolean-attributes.json";

export class Attr extends Directive {
	parseValue(value: string, prop: string | null): string {
		let [attrName, property = null] = (prop ?? '').split('.');
		const commaIdx = value.lastIndexOf(',');
		let val = commaIdx >= 0 ? value.slice(0, commaIdx).trim() : '';

		return `["${attrName}", "${property || ''}", ${commaIdx >= 0 ? value.slice(commaIdx + 1).trim() : value}, "${val}"]`;
	}

	render([attrName, property, shouldAdd, val]: any, {element}: directiveRenderOptions): HTMLElement {
		switch (attrName) {
			case 'style':
				if (property) {
					property = turnKebabToCamelCasing(property);

					if (shouldAdd) {
						element.style[property] = val;
					} else {
						element.style[property] = '';
					}
				} else {
					val
						.match(/([a-z][a-z-]+)(?=:):([^;]+)/g)
						?.forEach((style: string) => {
							let [name, styleValue] = style.split(':');
							name = name.trim();
							styleValue = styleValue.trim();

							if (shouldAdd) {
								element.style.setProperty(name, styleValue);
							} else {
								const pattern = new RegExp(`${name}\\s*:\\s*${styleValue};?`, 'g');
								element.setAttribute(
									'style',
									element.style.cssText.replace(pattern, ''))
							}

						})
				}

				break;
			case 'class':
				if (property) {
					if (shouldAdd) {
						element.classList.add(property);
					} else {
						element.classList.remove(property);
					}
				} else {
					const classes = val.split(/\s+/g);

					if (shouldAdd) {
						classes.forEach((cls: string) => element.classList.add(cls));
					} else {
						classes.forEach((cls: string) => element.classList.remove(cls));
					}
				}
				break;
			case 'data':
				if (property) {
					if (shouldAdd) {
						element.dataset[turnKebabToCamelCasing(property)] = val;
					} else {
						element.removeAttribute(`data-${turnCamelToKebabCasing(property)}`)
					}
				}
				break;
			default:
				if (attrName) {
					if (shouldAdd) {
						if (booleanAttr.hasOwnProperty(attrName)) {
							element.setAttribute(attrName, '');
						} else {
							element.setAttribute(attrName, `${val || shouldAdd}`);
						}
					} else {
						element.removeAttribute(attrName);
					}
				}
		}

		return element;
	}
}
