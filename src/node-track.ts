import {extractExecutableSnippetFromString} from "./utils/extract-executable-snippet-from-string";
import {parseNodeDirective} from "./utils/parse-node-directive";
import {turnKebabToCamelCasing} from "./utils/turn-kebab-to-camel-casing";
import {resolveExecutable} from "./utils/resolve-executable";
import {getEventHandlerFunction} from "./utils/get-event-handler-function";
import {directiveRegistry} from './directives/registry';
import {evaluateStringInComponentContext} from "./utils/evaluate-string-in-component-context";
import {metadata} from "./metadata";
import {defineNodeContextMetadata} from "./utils/define-node-context-metadata";
import {trackNode} from "./utils/track-node";
import {jsonParse} from "./utils/json-parse";

/**
 * handles all logic related to tracking and updating a tracked node.
 * It is a extension of the component that handles all the logic related to updating nodes
 * in conjunction with the node component
 */
export class NodeTrack {
	node: HTMLElement | Node;
	attributes: Array<{
		name: string;
		value: string;
		executables: Array<Executable>;
	}> = []
	directives: Array<DirectiveValue> = [];
	property: {
		name: string;
		value: string;
		executables: Array<Executable>;
	} = {
		name: '',
		value: '',
		executables: []
	};
	readonly component: WebComponent;
	anchor: HTMLElement | Node | Comment | Array<Element>;
	empty = false;
	readonly dirAnchors = new WeakMap();

	constructor(node: HTMLElement | Node, component: WebComponent) {
		this.node = node;
		this.anchor = node;
		this.component = component;

		if (!metadata.has(node)) {
			metadata.set(node, {tracked: true});
		}

		// whether or not the node was replaced by another on render
		metadata.get(this.node).shadowed = false;
		metadata.get(this.node).rawNodeString = (node as HTMLElement).outerHTML ?? (node as Text).nodeValue;
		defineNodeContextMetadata(node, component);

		this._setTracks();
	}

	get $context() {
		return metadata.get(this.node).$context;
	}

	updateNode() {
		// if a node was rendered before(handled by the render function)
		// and no longer has a parent(removed from the DOM)
		// and it is is not being shadowed(temporarily removed from the DOM by a directive)
		// the node no longer needs to be tracked so it can be discarded
		if (metadata.get(this.node).tracked && !this.node.parentNode && !metadata.get(this.node).shadowed) {
			return this._unTrackNode(this.node);
		}

		let directiveNode: any = this.node;

		for (let directive of this.directives) {
			if (directive && directive.handler) {
				try {
					const {handler} = directive;

					let val = handler.parseValue(directive.value, directive.prop);
					extractExecutableSnippetFromString(val).forEach((exc) => {
						val = resolveExecutable(this.component, metadata.get(this.node).$context ?? {}, exc, val);
					});
					
					const value = evaluateStringInComponentContext(val, this.component, this.$context);
					directiveNode = handler.render(value, {
						element: this.node,
						anchorNode: this.dirAnchors.get(directive) ?? null,
						rawElementOuterHTML: metadata.get(this.node).rawNodeString
					} as directiveRenderOptions);

					if (directiveNode !== this.node) {
						this.dirAnchors.set(directive, directiveNode)
						break;
					}

				} catch (e: any) {
					this.component.onError(new Error(`"${directive.name}" on ${metadata.get(this.node).rawNodeString}: ${e.message}`));
				}

				this.dirAnchors.set(directive, null)
			}
		}

		if (directiveNode === this.node) {
			metadata.get(this.node).shadowed = false;

			this.anchor = this._switchNodeAndAnchor(directiveNode);

			if (this.property?.executables.length) {
				const newValue = this.property.executables.reduce((val, exc) => {
					return resolveExecutable(this.component, metadata.get(this.node).$context ?? {}, exc, val);
				}, this.property.value)


				if (newValue !== (this.node as ObjectLiteral)[this.property.name]) {
					(this.node as ObjectLiteral)[this.property.name] = newValue;
				}
			}

			for (let {name, value, executables} of this.attributes) {
				if (executables.length) {
					let newValue = executables.reduce((val, exc) => {
						return resolveExecutable(this.component, metadata.get(this.node).$context ?? {}, exc, val);
					}, value)

					const camelName = turnKebabToCamelCasing(name);

					if ((this.node as ObjectLiteral)[camelName] !== undefined) {
						newValue = jsonParse(newValue);

						if (newValue !== (this.node as ObjectLiteral)[camelName]) {
							(this.node as ObjectLiteral)[camelName] = newValue;
						}
					} else if ((this.node as HTMLElement).getAttribute(name) !== newValue) {
						(this.node as HTMLElement).setAttribute(name, newValue);
					}
				}
			}

			return this.node;
		}

		metadata.get(this.node).shadowed = true;

		this.anchor = this._switchNodeAndAnchor(directiveNode);
		
		return directiveNode;
	}

	private _unTrackNode(node: Node) {
		metadata.get(this.component).trackers.delete(node);
		metadata.delete(node);
		node.childNodes.forEach(n => this._unTrackNode(n))
	}

	private _setTracks() {
		const {nodeName, nodeValue, textContent, attributes} =  this.node as HTMLElement;
		const eventHandlers: Array<EventHandlerTrack> = [];

		if (nodeName === '#text') {
			this.property = {
				name: 'nodeValue',
				value: nodeValue || '',
				executables: []
			}
		} else {
			const attrs = [];
			const isRepeatedNode = (this.node as HTMLElement)?.hasAttribute('repeat');

			if (nodeName === 'TEXTAREA') {
				this.property = {
					name: 'value',
					value: textContent || '',
					executables: []
				}
				this.node.textContent = '';
			} else if (nodeName === 'STYLE') {
				const selectorPattern = /[a-z:#\.*\[][^{}]*[^\s:]\s*(?={){/gmi;
				const propValueStylePattern = /[a-z][a-z-]*:([^;]*)(;|})/gmi;
				let styleText = (textContent ?? '');
				let match: RegExpExecArray | null = null;
				let executables: Array<Executable> = [];

				while ((match = selectorPattern.exec(styleText)) !== null) {
					let propValueMatch: RegExpExecArray | null = null;
					let propValue = styleText.slice(selectorPattern.lastIndex);

					while ((propValueMatch = propValueStylePattern.exec(propValue)) !== null) {
						executables.push(...extractExecutableSnippetFromString(propValueMatch[1], ['[', ']']))
					}
				}

				if (executables.length) {
					this.property = {
						name: 'textContent',
						value: styleText,
						executables
					}
				}
			}

			// @ts-ignore
			for (let attribute of [...attributes]) {
				if (/^(attr\.|ref|if|repeat)/.test(attribute.name)) {
					const directive = parseNodeDirective(this.node as HTMLElement, attribute.name, attribute.value);

					if (directiveRegistry[directive.name]) {
						const Dir = directiveRegistry[directive.name];
						directive.handler = new Dir(this.component);
					}

					switch (directive.name) {
						case 'if':
							this.directives.unshift(directive);
							break;
						case 'repeat':
							if (this.directives[0]?.name === 'if') {
								this.directives.splice(1, 0, directive);
							} else {
								this.directives.unshift(directive);
							}
							break;
						default:
							this.directives.push(directive);
					}

					(this.node as Element).removeAttribute(attribute.name);
				} else if (attribute.name.startsWith('on')) {
					eventHandlers.push({
						eventName: attribute.name.slice(2).toLowerCase(),
						attribute
					});
				} else {
					attrs.push(attribute)
				}
			}

			eventHandlers.forEach(({eventName, fn, attribute}) => {
				(this.node as HTMLElement).removeAttribute(attribute.name);

				if (!fn && !isRepeatedNode) {
					fn = getEventHandlerFunction(this.component, this.$context, attribute) as EventListenerCallback;

					if (fn) {
						this.node.addEventListener(eventName, fn);
					}
				}
			});

			for (let attr of attrs) {
				if (attr.value.trim()) {
					this.attributes.push({
						name: attr.name,
						value: attr.value,
						executables: extractExecutableSnippetFromString(attr.value)
					})
				}
			}
		}

		if (this.property?.value.trim() && !this.property.executables.length) {
			this.property.executables = extractExecutableSnippetFromString(this.property.value)
		}

		this.empty = !this.directives.length &&
			!this.attributes.some(attr => attr.executables.length) &&
			!this.property.executables.length;
	}

	private _createDefaultAnchor() {
		return document.createComment(` ${this.node.nodeValue ?? (this.node as HTMLElement).outerHTML} `)
	}

	private _switchNodeAndAnchor(directiveNode: HTMLElement | Node | Comment | Array<Element>) {
		if (directiveNode === this.anchor) {
			return directiveNode;
		}

		if (!Array.isArray(directiveNode) && !(/[831]/.test(`${(directiveNode as Node).nodeType}`))) {
			directiveNode = this._createDefaultAnchor();
		}

		const anchorIsArray = Array.isArray(this.anchor);
		const dirIsArray = Array.isArray(directiveNode);
		const anchorEl = document.createComment('')
		let nextEl: Element | Comment | Text = anchorEl;

		if (anchorIsArray) {
			(this.anchor as Array<Element>)[0].parentNode?.insertBefore(nextEl, (this.anchor as Array<Element>)[0]);
		} else {
			(this.anchor as HTMLElement).before(nextEl);
		}

		if (dirIsArray) {
			for (let el of (directiveNode as Array<Element>)) {
				if (!el.isConnected) {
					nextEl.after(el);
					trackNode(el, this.component, {
						customSlot: this.component.customSlot,
						customSlotChildNodes: Array.from(this.component.childNodes)
					});
				}

				nextEl = el;
			}
		} else {
			nextEl.after(directiveNode as Node);
		}

		anchorEl.parentNode?.removeChild(anchorEl);

		if (anchorIsArray) {
			for (let el of (this.anchor as Array<Element>)) {
				if (!dirIsArray) {
					el.parentNode?.removeChild(el);
					this._unTrackNode(el);
				} else if (!(directiveNode as Array<Element>).includes(el)) {
					el.parentNode?.removeChild(el);
					this._unTrackNode(el);
				}
			}
		} else if (this.anchor !== directiveNode) {
			(this.anchor as Node).parentNode?.removeChild(this.anchor as Node);
		}

		this.anchor = directiveNode;

		return directiveNode;
	}
}
