import {parse} from './utils/parse';
import {setComponentPropertiesFromObservedAttributes} from './utils/set-component-properties-from-observed-attributes';
import {setupComponentPropertiesForAutoUpdate} from './utils/setup-component-properties-for-auto-update';
import {extractExecutableSnippetFromString} from './utils/extract-executable-snippet-from-string';
import {turnCamelToKebabCasing} from './utils/turn-camel-to-kebab-casing';
import {turnKebabToCamelCasing} from './utils/turn-kebab-to-camel-casing';
import {getStyleString} from './utils/get-style-string';
import {ShadowRootModeExtended} from "./enums/ShadowRootModeExtended.enum";
import {NodeTrack} from './node-track';
import booleanAttr from './utils/boolean-attributes.json';
import {metadata} from "./metadata";
import {execString} from "./utils/exec-string";
import {resolveExecutable} from "./utils/resolve-executable";

/**
 * a extension on the native web component API to simplify and automate most of the pain points
 * when it comes to creating and working with web components on the browser
 */
export class WebComponent extends HTMLElement {
	readonly #root: WebComponent | ShadowRoot;
	readonly #trackers: Map<HTMLElement | Node | WebComponent, NodeTrack> = new Map();
	readonly $refs: Refs = Object.create(null);
	#mounted = false;
	#parsed = false;
	#context: ObjectLiteral = {};
	#contextSource: WebComponent | null = null;
	#contextSubscribers: Array<ObserverCallback> = [];
	#unsubscribeCtx: () => void = () => {};
	$properties: Array<string> = ['$context', '$key', '$item', '$refs'];

	constructor() {
		super();

		this.#root = this;

		// @ts-ignore
		let {name, mode, observedAttributes, delegatesFocus, initialContext} = this.constructor;

		if (!/open|closed|none/.test(mode)) {
			throw new Error(`${name}: Invalid mode "${mode}". Must be one of ["open", "closed", "none"].`)
		}

		if (mode !== 'none') {
			this.#root = this.attachShadow({mode, delegatesFocus});
		}

		if (!Array.isArray(observedAttributes) || observedAttributes.some(a => typeof a !== 'string')) {
			throw new Error(`${name}: "observedAttributes" must be an array of attribute strings.`)
		}

		this.#context = initialContext;

		this.$properties.push(
			...setComponentPropertiesFromObservedAttributes(this, observedAttributes,
				(prop, oldValue, newValue) => {
					this.forceUpdate();

					if (this.mounted) {
						this.onUpdate(prop, oldValue, newValue);
					}
				})
		);
	}

	/**
	 * an array of attribute names as they will look in the html tag
	 * https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elementsusing_the_lifecycle_callbacks
	 * @type {[]}
	 */
	static observedAttributes: Array<string> = [];

	/**
	 * shadow root mode
	 * https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot/mode
	 * plus an additional option of "none" to signal you dont want
	 * the content to be places inside the shadow root but directly under the tag
	 * @type {string}
	 */
	static mode = ShadowRootModeExtended.OPEN;

	/**
	 * shadow root delegate focus option
	 * https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot/delegatesFocus
	 * @type {boolean}
	 */
	static delegatesFocus = false;

	/**
	 * a valid name of the html tag
	 * @type {string}
	 */
	static tagName = '';

	/**
	 * the initial context data for the component
	 */
	static initialContext = {};

	/**
	 * registers the component with the CustomElementRegistry taking an optional tag name if not
	 * specified as static member of the class as tagName
	 * @param tagName
	 */
	static register(tagName?: string | undefined) {
		tagName = typeof tagName === 'string' && tagName
			? tagName
			: typeof this.tagName === 'string' && this.tagName
				? this.tagName
				: turnCamelToKebabCasing(this.name);

		this.tagName = tagName;

		if (!customElements.get(tagName)) {
			customElements.define(tagName, this);
		}
	}

	/**
	 * registers a list of provided web component classes
	 * @param components
	 */
	static registerAll(components: Array<WebComponentConstructor>) {
		components.forEach(comp => comp.register());
	}

	/**
	 * returns whether the component is registered or not
	 */
	static get isRegistered() {
		return this.tagName !== '' && customElements.get(this.tagName) !== undefined;
	}

	/**
	 * the root element. If shadow root present it will be the shadow root otherwise
	 * the actual element
	 * @returns {*}
	 */
	get root(): HTMLElement | ShadowRoot | null {
		return (this.constructor as WebComponentConstructor).mode === 'open' ? this.#root : null;
	}

	/**
	 * whether or not the element is attached to the DOM and works differently than Element.isConnected
	 * @returns {boolean}
	 */
	get mounted() {
		return this.#mounted;
	}

	/**
	 * style for the component whether inside the style tag, as object or straight CSS string
	 * @returns {string | {type: string, content: string}}
	 */
	get stylesheet() {
		return '';
	}

	/**
	 * template for the element HTML content
	 * @returns {string}
	 */
	get template() {
		return '';
	}

	get $context(): ObjectLiteral {
		// make sure the subscribe method is part of the prototype
		// so it is hidden unless the prototype is checked
		return Object.setPrototypeOf({...this.#contextSource?.$context, ...this.#context}, {
			subscribe: this.#ctxSubscriberHandler.bind(this),
		});
	}

	get parsed() {
		return this.#parsed;
	}

	updateContext(ctx: ObjectLiteral) {
		this.#context = {...this.#context, ...ctx};

		if (this.mounted) {
			this.forceUpdate();
			this.#contextSubscribers.forEach(cb => cb(this.#context));
		}
	}

	connectedCallback() {
		try {
			this.#contextSource = this.#getClosestWebComponentAncestor();

			if (this.#contextSource) {
				// force update the component if the ancestor context gets updated as well
				this.#unsubscribeCtx = this.#contextSource.$context.subscribe((newContext: ObjectLiteral) => {
					this.forceUpdate();

					if (this.mounted) {
						this.onUpdate('$context', this.#context, newContext)
					}

					this.#contextSubscribers.forEach(cb => cb(newContext));
				})
			}

			/*
			only need to parse the element the very first time it gets mounted

			this will make sure that if the element is removed from the dom and mounted again
			all that needs to be done if update the DOM to grab the possible new context and updated data
			 */
			if (this.#parsed) {
				this.forceUpdate();
			} else {
				this.$properties.push(
					...setupComponentPropertiesForAutoUpdate(this, (prop, oldValue, newValue) => {
						this.forceUpdate();

						if (this.mounted) {
							this.onUpdate(prop, oldValue, newValue);
						}
					})
				)

				Object.freeze(this.$properties);

				let contentNode;
				const hasShadowRoot = (this.constructor as WebComponentConstructor).mode !== 'none';
				const style = getStyleString(this.stylesheet, (this.constructor as WebComponentConstructor).tagName, hasShadowRoot);

				contentNode = parse(style + this.template);

				this._render(contentNode);

				const {tagName, mode} = (this.constructor as WebComponentConstructor);

				if (mode === 'none') {
					const styles = contentNode.querySelectorAll('style');

					styles.forEach((style: HTMLStyleElement) => {
						const existingStyleElement: HTMLStyleElement | null = document.head.querySelector(`style.${tagName}`);

						if (existingStyleElement) {
							existingStyleElement.textContent = `${style?.textContent}${existingStyleElement.textContent}`;
						} else {
							document.head.appendChild(style);
						}
					})
				}

				this.#parsed = true;

				this.#root.appendChild(contentNode);
			}

			this.#mounted = true;
			this.onMount();
		} catch (e) {
			this.onError(e as ErrorEvent);
		}
	}

	/**
	 * livecycle callback for when the element is attached to the DOM
	 */
	onMount() {
	}

	disconnectedCallback() {
		try {
			this.#contextSource = null;
			this.#mounted = false;
			this.#unsubscribeCtx();
			this.onDestroy();
		} catch (e) {
			this.onError(e as Error)
		}
	}

	/**
	 * livecycle callback for when the element is removed from the DOM
	 */
	onDestroy() {
	}

	attributeChangedCallback(name: string, oldValue: any, newValue: any) {
		try {
			if (!(name.startsWith('data-') || name === 'class' || name === 'style')) {
				const prop: any = turnKebabToCamelCasing(name);

				if (booleanAttr.hasOwnProperty(prop)) {
					console.log('-- change', this.hasAttribute);
					newValue = this.hasAttribute(name);
				} else if (typeof newValue === 'string') {
					try {
						newValue = JSON.parse(newValue);
					} catch (e) {
					}
				}

				// @ts-ignore
				this[prop] = newValue;
			} else {
				this.forceUpdate();

				if (this.mounted) {
					this.onUpdate(name, oldValue, newValue);
				}
			}
		} catch (e) {
			this.onError(e as ErrorEvent)
		}
	}

	/**
	 * livecycle callback for when the element attributes or class properties are updated
	 */
	onUpdate(name: string, oldValue: unknown, newValue: unknown) {
	}

	/**
	 * updates any already tracked node with current component data including context and node level data.
	 */
	forceUpdate() {
		this.#trackers.forEach((track: NodeTrack) => {
			track.updateNode()
		});
	}

	/**
	 * make so a node will stop being updated when new changes are made
	 * @param node
	 */
	untrack(node: Node) {
		this.#trackers.delete(node);
		metadata.delete(node);
		node.childNodes.forEach(n => this.untrack(n))
	}

	adoptedCallback() {
		try {
			this.onAdoption();
		} catch (e) {
			this.onError(e as Error)
		}
	}

	/**
	 * livecycle callback for when element is moved into a new document
	 */
	onAdoption() {
	}

	/**
	 * error callback for when an error occurs
	 */
	onError(error: ErrorEvent | Error) {
		console.error(this.constructor.name, error);
	}

	protected _renderSlotNode(node: HTMLSlotElement) {
		node.addEventListener('slotchange', () => {
			node.assignedNodes().forEach((n: HTMLElement | Node) => {
				this._render(n);
			});
		});

		node.childNodes.forEach((n: HTMLElement | Node) => {
			this._render(n);
		});
	}

	protected _render(node: Node | HTMLElement | DocumentFragment | WebComponent, directives: Directive[] = [], handlers: NodeTrack['eventHandlers'] = []) {
		// it is possible that the node is already rendered by the parent component
		// and then picked up by the child component via slot
		// in that case we do not need to render it again since it will already be
		// ready to do anything it needs and also prevent it from being tracked again
		if (metadata.get(node)?.__rendered) {
			return;
		}

		if (node.nodeName === 'SLOT') {
			return this._renderSlotNode(node as HTMLSlotElement);
		}

		// avoid fragments
		if (node.nodeType !== 11) {
			if (!metadata.has(node)) {
				metadata.set(node, Object.create(null));
			}

			// mark the node as rendered so it gets skipped if picked via slot
			metadata.get(node).__rendered = true;
		}

		const isElement = node.nodeType === 1;
		const isTextNode = !isElement && node.nodeName === '#text';
		const isCommentNode = !isElement && node.nodeName === '#comment';
		const isStyle = node.nodeName === 'STYLE';
		const isTextArea = node.nodeName === 'TEXTAREA';
		const isRepeatedNode = isElement && (node as HTMLElement).hasAttribute('repeat');
		const isScript = node.nodeName === 'SCRIPT';

		if ((isElement && !isScript) || (isTextNode && node.nodeValue?.trim())) {
			const track = new NodeTrack(node, this);
			if (!track.empty) {
				this.#trackers.set(node, track);
				track.updateNode();
			}
		}

		if (isCommentNode || isTextNode || !node.childNodes.length || isRepeatedNode || isTextArea || isScript || isStyle) {
			return;
		}

		node.childNodes.forEach(child => this._render(child));
	}

	#getClosestWebComponentAncestor(): WebComponent | null {
		let parent = this.parentNode;

		while (parent && !(parent instanceof WebComponent)) {
			if (parent instanceof ShadowRoot) {
				parent = parent.host;
			} else {
				parent = parent.parentNode;
			}
		}

		return parent instanceof WebComponent ? parent : null;
	}

	#ctxSubscriberHandler(cb: ObserverCallback) {
		this.#contextSubscribers.push(cb);
		return () => {
			this.#contextSubscribers = this.#contextSubscribers.filter(c => c !== cb);
		}
	}

	_directiveHandlers: { [attr: string]: (node: WebComponent, metadata: ObjectLiteral, raw?: string) => null | DocumentFragment | HTMLElement | Node } = {
		'ref': this._handleRefAttribute.bind(this),
		'if': this._handleIfAttribute.bind(this),
		'repeat': this._handleRepeatAttribute.bind(this),
		'attr': this._handleAttrAttribute.bind(this),
	}

	private _handleIfAttribute(node: WebComponent, metadata: ObjectLiteral): null | HTMLElement {
		const directive = metadata[0];
		let {value}: DirectiveValue = directive;
		const shouldRender = execString(this, value, node);

		if (shouldRender) {
			return node;
		}

		return null;
	}

	private _updateNodeRepeatKeyAndItem(node: WebComponent | HTMLElement, index: number, list: Array<any> = []) {
		const [key, value] = list[index] ?? [index, index + 1];
		// @ts-ignore
		node['$item'] = value;
		// @ts-ignore
		node['$key'] = key;
	}

	private _cloneRepeatedNode(rawNodeOuterHTML: string, repeat: ObjectLiteral, index: number, list: Array<any> = []) {
		const n = document.createElement('div');
		n.innerHTML = rawNodeOuterHTML;
		const clone = n.children[0] as HTMLElement;
		clone.removeAttribute('repeat');
		clone.removeAttribute('if');

		this._updateNodeRepeatKeyAndItem(clone as HTMLElement, index, list);

		return clone;
	}

	private _handleRepeatAttribute(node: WebComponent | HTMLElement, directive: ObjectLiteral, rawNodeOuterHTML: string = ''): DocumentFragment {
		const frag = document.createDocumentFragment();
		const repeat = directive[0];

		if (node.nodeType === 1) {
			let {value}: DirectiveValue = repeat;
			let repeatData = execString(this, value, node);
			let times = 0;

			if (Number.isInteger(repeatData)) {
				times = repeatData;
			} else {
				repeatData = repeatData instanceof Set ? Object.entries(Array.from(repeatData))
					: repeatData instanceof Map ? Array.from(repeatData.entries())
						: repeatData[Symbol.iterator] ? Object.entries([...repeatData])
							: Object.entries(repeatData);
				times = repeatData.length;
			}

			for (let index = 0; index < times; index++) {
				const nodeClone = this._cloneRepeatedNode(rawNodeOuterHTML, repeat, index, repeatData);
				frag.appendChild(nodeClone);
			}
		}

		return frag;
	}

	private _handleRefAttribute(node: WebComponent, directive: ObjectLiteral) {
		const {value}: DirectiveValue = directive[0];

		if (this.$refs[value] === undefined) {
			if (/^[a-z$_][a-z0-9$_]*$/i.test(value)) {
				Object.defineProperty(this.$refs, value, {
					get() {
						return node;
					}
				})
				return node;
			}

			this.onError(new Error(`Invalid "ref" property name "${value}"`))
		}

		return node;
	}

	private _handleAttrAttribute(node: WebComponent, attr: ObjectLiteral) {
		attr.forEach(({value, prop}: DirectiveValue) => {
			let [attrName, property] = (prop ?? '').split('.');
			const commaIdx = value.lastIndexOf(',');
			let val = commaIdx >= 0 ? value.slice(0, commaIdx).trim() : '';
			const shouldAdd = execString(
				this,
				commaIdx >= 0 ? value.slice(commaIdx + 1).trim() : value,
				node);

			if (val) {
				extractExecutableSnippetFromString(val).forEach((exc) => {
					val = resolveExecutable(this, node, exc, val);
				});
			}

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
		})

		return node;
	}
}
