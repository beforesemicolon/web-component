// simply importing directive here will automatically register them and make them available for
// anything later on
import './directives';
import booleanAttr from './utils/boolean-attributes.json';
import {$} from "./metadata";
import {parse} from './utils/parse';
import {setComponentPropertiesFromObservedAttributes} from './utils/set-component-properties-from-observed-attributes';
import {setupComponentPropertiesForAutoUpdate} from './utils/setup-component-properties-for-auto-update';
import {turnCamelToKebabCasing} from './utils/turn-camel-to-kebab-casing';
import {turnKebabToCamelCasing} from './utils/turn-kebab-to-camel-casing';
import {getStyleString} from './utils/get-style-string';
import {ShadowRootModeExtended} from "./enums/ShadowRootModeExtended.enum";
import {trackNode} from "./utils/track-node";
import {jsonParse} from "./utils/json-parse";
import {deepUpdateNode} from "./utils/deep-update-node";

/**
 * a extension on the native web component API to simplify and automate most of the pain points
 * when it comes to creating and working with web components on the browser
 */
export class WebComponent extends HTMLElement {
	readonly $refs: Refs = {};
	$properties: Array<string> = ['$context', '$refs'];
	templateId = '';
	_childNodes: Array<Node> = [];

	constructor() {
		super();

		$.set(this, {
			root: this,
			mounted: false,
			parsed: false,
			context: {},
			contextSource: null,
			contextSubscribers: [],
			unsubscribeCtx: () => {
			},
		} as WebComponentMetadata);

		// @ts-ignore
		let {mode, observedAttributes, delegatesFocus, initialContext} = this.constructor;

		if (mode !== 'none') {
			$.get(this).root = this.attachShadow({mode, delegatesFocus});
		}

		$.get(this).context = initialContext;

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
	 * parses special template HTML string taking in consideration
	 * all the additional syntax specific to this framework
	 */
	static parseHTML(markup: string): DocumentFragment {
		return parse(markup)
	}

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
		return customElements.get(this.tagName) !== undefined;
	}

	/**
	 * whether or not the component should use the real slot element or mimic its behavior
	 * when rendering template
	 */
	get customSlot() {
		return false;
	}

	/**
	 * the root element. If shadow root present it will be the shadow root otherwise
	 * the actual element
	 * @returns {*}
	 */
	get root(): HTMLElement | ShadowRoot | null {
		return (this.constructor as WebComponentConstructor).mode === 'closed' ? null : $.get(this).root;
	}

	/**
	 * whether or not the element is attached to the DOM and works differently than Element.isConnected
	 * @returns {boolean}
	 */
	get mounted() {
		return $.get(this).mounted;
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
		return Object.setPrototypeOf({...$.get(this).contextSource?.$context, ...$.get(this).context}, {
			subscribe: ctxSubscriberHandler($.get(this).contextSubscribers),
		});
	}

	get parsed() {
		return $.get(this).parsed;
	}

	updateContext(ctx: ObjectLiteral) {
		$.get(this).context = {...$.get(this).context, ...ctx};

		if (this.mounted) {
			this.forceUpdate();
			$.get(this).contextSubscribers.forEach((cb: (ctx: {}) => void) => cb($.get(this).context));
		}
	}

	connectedCallback() {
		const {parsed} = $.get(this);
		try {
			// @ts-ignore
			$.get(this).contextSource = getClosestWebComponentAncestor(this);

			if ($.get(this).contextSource) {
				// force update the component if the ancestor context gets updated as well
				$.get(this).unsubscribeCtx = $.get(this).contextSource.$context.subscribe((newContext: ObjectLiteral) => {
					this.forceUpdate();

					if (this.mounted) {
						this.onUpdate('$context', $.get(this).context, newContext)
					}

					$.get(this).contextSubscribers.forEach((cb: (ctx: {}) => void) => cb(newContext));
				})
			}

			/*
			only need to parse the element the very first time it gets mounted

			this will make sure that if the element is removed from the dom and mounted again
			all that needs to be done if update the DOM to grab the possible new context and updated data
			 */
			if (parsed) {
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
				let temp: string = this.template;

				if (!temp && this.templateId) {
					const t = document.getElementById(this.templateId);

					temp = t?.nodeName === 'TEMPLATE' ? t.innerHTML : temp;
				}

				contentNode = parse(style + temp);

				this._childNodes = Array.from(this.childNodes);

				if (this.customSlot) {
					this.innerHTML = '';
				}

				trackNode(contentNode, this, {
					customSlot: this.customSlot,
					customSlotChildNodes: this.customSlot ? this._childNodes : []
				});

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

				$.get(this).parsed = true;
				$.get(this).root.appendChild(contentNode);
			}

			$.get(this).mounted = true;
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
			$.get(this).contextSource = null;
			$.get(this).mounted = false;
			$.get(this).unsubscribeCtx();
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

				// @ts-ignore
				this[prop] = booleanAttr.hasOwnProperty(prop)
					? this.hasAttribute(name)
					: jsonParse(newValue);
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
		(this.root || this).childNodes.forEach(n => deepUpdateNode(n, this))
		return true;
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
}

function ctxSubscriberHandler(subs: Array<ObserverCallback>) {
	return (cb: ObserverCallback) => {
		subs.push(cb);
		return () => {
			subs = subs.filter((c: ObserverCallback) => c !== cb);
		}
	}
}

function getClosestWebComponentAncestor(component: WebComponent): WebComponent | null {
	let parent = component.parentNode;

	while (parent && !(parent instanceof WebComponent)) {
		parent = parent instanceof ShadowRoot ? parent.host : parent.parentNode;
	}

	return parent instanceof WebComponent ? parent : null;
}

