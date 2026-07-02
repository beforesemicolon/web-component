---
name: Config
order: 4.3
title: Config - WebComponent by Before Semicolon
description: Configure Shadow DOM shadow root options on your components.
layout: document
---

## Config

By default, `@beforesemicolon/web-component` creates an encapsulated Shadow DOM for each component. You can customize the Shadow DOM configuration or completely opt out of it using the `config` class property.

### Default Configuration

If you do not define a custom `config` property, the component defaults to the following settings:

```javascript
class MyComponent extends WebComponent {
    config = {
        shadow: true,
        mode: 'open',
        delegatesFocus: false,
        clonable: false,
        serializable: false,
        slotAssignment: 'named',
    }
}
```

### Disabling Shadow DOM

In some scenarios, you might want a component to render directly into the Light DOM (e.g. to inherit all global CSS stylesheets easily or to construct headless components). You can do this by setting `shadow: false` on the `config` object.

```javascript
import { WebComponent, html } from '@beforesemicolon/web-component'

class LightDomElement extends WebComponent {
    config = {
        shadow: false,
    }

    render() {
        return html` <p>I am rendered directly in the light DOM!</p> `
    }
}

customElements.define('light-dom-element', LightDomElement)
```

> [!NOTE]
> When `shadow: false` is configured, `this.contentRoot` will reference the component element itself rather than a `ShadowRoot`. Dynamic stylesheets defined via the `stylesheet` property will not be scoped and may apply globally.

---

### Shadow DOM Configuration Options

When `shadow` is set to `true`, the rest of the configuration properties are passed directly to the native `Element.attachShadow()` method.

| Option           | Type                  | Default   | Description                                                                                                                                                         |
| :--------------- | :-------------------- | :-------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `shadow`         | `boolean`             | `true`    | Enables or disables Shadow DOM rendering.                                                                                                                           |
| `mode`           | `'open' \| 'closed'`  | `'open'`  | Defines accessibility to the shadow root from outside JavaScript. If `'open'`, the shadow root is accessible via `element.shadowRoot`.                              |
| `delegatesFocus` | `boolean`             | `false`   | When set to `true`, clicking a non-focusable part of the shadow DOM delegates focus to the first focusable element inside the shadow root.                          |
| `clonable`       | `boolean`             | `false`   | If set to `true`, the shadow root can be cloned using `cloneNode()` (supported in newer specifications).                                                            |
| `serializable`   | `boolean`             | `false`   | If set to `true`, the shadow root will be serialized when using APIs like `getHTML()` for Declarative Shadow DOM.                                                   |
| `slotAssignment` | `'named' \| 'manual'` | `'named'` | Controls how nodes are assigned to slots. `'named'` assigns elements automatically based on their slot attribute. `'manual'` requires programmatic node assignment. |

#### Example: Focus Delegation & Closed Shadow Root

Here is an example of configuring a closed shadow root with focus delegation enabled:

```javascript
import { WebComponent, html } from '@beforesemicolon/web-component'

class FocusInput extends WebComponent {
    config = {
        shadow: true,
        mode: 'closed',
        delegatesFocus: true,
    }

    render() {
        return html`
            <div class="wrapper">
                <label for="input">Enter text:</label>
                <input id="input" type="text" />
            </div>
        `
    }
}

customElements.define('focus-input', FocusInput)
```
