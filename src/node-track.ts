import {extractExecutableSnippetFromString} from "./utils/extract-executable-snippet-from-string";
import {parseNodeDirective} from "./utils/parse-node-directive";
import {turnKebabToCamelCasing} from "./utils/turn-kebab-to-camel-casing";
import {resolveExecutable} from "./utils/resolve-executable";
import {getEventHandlerFunction} from "./utils/get-event-handler-function";
import {directiveRegistry} from './directives/registry';
import {evaluateStringInComponentContext} from "./utils/evaluate-string-in-component-context";
import metadata from "./metadata";
import {defineNodeContextMetadata} from "./utils/define-node-context-metadata";

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
	eventHandlers: Array<EventHandlerTrack> = [];
	property: null | {
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

		// whether or not the node was replaced by another on render
		metadata.get(this.node).shadowed = false;
		metadata.get(this.node).rawNodeString = (this.node as HTMLElement).outerHTML ?? (this.node as Text).nodeValue;
		defineNodeContextMetadata(node, component);

		this._setTracks();
	}

	get $context() {
		return metadata.get(this.node).$context;
	}

	updateNode() {
		// if a node was rendered before(handled by the component._render function)
		// and no longer has a parent(removed from the DOM)
		// and it is is not being shadowed(temporarily removed from the DOM by a directive)
		// the node no longer needs to be tracked so it can be discarded
		if (metadata.get(this.node).__rendered && !this.node.parentNode && !metadata.get(this.node).shadowed) {
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
					
				} catch(e: any) {
					this.component.onError(new Error(`"${directive.name}" on ${(this.node as HTMLElement).outerHTML}: ${e.message}`));
				}
				
				this.dirAnchors.set(directive, null)
			}
		}

		if (directiveNode === this.node) {
			metadata.get(this.node).shadowed = false;
			
			this.anchor = this._switchNodeAndAnchor(directiveNode);

			if (this.property?.executables.length) {
				let newValue = this.property.value;

				this.property.executables.forEach((exc) => {
					newValue = resolveExecutable(this.component, metadata.get(this.node).$context ?? {}, exc, newValue);
				});

				if (newValue !== (this.node as ObjectLiteral)[this.property.name]) {
					(this.node as ObjectLiteral)[this.property.name] = newValue;
				}
			}

			for (let {name, value, executables} of this.attributes) {
				if (executables.length) {
					let newValue = value;

					executables.forEach((exc) => {
						newValue = resolveExecutable(this.component, metadata.get(this.node).$context ?? {}, exc, newValue);
					});

					const camelName = turnKebabToCamelCasing(name);

					if ((this.node as ObjectLiteral)[camelName] !== undefined) {
						try {
							newValue = JSON.parse(newValue.replace(/['`]/g, '"'));
						} catch (e) {
						}

						if (newValue !== (this.node as ObjectLiteral)[camelName]) {
							(this.node as ObjectLiteral)[camelName] = newValue;
						}
					} else if ((this.node as HTMLElement).getAttribute(name) !== newValue) {
						(this.node as HTMLElement).setAttribute(name, newValue);
					}
				}
			}

			return;
		}

		metadata.get(this.node).shadowed = true;
		
		this.anchor = this._switchNodeAndAnchor(directiveNode);
	}
	
	private _unTrackNode(node: Node) {
		metadata.get(this.component).trackers.delete(node);
		metadata.delete(node);
		node.childNodes.forEach(n => this._unTrackNode(n))
	}

	private _setTracks() {
		this.directives = [];
		this.attributes = [];
		this.eventHandlers = [];
		this.property = {
			name: '',
			value: '',
			executables: []
		};

		const isTextNode = this.node.nodeName === '#text';

		if (isTextNode) {
			this.property = {
				name: 'nodeValue',
				value: this.node.nodeValue || '',
				executables: []
			}
		} else {
			const attributes = [];
			const isRepeatedNode = (this.node as HTMLElement)?.hasAttribute('repeat');

			if ((this.node as HTMLElement).nodeName === 'TEXTAREA') {
				this.property = {
					name: 'value',
					value: this.node.textContent || '',
					executables: []
				}
				this.node.textContent = '';
			} else if((this.node as HTMLElement).nodeName === 'STYLE') {
				const selectorPattern = /[a-z:#\.*\[][^{}]*[^\s:]\s*(?={){/gmi;
				const propValueStylePattern = /[a-z][a-z-]*:([^;]*)(;|})/gmi;
				let styleText = (this.node.textContent ?? '');
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

			const self = this;
			
			// @ts-ignore
			for (let attribute of [...(this.node as HTMLElement).attributes]) {
				if (/^(attr\.|ref|if|repeat)/.test(attribute.name)) {
					const directive = parseNodeDirective(this.node as HTMLElement, attribute.name, attribute.value);
					
					if (directiveRegistry[directive.name]) {
						const Dir = directiveRegistry[directive.name];
						directive.handler = new (class extends Dir {
							setRef(name: string, node: Node) {
								self.component.$refs[name] = node;
							}
							
							setContext(node: Node, key: string, value: any) {
								defineNodeContextMetadata(node, self.component);
								super.setContext(node, key, value);
							}
						})() as any;
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
					this.eventHandlers.push({
						eventName: attribute.name.slice(2).toLowerCase(),
						attribute
					});
				} else {
					attributes.push(attribute)
				}
			}

			this.eventHandlers.forEach(({eventName, fn, attribute}) => {
				(this.node as HTMLElement).removeAttribute(attribute.name);

				if (!fn && !isRepeatedNode) {
					fn = getEventHandlerFunction(this.component, this.$context, attribute) as EventListenerCallback;

					if (fn) {
						this.node.addEventListener(eventName, fn);
					}
				}
			});

			for (let attr of attributes) {
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
			!this.eventHandlers.length &&
			!this.attributes.length &&
			!this.property?.executables.length;
	}

	private _createDefaultAnchor() {
		return document.createComment( ` ${this.node.nodeValue ?? (this.node as HTMLElement).outerHTML} `)
	}

	private _switchNodeAndAnchor(directiveNode: HTMLElement | Node | Comment | Array<Element>) {
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
					// @ts-ignore
					this.component._render(el);
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
				} else if(!(directiveNode as Array<Element>).includes(el)) {
					el.parentNode?.removeChild(el);
					this._unTrackNode(el);
				}
			}
		} else if(this.anchor !== directiveNode) {
			(this.anchor as Node).parentNode?.removeChild(this.anchor as Node);
		}

		this.anchor = directiveNode;

		return directiveNode;
	}
}
