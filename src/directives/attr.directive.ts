import {Directive} from "../Directive";
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

	render([attrName, property, shouldAdd, val]: any, node: HTMLElement): Node | null {
		switch (attrName) {
			case 'style':
				if (property) {
					property = turnKebabToCamelCasing(property);

					if (shouldAdd) {
						(node as ObjectLiteral).style[property] = val;
					} else {
						(node as ObjectLiteral).style[property] = '';
					}
				} else {
					val
						.match(/([a-z][a-z-]+)(?=:):([^;]+)/g)
						?.forEach((style: string) => {
							let [name, styleValue] = style.split(':');
							name = name.trim();
							styleValue = styleValue.trim();

							if (shouldAdd) {
								node.style.setProperty(name, styleValue);
							} else {
								const pattern = new RegExp(`${name}\\s*:\\s*${styleValue};?`, 'g');
								node.setAttribute(
									'style',
									node.style.cssText.replace(pattern, ''))
							}

						})
				}

				break;
			case 'class':
				if (property) {
					if (shouldAdd) {
						node.classList.add(property);
					} else {
						node.classList.remove(property);
					}
				} else {
					const classes = val.split(/\s+/g);

					if (shouldAdd) {
						classes.forEach((cls: string) => node.classList.add(cls));
					} else {
						classes.forEach((cls: string) => node.classList.remove(cls));
					}
				}
				break;
			case 'data':
				if (property) {
					if (shouldAdd) {
						node.dataset[turnKebabToCamelCasing(property)] = val;
					} else {
						node.removeAttribute(`data-${turnCamelToKebabCasing(property)}`)
					}
				}
				break;
			default:
				if (attrName) {
					if (shouldAdd) {
						if (booleanAttr.hasOwnProperty(attrName)) {
							node.setAttribute(attrName, '');
						} else {
							const idealVal = val || shouldAdd;
							const kebabProp = turnCamelToKebabCasing(attrName);

							if ((node as ObjectLiteral)[kebabProp] !== undefined) {
								(node as ObjectLiteral)[kebabProp] = idealVal;
							} else {
								node.setAttribute(attrName, idealVal.toString());
							}
						}
					} else {
						node.removeAttribute(attrName);
					}
				}
		}

		return node;
	}
}
