---
name: css Utility
order: 6.2
layout: document
title: css Utility - WebComponent by Before Semicolon
description: Use the css tagged template literal to build highly reactive and dynamic component styles.
---

## css Utility

For stylesheets that need to change dynamically in response to state or property updates, WebComponent provides the `css` tagged template literal. This utility lets you inject reactive functions and Markup helpers directly into your CSS code.

### How it Works

The `css` tag returns an instance of the `CSSStyle` class. Under the hood, any function interpolated inside the template literal is automatically wrapped in a Markup `effect`.

When any reactive prop or state getter is called inside these functions, it registers as a dependency. Whenever those dependencies change, the effect re-runs, and WebComponent updates the component's adopted stylesheets dynamically without recreating the stylesheet element.

### Practical Example

In the following example, the background and text color of the badge change reactively based on the value of the `status` prop.

```javascript
import { WebComponent, html, css } from '@beforesemicolon/web-component'

class StatusBadge extends WebComponent {
    static observedAttributes = ['status']
    status = 'info'

    stylesheet = css`
        :host {
            display: inline-block;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.875rem;
            font-weight: bold;

            /* Reactive styles */
            background-color: ${() =>
                this.props.status() === 'success' ? '#d4edda' : '#e2e3e5'};
            color: ${() =>
                this.props.status() === 'success' ? '#155724' : '#383d41'};
        }
    `

    render() {
        return html`<slot></slot>`
    }
}

customElements.define('status-badge', StatusBadge)
```

### Using Markup Helpers (`when` & `is`)

To make dynamic styling cleaner, you can use `@beforesemicolon/markup`'s reactive helpers like `when()` and `is()` directly inside your style strings. They return reactive functions that resolve values dynamically.

-   `is(getter, expectedValue)`: Checks if a getter returns a matching value.
-   `when(condition, thenValue, otherwiseValue)`: Evaluates a condition (can be a getter or a function) and returns the corresponding value.

Here is the same example using these helpers:

```javascript
import {
    WebComponent,
    html,
    css,
    when,
    is,
} from '@beforesemicolon/web-component'

class StatusBadge extends WebComponent {
    static observedAttributes = ['status']
    status = 'info'

    stylesheet = css`
        :host {
            display: inline-block;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;

            /* Using when & is helpers */
            background-color: ${when(
                is(this.props.status, 'success'),
                '#d4edda',
                '#e2e3e5'
            )};
            color: ${when(
                is(this.props.status, 'success'),
                '#155724',
                '#383d41'
            )};
        }
    `

    render() {
        return html`<slot></slot>`
    }
}
```

### The `CSSStyle` Class

The `css` function parses the strings and values into a `CSSStyle` instance. The class has the following public API:

-   **`toString()`**: Evaluates and returns the stylesheet as a plain CSS string.
-   **`onUpdate(callback)`**: Registers a callback function that is invoked with the updated CSS string whenever any interpolated reactive values change.

```javascript
import { css } from '@beforesemicolon/web-component'

const themeColor = state('blue')

const style = css`
    button {
        background-color: ${() => themeColor[0]()};
    }
`

style.onUpdate((newCss) => {
    console.log('CSS updated:', newCss)
})
```

WebComponent hooks into the `onUpdate` method automatically, meaning you rarely need to call `onUpdate` manually in your application.
