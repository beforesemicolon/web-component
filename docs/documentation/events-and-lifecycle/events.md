---
name: Events
order: 7.1
title: Events - WebComponent by Before Semicolon
description: Learn how to dispatch and listen to custom events in WebComponent using the dispatch method.
layout: document
---

## Events

Custom elements often need to communicate changes or actions back to their parents or the rest of the application. `@beforesemicolon/web-component` provides a built-in helper method, `this.dispatch()`, to dispatch custom DOM events cleanly.

### Dispatching Custom Events

To dispatch a custom event from inside a component, use the `this.dispatch(name, detail)` method.

```typescript
dispatch(name: string, detail?: Record<string, unknown>): void
```

This method is a convenient wrapper around the native `dispatchEvent` API. It instantiates a standard `CustomEvent` and passes the second argument as `event.detail`.

Here is a practical example of a counter component that dispatches an event whenever the count changes:

```javascript
import { WebComponent, html } from '@beforesemicolon/web-component'

class CounterButton extends WebComponent {
    initialState = { count: 0 }

    increment = () => {
        const nextCount = this.state.count() + 1
        this.setState({ count: nextCount })

        // Dispatch the custom event with the payload
        this.dispatch('countchange', { count: nextCount })
    }

    render() {
        return html`
            <button type="button" onclick="${this.increment}">
                Increment (${() => this.state.count()})
            </button>
        `
    }
}

customElements.define('counter-button', CounterButton)
```

### Passing Payloads

The second parameter to `this.dispatch` is an optional `detail` object containing any custom data. In the receiving event listener, this payload is available via `event.detail`.

```javascript
// Inside your component
this.dispatch('submit', {
    userId: 'usr_123',
    timestamp: Date.now(),
})
```

### Listening to Custom Events

Since components are native custom elements, you can listen to these events using standard web APIs or directly inside Markup templates.

#### In Markup Templates

Markup templates support binding event listeners for any standard or custom event by prefixing the event name with `on`.

For example, if your custom element is named `<counter-button>` and dispatches a `countchange` event, you can listen to it in a template like this:

```javascript
import { html } from '@beforesemicolon/web-component'

const handleCountChange = (event) => {
    console.log('New count received:', event.detail.count)
}

const template = html`
    <div>
        <h3>My Application</h3>
        <counter-button oncountchange="${handleCountChange}"></counter-button>
    </div>
`
```

#### Using Native Event Listeners

You can also interact with the component imperatively in standard JavaScript using the native `addEventListener` method:

```javascript
const element = document.querySelector('counter-button')

element.addEventListener('countchange', (event) => {
    console.log('Count updated imperatively:', event.detail.count)
})
```

### Event Boundary Notes

`this.dispatch()` intentionally keeps a small API:

```javascript
this.dispatch('countchange', { count: nextCount })
```

If you need custom event options such as `bubbles`, `composed`, or `cancelable`, use the native API directly:

```javascript
this.dispatchEvent(
    new CustomEvent('countchange', {
        detail: { count: nextCount },
        bubbles: true,
        composed: true,
    })
)
```
