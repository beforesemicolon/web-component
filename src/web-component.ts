import {parse} from './utils/parse';
import {createClasses} from './utils/create-classes';
import {setComponentPropertiesFromObservedAttributes} from './utils/set-component-properties-from-observed-attributes';
import {setupComponentPropertiesForAutoUpdate} from './utils/setup-component-properties-for-auto-update';
import {extractExecutableSnippetFromString} from './utils/extract-executable-snippet-from-string';
import {turnCamelToKebabCasing} from './utils/turn-camel-to-kebab-casing';
import {turnKebabToCamelCasing} from './utils/turn-kebab-to-camel-casing';
import {getStyleString} from './utils/get-style-string';
import {getComponentNodeEventListener} from './utils/get-component-node-event-listener';
import {bindData} from './utils/bind-data';
import booleanAttr from './utils/boolean-attributes.json';

/**
 * a extension on the native web component API to simplify and automate most of the pain points
 * when it comes to creating and working with web components on the browser
 */
export class WebComponent extends HTMLElement {
  private _trackers: trackerMap = Object.create(null);
  private _mounted = false;
  private readonly _classes;
  private readonly _root: WebComponent | ShadowRoot;

  constructor() {
    super();

    this._root = this;
    this._classes = createClasses(this);

    // @ts-ignore
    let {name, mode, observedAttributes, delegatesFocus} = (this.constructor as any);


    if (!/open|closed|none/.test(mode)) {
      throw new Error(`${name}: Invalid mode "${mode}". Must be one of ["open", "closed", "none"].\n\nLearn more => https://web-component.beforesemicolon.com/docs/mode\n`)
    }

    if (mode !== 'none') {
      this._root = this.attachShadow({mode, delegatesFocus});
    }

    if (!Array.isArray(observedAttributes) || observedAttributes.some(a => typeof a !== 'string')) {
      throw new Error(`${name}: "observedAttributes" must be an array of attribute strings.\n\nLearn more => https://web-component.beforesemicolon.com/docs/observedAttributes\n`)
    }

    setComponentPropertiesFromObservedAttributes(this, observedAttributes,
        (prop, oldValue, newValue) => {
          this._trackers[prop].forEach((track: track) => this._updateTrackValue(track))
          this.onUpdate(prop, oldValue, newValue);
        },
        (prop) => {
          this._trackers[prop] = [];
        });
  }

  /**
   * an array of attribute names as they will look in the html tag
   * https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#using_the_lifecycle_callbacks
   * @type {[]}
   */
  static observedAttributes = [];

  /**
   * shadow root mode
   * https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot/mode
   * plus an additional option of "none" to signal you dont want
   * the content to be places inside the shadow root but directly under the tag
   * @type {string}
   */
  static mode = 'open'; // open | closed | none

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
   * the root element. If shadow root present it will be the shadow root otherwise
   * the actual element
   * @returns {*}
   */
  get root() {
    return this._root;
  }

  /**
   * whether or not the element is attached to the DOM and works differently than Element.isConnected
   * @returns {boolean}
   */
  get mounted() {
    return this._mounted;
  }

  /**
   * read-write object which keys are individual class names with boolean values
   * indicating if they are present or not
   * @returns {*}
   */
  get classes() {
    return this._classes;
  }

  /**
   * style for the component whether inside the style tag, as object or straight CSS string
   * @returns {string | {type: string, content: string}}
   */
  get stylesheet() {
    return '<style></style>';
  }

  /**
   * template for the element HTML content
   * @returns {string}
   */
  get template() {
    return '';
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

    customElements.define(tagName, this);
  }

  connectedCallback() {
    this._mounted = true;

    setupComponentPropertiesForAutoUpdate(this, this._trackers, (prop, oldValue, newValue) => {
      this._trackers[prop].forEach(track => this._updateTrackValue(track))
      this.onUpdate(prop, oldValue, newValue);
    })

    let contentNode;

    contentNode = parse(this.template);

    this._render(contentNode);

    const hasShadowRoot = ((this.constructor as any) as any).mode !== 'none';

    const style = getStyleString(this.stylesheet, (this.constructor as any).tagName, hasShadowRoot);

    if (hasShadowRoot) {
      this.root.innerHTML = style;
    } else if (!document.head.querySelector(`style#${(this.constructor as any).tagName}`)) {
      document.head.insertAdjacentHTML('beforeend', style);
    }

    this.root.appendChild(contentNode);

    this.onMount();
  }

  /**
   * livecycle callback for when the element is attached to the DOM
   */
  onMount() {
  }

  disconnectedCallback() {
    this._mounted = false;
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
    }
  }

  /**
   * livecycle callback for when the element attributes or class properties are updated
   */
  onUpdate(name: string, oldValue: unknown, newValue: unknown) {
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
          this._trackNode(node, attribute.name, true);
        }
      }

      handlers.forEach(({eventName, handler, attribute}) => {
        (node as HTMLElement).removeAttribute(attribute);
        node.addEventListener(eventName, handler)
      })

    }

    node.childNodes.forEach(node => this._render(node));
  }

  private _updateTrackValue(track: track) {
    const {node, value, property, isAttribute, match, executable} = track;

    const newValue = value.replace(match, bindData(this, executable));

    if (isAttribute) {
      (node as HTMLElement).setAttribute(property, newValue);
    } else {
      (node as any)[property] = newValue;
    }
  }

  private _trackNode(node: HTMLElement | Node, property: string, isAttribute = false) {
    let value = isAttribute
        ? (node as HTMLElement).getAttribute(property)
        : (node as any)[property]

    extractExecutableSnippetFromString(value.trim())
        .map(exec => {
          return {...exec, properties: exec.match.match(/(?<={|\s)(([a-z$])[a-z$_]+)(?=\[|\.|\s|})/ig)};
        })
        .forEach(({properties, ...exec}) => {
          properties?.forEach(prop => {
            const track: track = {
              node,
              property,
              isAttribute,
              value,
              ...exec
            };

            if (Array.isArray(this._trackers[prop])) {
              this._trackers[prop].push(track);
            }

            this._updateTrackValue(track);
          });
        });
  }
}

// @ts-ignore
window.WebComponent = WebComponent;