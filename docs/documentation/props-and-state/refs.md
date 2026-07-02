---
name: Refs
order: 5.3
layout: document
title: Refs - WebComponent by Before Semicolon
description: Safely reference and interact with rendered DOM elements inside your templates.
---

## Refs

While declarative programming is preferred, there are times when you need to access DOM elements directly to perform imperative operations (e.g., focusing an input, playing a video, initializing third-party libraries, or measuring element dimensions). WebComponent integrates Markup's `ref` system to let you reference elements easily.

### Binding Refs in Templates

To bind a DOM element, add a `ref` attribute with a unique name to any element in your template.

```javascript
import { WebComponent, html } from '@beforesemicolon/web-component'

class FocusInput extends WebComponent {
    render() {
        return html`
            <div>
                <input type="text" ref="textInput" placeholder="Type here..." />
                <button onclick="${this.focusInput}">Focus Input</button>
            </div>
        `
    }

    focusInput = () => {
        // We will access the element here
    }
}
```

### Accessing Refs via `this.refs`

You can access all bound elements using the `this.refs` getter.

Since multiple elements can share the same ref name, each key in `this.refs` returns an **array** of elements matching that ref name. If there is only one element with that ref, it will still be returned inside an array (e.g., as the first element: `this.refs.textInput[0]`).

```javascript
focusInput = () => {
    const inputElement = this.refs.textInput?.[0]
    if (inputElement) {
        inputElement.focus()
    }
}
```

### Refs and Lifecycle

References are only populated after the component is rendered and mounted. They are not available inside the `constructor`.

If you need to perform imperative operations immediately when the element appears, use the `onMount` lifecycle hook.

```javascript
import { WebComponent, html } from '@beforesemicolon/web-component'

class AutoFocusInput extends WebComponent {
    render() {
        return html` <input type="text" ref="username" /> `
    }

    onMount() {
        // Element is now in the DOM, safe to access refs
        const input = this.refs.username?.[0]
        if (input) {
            input.focus()
        }
    }
}
```

### Multiple Elements / Dynamic Refs

You can use the same ref name on multiple elements to group them. WebComponent will return all rendered elements sharing that ref name in the order they appear.

```javascript
import { WebComponent, html } from '@beforesemicolon/web-component'

class ListSelector extends WebComponent {
    render() {
        return html`
            <ul>
                <li ref="item">Item A</li>
                <li ref="item">Item B</li>
                <li ref="item">Item C</li>
            </ul>
            <button onclick="${this.logItems}">Log Items</button>
        `
    }

    logItems = () => {
        const items = this.refs.item ?? []
        items.forEach((li, index) => {
            console.log(`Element ${index}:`, li.textContent)
        })
    }
}
```

Refs are dynamic. If elements are conditionally rendered (e.g., using helper functions like `when`), they will be added to or removed from the `this.refs` arrays accordingly. Always check if the ref array and its elements exist before accessing them.
