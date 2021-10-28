import {parse} from './utils/parse';
import {setComponentPropertiesFromObservedAttributes} from './utils/set-component-properties-from-observed-attributes';
import {setupComponentPropertiesForAutoUpdate} from './utils/setup-component-properties-for-auto-update';
import {extractExecutableSnippetFromString} from './utils/extract-executable-snippet-from-string';
import {turnCamelToKebabCasing} from './utils/turn-camel-to-kebab-casing';
import {turnKebabToCamelCasing} from './utils/turn-kebab-to-camel-casing';
import {getStyleString} from './utils/get-style-string';
import {getComponentNodeEventListener} from './utils/get-component-node-event-listener';
import {evaluateStringInComponentContext} from './utils/evaluate-string-in-component-context';
import {ShadowRootModeExtended} from "./enums/ShadowRootModeExtended.enum";
import booleanAttr from './utils/boolean-attributes.json';

/**
 * a extension on the native web component API to simplify and automate most of the pain points
 * when it comes to creating and working with web components on the browser
 */
export class WebComponent extends HTMLElement {
	private readonly _root: WebComponent | ShadowRoot;
	private _trackers: track[] = [];
	private _mounted = false;
	private _parsed = false;
	private _context: ObjectLiteral = {};
	private _contextSource: WebComponent | null = null;
	private _contextSubscribers: Array<ObserverCallback> = [];
	private _unsubscribeCtx: () => void = () => {
	};
	private _customAttrs = ['#if', '#repeat', '#ref', '#attr'];
	private _refs: Refs = {};

	constructor() {
		super();

		this._root = this;

		// @ts-ignore
		let {name, mode, observedAttributes, delegatesFocus} = this.constructor;


		if (!/open|closed|none/.test(mode)) {
			throw new Error(`${name}: Invalid mode "${mode}". Must be one of ["open", "closed", "none"].`)
		}

		if (mode !== 'none') {
			this._root = this.attachShadow({mode, delegatesFocus});
		}

		if (!Array.isArray(observedAttributes) || observedAttributes.some(a => typeof a !== 'string')) {
			throw new Error(`${name}: "observedAttributes" must be an array of attribute strings.`)
		}

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
	 * https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#using_the_lifecycle_callbacks
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

	get refs(): Refs {
		return this._refs;
	}

	updateContext(ctx: ObjectLiteral) {
		this._context = {...this._context, ...ctx};

		if (this.mounted) {
			this.forceUpdate();
			this._contextSubscribers.forEach(cb => cb(this._context));
		}
	}

	connectedCallback() {
		this._contextSource = this._getClosestWebComponentAncestor();

		if (this._contextSource) {
			// force update the component if the ancestor context gets updated as well
			this._unsubscribeCtx = this._contextSource.$context.subscribe((newContext: ObjectLiteral) => {
				this.forceUpdate();

				if (this.mounted) {
					this.onUpdate('$context', this._context, newContext)
				}
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
				} else if (!document.head.querySelector(`style#${(this.constructor as WebComponentConstructor).tagName}`)) {
					document.head.insertAdjacentHTML('beforeend', style);
				}
			}

			this._parsed = true;

			this._root.appendChild(contentNode);
		}

		this._mounted = true;
		this.onMount();
	}

	/**
	 * livecycle callback for when the element is attached to the DOM
	 */
	onMount() {
	}

	disconnectedCallback() {
		this._contextSource = null;
		this._mounted = false;
		this._unsubscribeCtx();
		this.onDestroy();
	}

	/**
	 * livecycle callback for when the element is removed from the DOM
	 */
	onDestroy() {
	}

	attributeChangedCallback(name: string, oldValue: any, newValue: any) {
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
		this._trackers.forEach((track: track) => this._updateTrackValue(track));
	}

	adoptedCallback() {
		this.onAdoption();
	}

	/**
	 * livecycle callback for when element is moved into a new document
	 */
	onAdoption() {
	}

	private _render(node: Node | HTMLElement | DocumentFragment | WebComponent) {
		if (node.nodeName === '#text') {
			this._trackNode(node as Node, 'nodeValue');
		} else if (node.nodeType === 1) {
			const handlers = [];
			const customAttrs = [];

			for (let customAttr of this._customAttrs) {
				if (node.hasOwnProperty(customAttr)) {
					customAttrs.push(customAttr);
				}
			}

			// @ts-ignore
			for (let attribute of node.attributes) {
				if (attribute.name.startsWith('on')) {
					const eventName = attribute.name.slice(2).toLowerCase().replace(/^on/, '');
					handlers.push({
						eventName,
						attribute: attribute.name,
						handler: getComponentNodeEventListener(this, attribute.name, attribute.value)
					});
				} else {
					this._trackNode(node, attribute.name, customAttrs, true);
				}
			}

			handlers.forEach(({eventName, handler, attribute}) => {
				(node as HTMLElement).removeAttribute(attribute);
				node.addEventListener(eventName, handler)
			})

		}

		node.childNodes.forEach(node => this._render(node));
	}

	private _trackNode(node: HTMLElement | Node, property: string, customAttrs: Array<string> = [], isAttribute = false) {
		let value = isAttribute
			? (node as HTMLElement).getAttribute(property)
			: (node as any)[property]

		const executables = extractExecutableSnippetFromString(value);

		if (executables.length) {
			const track: track = {
				node,
				property,
				isAttribute,
				value,
				executables,
				customAttrs
			};

			this._trackers.push(track);

			this._updateTrackValue(track);
		}
	}

	private _updateTrackValue(track: track) {
		const {node, value, property, isAttribute, executables, customAttrs} = track;

		for (let customAttr of customAttrs) {
			const resNode = this._handleCustomAttr(node as WebComponent, customAttr);

			if (!resNode) {
				return;
			}
		}

		let newValue = value;

		executables.forEach(({match, executable}) => {
			const keys = Object.getOwnPropertyNames(this).filter(n => !n.startsWith('_'));
			keys.push('$context');
			let res = evaluateStringInComponentContext(executable, this, keys);

			if (res && typeof res === 'object') {
				try {
					res = JSON.stringify(res)
				} catch (e) {
				}
			}

			newValue = newValue.replace(match, res);
		});

		if (isAttribute) {
			(node as HTMLElement).setAttribute(property, newValue);
		} else {
			try {
				newValue = JSON.parse(newValue)
			} catch (e) {
			}

			(node as any)[property] = newValue;
		}
	}

	private _getClosestWebComponentAncestor(): WebComponent | null {
		let parent = this.parentNode;

		if (parent instanceof ShadowRoot) {
			parent = parent.host;
		}

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

	private _handleCustomAttr(node: HTMLElement | WebComponent, attr: string) {
		switch (attr) {
			case '#ref':
				const {value: name} = Reflect.get(node, attr);

				if (/^[a-z$_][a-z0-9$_]*$/i.test(name)) {
					Object.defineProperty(this.refs, name, {
						get() {
							return node;
						}
					})
					return node;
				}

				throw new Error(`Invalid #ref property name "${name}"`)
			default:
				return node;
		}
	}
}

// @ts-ignore
if (window) {
	// @ts-ignore
	window.WebComponent = WebComponent;
}
