---
name: State
order: 5.2
layout: document
title: State - WebComponent by Before Semicolon
description: Manage reactive local component state using initialState and setState.
---

## State

State is the internal reactive data owned and managed exclusively by the component. Unlike props, state is not exposed or mapped to HTML attributes, and it is intended to store data that changes over the lifecycle of the component (e.g., UI toggle status, input values, API fetch results).

### Declaring Initial State

To define a component's internal state, assign an object to the `initialState` class property. Each key in this object will be initialized as a reactive state getter.

```javascript
import { WebComponent } from '@beforesemicolon/web-component'

class CounterElement extends WebComponent {
    initialState = {
        count: 0,
        label: 'Clicks',
    }
}
```

### Reading State in Templates

Like props, the properties of `this.state` are reactive getter functions. You can access the values inside your templates by passing the getter directly or by invoking it.

-   Pass the getter directly to let the template handle reactive bindings: `this.state.count`
-   Invoke it as a function when executing calculations or inside conditional blocks: `this.state.count()`

```javascript
import { WebComponent, html } from '@beforesemicolon/web-component'

class CounterElement extends WebComponent {
    initialState = {
        count: 0,
        label: 'Clicks',
    }

    render() {
        return html`
            <div>
                <span>${this.state.label}: ${this.state.count}</span>
            </div>
        `
    }
}
```

### Modifying State via `setState`

To update state reactively, call `this.setState()`. This method accepts either a partial state object or a callback function.

#### Object Merge Format

You can pass a partial object containing the fields you want to update. WebComponent will merge the updates into the state automatically, so you do not need to manually spread the rest of the state.

```javascript
// Updates only the count; label remains untouched
this.setState({ count: 10 })
```

#### Callback Format

If your new state depends on the previous state, pass a callback function. The callback receives the current state object with its evaluated values (not getters) and must return a partial state object.

```javascript
this.setState((prev) => ({
    count: prev.count + 1,
}))
```

### Lifecycle Restrictions

State updates trigger DOM updates. Because of this, calling `this.setState()` before the component is mounted (i.e. when `this.mounted` is `false`) or after it has been unmounted will result in an error.

```javascript
class MyComponent extends WebComponent {
    initialState = { data: null }

    constructor() {
        super()
        // ERROR: Cannot update state while component is unmounted.
        this.setState({ data: 'foo' })
    }
}
```

If you need to fetch data or trigger state updates as soon as the component loads, do so in the `onMount` lifecycle hook:

```javascript
class MyComponent extends WebComponent {
    initialState = { data: null }

    onMount() {
        fetch('/api/data')
            .then((res) => res.json())
            .then((data) => {
                if (!this.mounted) return
                this.setState({ data })
            })
    }
}
```

### Derived UI Example

Keep the source state intact and derive display values inside functions.

```javascript
import { WebComponent, html, repeat } from '@beforesemicolon/web-component'

class SearchableList extends WebComponent {
    initialState = {
        query: '',
        items: ['Alpha', 'Beta', 'Gamma'],
    }

    results = () => {
        const query = this.state.query().toLowerCase()
        return this.state.items().filter((item) => {
            return item.toLowerCase().includes(query)
        })
    }

    render() {
        return html`
            <input
                value="${this.state.query}"
                oninput="${(event) =>
                    this.setState({ query: event.target.value })}"
            />
            <ul>
                ${repeat(
                    this.results,
                    (item) => html`<li>${item}</li>`,
                    () => html`<li>No matches.</li>`
                )}
            </ul>
        `
    }
}
```
