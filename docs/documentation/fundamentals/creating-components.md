---
name: Creating Components
order: 4.1
title: Creating Components - WebComponent by Before Semicolon
description: Learn how to subclass WebComponent and register your custom elements.
layout: document
---

## Creating Components

To create a new custom element with `@beforesemicolon/web-component`, you subclass the `WebComponent` base class and register it with the browser using `customElements.define()`.

Here is a basic example of a component:

```javascript
import { WebComponent, html } from '@beforesemicolon/web-component'

class MyElement extends WebComponent {
    render() {
        return html`<p>Hello from MyElement!</p>`
    }
}

customElements.define('my-element', MyElement)
```

### Tag Naming Requirements

Custom element tag names must adhere to the standard HTML specification:

1. **Must contain at least one hyphen (`-`)**: This distinguishes custom elements from standard HTML elements. For example, `my-element`, `todo-list`, and `fancy-btn` are valid, whereas `myelement` or `button` are invalid.
2. **Must start with a lowercase ASCII letter** (e.g. `a-z`).
3. **Cannot contain uppercase letters**: Standard HTML parsers treat tag names as case-insensitive, so custom element tags are defined in all lowercase.

### Subclassing WebComponent

The `WebComponent` class inherits from the native `HTMLElement`. This means your component is a native custom element and has access to all standard DOM properties, methods, and lifecycle callbacks, while adding reactivity and convenience features.

### Reserved Properties

Because `WebComponent` and the native `HTMLElement` define essential properties and methods for lifecycle management, rendering, state, and styling, you **cannot** use these names as reactive component properties (props).

Below is the complete list of reserved property names that cannot be overridden or declared in `observedAttributes` for props mapping:

#### Base Configuration & Styling

-   `config`: Used to define Shadow DOM configuration.
-   `stylesheet`: Used to define scoped stylesheets (e.g., via `css` tagged templates).
-   `updateStylesheet(sheet)`: Method to dynamically update/replace the stylesheet.

#### Reactivity & Internal Refs

-   `props`: Object containing reactive prop getters.
-   `initialState`: Object containing initial values for internal state.
-   `state`: Object containing reactive state getters.
-   `setState(newState | callback)`: Method used to reactively update the internal state.
-   `refs`: Object containing references to elements marked with the `ref` attribute in the template.

#### DOM & Shadow Roots

-   `mounted`: Boolean getter indicating if the component is currently connected to the DOM.
-   `contentRoot`: Getter returning the render target (`ShadowRoot` or the element itself if shadow DOM is disabled).
-   `root`: Getter returning the ancestor shadow root or document of the element.
-   `internals`: Getter returning the `ElementInternals` instance (via `attachInternals()`), useful for form association and accessibility.
-   `render()`: Method that returns the HTML template or Node to be rendered.
-   `dispatch(name, detail)`: Method to fire custom DOM events easily.

#### Lifecycle Methods

-   `connectedCallback()`: Native element connection handler. Use `onMount()` instead for custom behavior.
-   `attributeChangedCallback(name, oldValue, newValue)`: Native attribute change handler. Use `onUpdate()` instead for custom behavior.
-   `disconnectedCallback()`: Native element disconnection handler. Use `onDestroy()` instead for custom behavior.
-   `adoptedCallback()`: Native adoption handler. Use `onAdoption()` instead for custom behavior.
-   `onError(error)`: Callback executed when errors occur within lifecycles or rendering.

#### Native HTMLElement Properties

-   `style`: Standard CSS declaration block.
-   `className`: Standard class name string.
-   `classList`: Standard class token list.

> [!WARNING]
> Attempting to define any of these reserved names as custom props or mapping them via `observedAttributes` will cause conflicts with the core runtime behavior and might break the component's reactivity or lifecycle.
