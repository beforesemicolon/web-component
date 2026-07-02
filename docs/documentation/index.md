---
name: What is WebComponent?
order: 1
title: What is WebComponent? - WebComponent by Before Semicolon
description: WebComponent is a reactive layer on top of native Web Components API, powered by Markup. It adds state, props, scoped styles, and lifecycles.
layout: document
---

## What is WebComponent?

`@beforesemicolon/web-component` is a lightweight, compiler-free reactive layer built on top of the native Web Components API. It is powered by the [@beforesemicolon/markup](https://markup.beforesemicolon.com) template engine to bring reactivity, state management, and scoped styling to standard Custom Elements.

By design, the native Web Components APIs are low-level and verbose. Writing raw custom elements often results in redundant boilerplate for DOM manipulation, attribute tracking, event handling, and manual UI updates. The `WebComponent` base class simplifies this process, letting you build self-contained, reactive components using standard browser APIs.

### Key Enhancements

WebComponent wraps native custom elements with several major enhancements:

-   **State Management**: Reactive internal state that triggers targeted DOM updates when mutated via `setState`.
-   **Props Management**: Maps observed attributes directly to reactive properties, handling automatic camelCase conversion and deserialization.
-   **Component Styling**: First-class support for `CSSStyleSheet` objects, CSS import assertions, and reactive stylesheets via the `css` tagged template.
-   **Form Integration**: Out-of-the-box support for form-associated custom elements, exposing standard form verification and value setting APIs.
-   **Lifecycles**: Predictable wrappers around native element connection callbacks, supporting cleanup function returns.
-   **Template Refs**: Easily reference and query rendered DOM elements without using verbose `querySelector` or `shadowRoot` calls.
-   **Error Handling**: A centralized `onError` hook to catch and process runtime rendering or lifecycle errors.
-   **Event Dispatching**: A clean `dispatch` helper to fire standard `CustomEvent` instances with typed detail payloads.

### Start Here

-   [Get Started](./get-started.md)
-   [Guide & Best Practices](./guide.md)
-   [AI Guide](./ai.md)
-   [Creating Components](./fundamentals/creating-components.md)

### Full Example

Here is a complete reactive counter component implemented in TypeScript, showcasing props, state, event dispatching, stylesheets, and template rendering:

```typescript
// import everything from Markup as if you are using it directly
import { WebComponent, html } from '@beforesemicolon/web-component'
import stylesheet from './counter-app.css' with { type: 'css' }

interface Props {
    label: string
}

interface State {
    count: number
}

class CounterApp extends WebComponent<Props, State> {
    static observedAttributes = ['label']
    label = '+' // defined props default value
    initialState = {
        // declare initial state
        count: 0,
    }
    stylesheet = stylesheet

    countUp = (e: Event) => {
        e.stopPropagation()
        e.preventDefault()

        this.setState(({ count }) => ({ count: count + 1 }))
        this.dispatch('click')
    }

    render() {
        return html`
            <p>${this.state.count}</p>
            <button type="button" onclick="${this.countUp}">
                ${this.props.label}
            </button>
        `
    }
}

customElements.define('counter-app', CounterApp)
```

In your HTML you can simply use the tag normally.

```html
<counter-app label="count up"></counter-app>
```
