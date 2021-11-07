import {parse} from './utils/parse';
import {setComponentPropertiesFromObservedAttributes} from './utils/set-component-properties-from-observed-attributes';
import {setupComponentPropertiesForAutoUpdate} from './utils/setup-component-properties-for-auto-update';
import {extractExecutableSnippetFromString} from './utils/extract-executable-snippet-from-string';
import {turnCamelToKebabCasing} from './utils/turn-camel-to-kebab-casing';
import {turnKebabToCamelCasing} from './utils/turn-kebab-to-camel-casing';
import {getStyleString} from './utils/get-style-string';
import {getComponentNodeEventListener} from './utils/get-component-node-event-listener';
import {evaluateStringInComponentContext} from './utils/evaluate-string-in-component-context';
import {parseNodeDirective} from "./utils/parse-node-directive";
import {ShadowRootModeExtended} from "./enums/ShadowRootModeExtended.enum";
import booleanAttr from './utils/boolean-attributes.json';

/**
 * a extension on the native web component API to simplify and automate most of the pain points
 * when it comes to creating and working with web components on the browser
 */
export class WebComponent extends HTMLElement {
	private readonly _root: WebComponent | ShadowRoot;
	private _trackers: Map<HTMLElement | Node | WebComponent, NodeTrack> = new Map();
	private _mounted = false;
	private _parsed = false;
	private _context: ObjectLiteral = {};
	private _contextSource: WebComponent | null = null;
	private _contextSubscribers: Array<ObserverCallback> = [];
	private _unsubscribeCtx: () => void = () => {
	};
	private _directives: Set<Directive> = new Set(['ref', 'if', 'repeat', 'attr']);
	readonly $refs: Refs = Object.create(null);

	constructor() {
		super();

		this._root = this;

		// @ts-ignore
		let {name, mode, observedAttributes, delegatesFocus, initialContext} = this.constructor;

		if (!/open|closed|none/.test(mode)) {
			throw new Error(`${name}: Invalid mode "${mode}". Must be one of ["open", "closed", "none"].`)
		}

		if (mode !== 'none') {
			this._root = this.attachShadow({mode, delegatesFocus});
		}

		if (!Array.isArray(observedAttributes) || observedAttributes.some(a => typeof a !== 'string')) {
			throw new Error(`${name}: "observedAttributes" must be an array of attribute strings.`)
		}

		this._context = initialContext;

		setComponentPropertiesFromObservedAttributes(this, observedAttributes,
			(prop, oldValue, newValue) => {
				this.forceUpdate();

				if (this.mounted) {
					this.onUpdate(prop, oldValue, newValue);
				}
			});
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
		return (this.constructor as WebComponentConstructor).mode === 'open' ? this._root : null;
	}

	/**
	 * whether or not the element is attached to the DOM and works differently than Element.isConnected
	 * @returns {boolean}
	 */
	get mounted() {
		return this._mounted;
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
		return Object.setPrototypeOf({...this._contextSource?.$context, ...this._context}, {
			subscribe: this._ctxSubscriberHandler.bind(this),
		});
	}

	updateContext(ctx: ObjectLiteral) {
		this._context = {...this._context, ...ctx};

		if (this.mounted) {
			this.forceUpdate();
			this._contextSubscribers.forEach(cb => cb(this._context));
		}
	}

	connectedCallback() {
		try {
			this._contextSource = this._getClosestWebComponentAncestor();

			if (this._contextSource) {
				// force update the component if the ancestor context gets updated as well
				this._unsubscribeCtx = this._contextSource.$context.subscribe((newContext: ObjectLiteral) => {
					this.forceUpdate();

					if (this.mounted) {
						this.onUpdate('$context', this._context, newContext)
					}

					this._contextSubscribers.forEach(cb => cb(newContext));
				})
			}

			/*
			only need to parse the element the very first time it gets mounted

			this will make sure that if the element is removed from the dom and mounted again
			all that needs to be done if update the DOM to grab the possible new context and updated data
			 */
			if (this._parsed) {
				this.forceUpdate();
			} else {
				setupComponentPropertiesForAutoUpdate(this, (prop, oldValue, newValue) => {
					this.forceUpdate();

					if (this.mounted) {
						this.onUpdate(prop, oldValue, newValue);
					}
				})

				let contentNode;

				contentNode = parse(this.template);

				this._render(contentNode);

				const hasShadowRoot = (this.constructor as WebComponentConstructor).mode !== 'none';

				const style = getStyleString(this.stylesheet, (this.constructor as WebComponentConstructor).tagName, hasShadowRoot);

				if (style) {
					if (hasShadowRoot) {
						this._root.innerHTML = style;
					} else if (!document.head.querySelector(`style${(this.constructor as WebComponentConstructor).tagName}`)) {
						document.head.insertAdjacentHTML('beforeend', style);
					}
				}

				this._parsed = true;

				this._root.appendChild(contentNode);
			}

			this._mounted = true;
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
			this._contextSource = null;
			this._mounted = false;
			this._unsubscribeCtx();
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
	 * updates any DOM node with data bind reference.
	 */
	forceUpdate() {
		this._trackers.forEach((track: NodeTrack) => this._updateTrackValue(track));
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

	private _getEventHandlerFunction(node: ObjectLiteral, attribute: Attr) {
		const props = ['$item', '$key', '$refs', '$context'];
		const values = [
			(node as ObjectLiteral).$item,
			(node as ObjectLiteral).$key,
			this.$refs,
			this.$context
		];

		const fn = getComponentNodeEventListener(this, attribute.name, attribute.value, props, values);

		if (fn) {
			return fn;
		} else {
			this.onError(new Error(`${this.constructor.name}: Invalid event handler for "${attribute.name}" >>> "${attribute.value}".`))
		}

		return null
	}

	private _render(node: Node | HTMLElement | DocumentFragment | WebComponent, directives: Directive[] = [], handlers: NodeTrack['eventHandlers'] = []) {
		if (node.nodeName === 'SLOT') {
			const {mode} = this.constructor as WebComponentConstructor;
			// when there is no shadow root the slot does not work so in that case
			// the slot element must be replaced by all its assigned nodes
			if (mode === 'none') {
				const frag = document.createDocumentFragment();
				const slotName = (node as HTMLSlotElement).name;

				if (slotName) {
					this.querySelectorAll(`[slot="${slotName}"]`).forEach(n => frag.appendChild(n));
				} else {
					this.childNodes.forEach(n => {
						if (n.nodeType !== 1 || !(n as Element).hasAttribute('slot')) {
							frag.appendChild(n)
						}
					});
				}

				node.parentNode?.replaceChild(frag, node);
			} else {
				node.addEventListener('slotchange', (e) => {
					(node as HTMLSlotElement).assignedNodes().forEach(n => this._render(n))
				});
			}
		} else if (node.nodeName === '#text') {
			if (node.nodeValue?.trim()) {
				this._trackNode(node as Node, [], [], [], {
					name: 'nodeValue',
					value: node.nodeValue,
					executables: []
				});
			}
		} else if (node.nodeType === 1) {
			const attributes = [];
			const isRepeatedNode = (node as HTMLElement).hasAttribute('repeat');

			// @ts-ignore
			for (let attribute of [...node.attributes]) {
				if (/^(attr\.|ref|if|repeat)/.test(attribute.name)) {
					const directiveName = parseNodeDirective(node as HTMLElement, attribute.name, attribute.value);
					switch (directiveName) {
						case 'ref':
							directives[0] = directiveName;
							break;
						case 'if':
							directives[1] = directiveName;
							break;
						case 'repeat':
							directives[2] = directiveName;
							break;
						case 'attr':
							directives[3] = directiveName;
							break;
					}
				} else if (attribute.name.startsWith('on')) {
					handlers.push({
						eventName: attribute.name.slice(2).toLowerCase(),
						attribute
					});
				} else {
					attributes.push(attribute)
				}
			}

			handlers.forEach(({eventName, fn, attribute}) => {
				if (!fn && !isRepeatedNode) {
					fn = this._getEventHandlerFunction(node, attribute) as EventListenerCallback;
					node.addEventListener(eventName, fn as EventListenerCallback);
				}

				(node as HTMLElement).removeAttribute(attribute.name);
			})

			this._trackNode(node, attributes, directives.filter(d => d), handlers);
		}

		if (node.nodeName !== '#text' && node.nodeName !== '#comment') {
			node.childNodes.forEach(node => this._render(node));
		}

	}

	private _trackNode(
		node: HTMLElement | Node,
		attributes: Array<Attr>,
		directives: Array<Directive>,
		eventHandlers: NodeTrack['eventHandlers'],
		property: NodeTrack['property'] | null = null
	) {
		if (this._trackers.has(node)) {
			this._updateTrackValue(this._trackers.get(node) as NodeTrack);
		} else {
			const track: NodeTrack = {
				node,
				attributes: [],
				directives,
				property,
				eventHandlers
			};

			if (property?.value.trim()) {
				property.executables = extractExecutableSnippetFromString(property.value)
			}

			for (let attr of attributes) {
				track.attributes.push({
					name: attr.name,
					value: attr.value,
					executables: attr.value.trim()
						? extractExecutableSnippetFromString(attr.value)
						: []
				})
			}

			this._trackers.set(node, track);

			this._updateTrackValue(track);
		}
	}

	private _execString(executable: string, [$item, $key]: any[] = []) {
		if (!executable.trim()) {
			return;
		}

		const keys = new Set(Object.getOwnPropertyNames(this).filter((n) => !n.startsWith('_') && !this._directives.has(n as Directive)));
		const ctx = this.$context;
		keys.add('$context');
		keys.add('$item');
		keys.add('$key');

		Object.getOwnPropertyNames(ctx).forEach(n => {
			keys.add(n);
		})

		const keysArray = Array.from(keys);

		const values = keysArray.map(key => {
			switch (key) {
				case '$context':
					return ctx;
				case '$item':
					return $item;
				case '$key':
					return $key;
			}

			// @ts-ignore
			return this[key] ?? ctx[key];
		});

		return evaluateStringInComponentContext(executable, this, keysArray, values);
	}

	private _resolveExecutable(node: Node, {match, executable}: Executable, newValue: string) {
		// @ts-ignore
		let {$item, $key} = node;

		if (/(?:^|\W)\$(index|key|item)(?:$|\W)/.test(executable) && $item === undefined) {
			let parent: any = node.parentNode;

			while (parent && !(parent instanceof ShadowRoot) && parent !== this) {
				if (parent['$item']) {
					$item = parent['$item'];
					$key = parent['$key'];
					break;
				}

				parent = parent.parentNode;
			}
		}

		let res = this._execString(executable, [$item, $key]);

		if (res && typeof res === 'object') {
			try {
				res = JSON.stringify(res)
			} catch (e) {
			}
		}

		return newValue.replace(match, res);
	}

	private _updateTrackValue(track: NodeTrack) {
		if (track) {
			try {
				const {node, attributes, directives, property} = track;

				for (let directive of directives) {
					const res = this._directiveHandlers[directive](node as WebComponent);

					if (!res) return;
				}

				if (property?.executables.length) {
					let newValue = property.value;

					property.executables.forEach((exc) => {
						newValue = this._resolveExecutable(node, exc, newValue);
					});

					(node as ObjectLiteral)[property.name] = newValue;
				}

				for (let {name, value, executables} of attributes) {
					if (executables.length) {
						let newValue = value;

						executables.forEach((exc) => {
							newValue = this._resolveExecutable(node, exc, newValue);
						});

						const camelName = turnKebabToCamelCasing(name);

						if ((node as ObjectLiteral)[camelName] !== undefined) {
							try {
								newValue = JSON.parse(newValue)
							} catch (e) {
							}

							(node as ObjectLiteral)[camelName] = newValue;
						} else {
							(node as HTMLElement).setAttribute(name, newValue);
						}
					}
				}
			} catch (e) {
				this.onError(e as ErrorEvent)
			}
		}
	}

	private _getClosestWebComponentAncestor(): WebComponent | null {
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

	private _ctxSubscriberHandler(cb: ObserverCallback) {
		this._contextSubscribers.push(cb);
		return () => {
			this._contextSubscribers = this._contextSubscribers.filter(c => c !== cb);
		}
	}

	private _directiveHandlers: { [attr: string]: (node: WebComponent) => null | WebComponent } = {
		'ref': this._handleRefAttribute.bind(this),
		'if': this._handleIfAttribute.bind(this),
		'repeat': this._handleRepeatAttribute.bind(this),
		'attr': this._handleAttrAttribute.bind(this),
	}

	private _handleIfAttribute(node: WebComponent) {
		const attr = 'if';
		// @ts-ignore
		let {$item, $key} = node;
		let {value, placeholderNode}: DirectiveValue = (node as ObjectLiteral)[attr][0];

		const shouldRender = this._execString(value, [$item, $key]);

		if (!placeholderNode) {
			(node as ObjectLiteral)[attr][0].placeholderNode = document.createComment(`${attr}: ${value}`);
			placeholderNode = (node as ObjectLiteral)[attr][0].placeholderNode;
		}

		if (!(node as ObjectLiteral).__oginner__) {
			(node as ObjectLiteral).__oginner__ = node.innerHTML;
		}

		if (shouldRender) {
			placeholderNode?.parentNode?.replaceChild(node, placeholderNode);

			return node;
		}

		node.parentNode?.replaceChild((node as ObjectLiteral)[attr][0].placeholderNode, node);

		if ((node as ObjectLiteral)['repeat']) {
			this._handleRepeatAttribute(node, true);
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

	private _cloneRepeatedNode(node: WebComponent | HTMLElement, index: number, list: Array<any> = []) {
		const clone = node.cloneNode();
		// @ts-ignore
		clone.innerHTML = node.__oginner__;

		for (let hAttr of ['repeat_id', 'if', 'attr']) {
			if ((node as ObjectLiteral)[hAttr]) {
				// @ts-ignore
				clone[hAttr] = node[hAttr];
			}
		}

		this._updateNodeRepeatKeyAndItem(clone as HTMLElement, index, list)

		const {directives, eventHandlers} = this._trackers.get(node) as NodeTrack;

		this._render(clone, directives.filter(d => d !== 'repeat' && d !== 'ref'), eventHandlers);

		return clone;
	}

	private _handleRepeatAttribute(node: WebComponent | HTMLElement, clear = false) {
		const attr = 'repeat';
		const repeatAttr = 'repeat_id';
		// @ts-ignore
		let {$item, $key} = node;
		let {value, placeholderNode}: DirectiveValue = (node as ObjectLiteral)[attr][0];
		let repeatData = this._execString(value, [$item, $key]);
		let index = 0;

		if (!(node as ObjectLiteral)[repeatAttr]) {
			(node as ObjectLiteral)[repeatAttr] = Math.floor(Math.random() * 10000000);
		}

		if (!placeholderNode) {
			(node as ObjectLiteral)[attr][0].placeholderNode = document.createComment(`repeat: ${value}`);
		}

		if (!(node as ObjectLiteral).__oginner__) {
			(node as ObjectLiteral).__oginner__ = node.innerHTML;
		}

		const anchor = (node as ObjectLiteral)[attr][0].placeholderNode;

		if (!anchor.isConnected) {
			node.parentNode?.replaceChild(anchor, node);
		}

		let nextEl = anchor.nextElementSibling;
		const repeat_id = (node as ObjectLiteral)[repeatAttr];
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

		while (index < times) {
			if (nextEl) {
				if (nextEl[repeatAttr] === repeat_id) {
					this._updateNodeRepeatKeyAndItem(nextEl, index, repeatData);
					nextEl = nextEl.nextElementSibling;
					this._updateTrackValue(this._trackers.get(nextEl) as NodeTrack);
					index += 1;
					continue;
				}

				nextEl.before(this._cloneRepeatedNode(node, index, repeatData));
				index += 1;
			} else {
				const nodeClone = this._cloneRepeatedNode(node, index, repeatData);

				if (index === 0) {
					anchor.after(nodeClone);
				} else {
					anchor.parentNode?.lastElementChild?.after(nodeClone);
				}

				nextEl = (nodeClone as WebComponent).nextElementSibling;
				index += 1;
			}
		}

		while (nextEl && nextEl[repeatAttr] === repeat_id) {
			this._trackers.delete(nextEl);
			const next = nextEl.nextElementSibling;
			nextEl.remove();
			nextEl = next;
		}

		if (clear && anchor.isConnected) {
			anchor.parentNode.removeChild(anchor)
		}

		return null;
	}

	private _handleRefAttribute(node: WebComponent) {
		const attr = 'ref';
		const {value}: DirectiveValue = (node as ObjectLiteral)[attr][0];

		if (this.$refs[value] === undefined && !(node as ObjectLiteral)['repeat']) {
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

	private _handleAttrAttribute(node: WebComponent) {
		const attr = 'attr';

		(node as ObjectLiteral)[attr].forEach(({value, prop}: DirectiveValue) => {
			let [attrName, property] = prop.split('.');
			let {$item, $key} = node as ObjectLiteral;
			const commaIdx = value.lastIndexOf(',');
			let val = commaIdx >= 0 ? value.slice(0, commaIdx).trim() : '';
			const shouldAdd = this._execString(
				commaIdx >= 0 ? value.slice(commaIdx + 1).trim() : value,
				[$item, $key]);

			if (val) {
				extractExecutableSnippetFromString(val).forEach((exc) => {
					val = this._resolveExecutable(node, exc, val);
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
							?.forEach(style => {
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
							classes.forEach(cls => node.classList.add(cls));
						} else {
							classes.forEach(cls => node.classList.remove(cls));
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
						const kebabProp = turnCamelToKebabCasing(attrName);
						if (shouldAdd) {
							const idealVal = booleanAttr.hasOwnProperty(attrName) || val || `${shouldAdd}`;

							if ((node as ObjectLiteral)[attrName] !== undefined) {
								(node as ObjectLiteral)[attrName] = idealVal;
							} else {
								node.setAttribute(kebabProp, idealVal.toString());
							}
						} else {
							node.removeAttribute(kebabProp);
						}
					}
			}
		})

		return node;
	}
}

// @ts-ignore
if (window) {
	// @ts-ignore
	window.WebComponent = WebComponent;
}
