import {parse} from './utils/parse';
import {setComponentPropertiesFromObservedAttributes} from './utils/set-component-properties-from-observed-attributes';
import {setupComponentPropertiesForAutoUpdate} from './utils/setup-component-properties-for-auto-update';
import {turnCamelToKebabCasing} from './utils/turn-camel-to-kebab-casing';
import {turnKebabToCamelCasing} from './utils/turn-kebab-to-camel-casing';
import {getStyleString} from './utils/get-style-string';
import {ShadowRootModeExtended} from "./enums/ShadowRootModeExtended.enum";
import {NodeTrack} from './node-track';
import booleanAttr from './utils/boolean-attributes.json';
import metadata from "./metadata";
// simply importing directive here will automatically register them and make them available for
// anything later on
import './directives';

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
	$properties: Array<string> = ['$context', '$refs'];

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
			subscribe: ctxSubscriberHandler(this.#contextSubscribers),
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
			// @ts-ignore
			this.#contextSource = getClosestWebComponentAncestor(this);

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
					newValue = this.hasAttribute(name);
				} else if (typeof newValue === 'string') {
					try {
						newValue = JSON.parse(newValue.replace(/['`]/g, '"'));
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

	protected _render(node: Node | HTMLElement | DocumentFragment | WebComponent) {
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
			const track = new NodeTrack(node, this as WebComponent);
			if (!track.empty) {
				this.#trackers.set(node, track);
				track.updateNode();
			}
		}

<<<<<<< Updated upstream
		if (isCommentNode || isTextNode || !node.childNodes.length || isRepeatedNode || isTextArea || isScript || isStyle) {
			return;
=======
	private _execString(executable: string, nodeData: ObjectLiteral) {
		try {
			if (!executable.trim()) {
				return;
			}

			const {$item, $key} = nodeData;
			const keys = this._properties.slice();
			const ctx = this.$context;

			Object.getOwnPropertyNames(ctx).forEach(n => {
				keys.push(n);
			})

			const values = keys.map(key => {
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

			return evaluateStringInComponentContext(executable, this, keys, values);
		} catch(e) {
			this.onError(e as Error)
		}
	}

	private _resolveExecutable(node: Node, {match, executable}: Executable, newValue: string) {
		let {$item, $key} = node as ObjectLiteral;

		if (/(?:^|\W)\$(index|key|item)(?:$|\W)/.test(executable) && $item === undefined) {
			let parent: any = node.parentNode;

			while (parent && !(parent instanceof ShadowRoot) && parent !== this) {
				if (parent['$item'] !== undefined) {
					$item = parent['$item'];
					$key = parent['$key'];
					break;
				}

				parent = parent.parentNode;
			}
		}

		let res = this._execString(executable, {$item, $key});

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

					if (newValue !== (node as ObjectLiteral)[property.name]) {
						(node as ObjectLiteral)[property.name] = newValue;
					}
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
								newValue = JSON.parse(newValue.replace(/['`]/g, '"'));
							} catch (e) {
							}

							if (newValue !== (node as ObjectLiteral)[camelName]) {
								(node as ObjectLiteral)[camelName] = newValue;
							}
						} else if ((node as HTMLElement).getAttribute(name) !== newValue) {
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
>>>>>>> Stashed changes
		}

		node.childNodes.forEach(child => this._render(child));
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
		if (parent instanceof ShadowRoot) {
			parent = parent.host;
		} else {
			parent = parent.parentNode;
		}
	}

	return parent instanceof WebComponent ? parent : null;
}

