---
name: Rendering
order: 4.2
title: Rendering - WebComponent by Before Semicolon
description: Learn about the render() method and how content slots work.
layout: document
---

## Rendering

The primary way to define a component's visual interface is by implementing the `render()` method. This method is called once during the component's initialization. The returned content is rendered into the component's `contentRoot` (which is either the shadow root or the element itself if shadow DOM is disabled).

### The render() Method

The `render()` method has the following signature:

```typescript
render(): HtmlTemplate | string | Node | void
```

#### Supported Return Types

1. **`HtmlTemplate`**: The recommended return type. Built using the `html` tagged template from `@beforesemicolon/web-component`. It compiles into highly efficient DOM updates that only refresh the specific dynamic values in your template.

    ```javascript
    import { WebComponent, html } from '@beforesemicolon/web-component'

    class SimpleCard extends WebComponent {
        render() {
            return html`
                <div class="card">
                    <h2>Card Title</h2>
                    <p>Card content goes here.</p>
                </div>
            `
        }
    }
    ```

2. **`string`**: A raw HTML string can be returned. Note that returning raw strings does not benefit from the surgical reactive updates provided by `HtmlTemplate`.

    ```javascript
    class StringElement extends WebComponent {
        render() {
            return '<div>Raw HTML string content</div>'
        }
    }
    ```

3. **Native `Node`**: You can return standard DOM nodes created programmatically.

    ```javascript
    class DOMNodeElement extends WebComponent {
        render() {
            const div = document.createElement('div')
            div.textContent = 'Native DOM Node Content'
            return div
        }
    }
    ```

4. **`null` or `void`**: Headless or logic-only components that do not render any markup can return `null` or omit the return value.

    ```javascript
    class HeadlessTracker extends WebComponent {
        onMount() {
            console.log('Tracker active')
            // Perform background tasks...
        }

        render() {
            // Nothing is rendered
        }
    }
    ```

---

### Slot Projections

Web Components support content projection via the `<slot>` element, allowing users to pass markup down into your component. By default, `@beforesemicolon/web-component` supports both default slots and named slots.

#### Default Slots

An unnamed `<slot>` acts as the default catch-all container for any children passed inside your custom element.

**Component Definition:**

```javascript
import { WebComponent, html } from '@beforesemicolon/web-component'

class SimpleBox extends WebComponent {
    render() {
        return html`
            <div class="box">
                <slot></slot>
            </div>
        `
    }
}
customElements.define('simple-box', SimpleBox)
```

**Usage in HTML:**

```html
<simple-box>
    <p>This paragraph will render inside the box slot.</p>
</simple-box>
```

#### Named Slots

To project content into specific locations, use named slots. You specify the name using the `name` attribute on the `<slot>`, and match it using the `slot` attribute on the element to project.

**Component Definition:**

```javascript
class LayoutPanel extends WebComponent {
    render() {
        return html`
            <div class="panel">
                <header>
                    <slot name="header"></slot>
                </header>
                <main>
                    <slot></slot>
                    <!-- default slot -->
                </main>
                <footer>
                    <slot name="footer"></slot>
                </footer>
            </div>
        `
    }
}
customElements.define('layout-panel', LayoutPanel)
```

**Usage in HTML:**

```html
<layout-panel>
    <h1 slot="header">Panel Header</h1>
    <p>Main content goes to the default slot.</p>
    <p slot="footer">Panel Footer Information</p>
</layout-panel>
```
