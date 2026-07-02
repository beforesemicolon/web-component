---
name: Props
order: 5.1
layout: document
title: Props - WebComponent by Before Semicolon
description: Define and read reactive external properties mapped to observed attributes.
---

## Props

Props are the external inputs to your component. In WebComponent, props are bound to HTML attributes, providing a reactive and seamless way to receive data from parents or external consumers.

### Declaring Props

To declare reactive props, add their attribute names to the `static observedAttributes` array. WebComponent automatically watches these attributes and sets up reactive getters/setters on the element instance.

```javascript
import { WebComponent } from '@beforesemicolon/web-component'

class MyCard extends WebComponent {
    static observedAttributes = ['card-title', 'is-open']
}
```

### Case Conversion

HTML attributes are case-insensitive and conventionally written in kebab-case (e.g., `card-title`). WebComponent automatically converts these kebab-case attributes to camelCase properties on the class instance (e.g., `cardTitle`).

For example:

-   `card-title` becomes `cardTitle`
-   `is-open` becomes `isOpen`
-   `disabled` remains `disabled`

### Default Values

You can specify default values for your props by defining them as class fields. If the corresponding attribute is not present on the element when it mounts, the default value will be used.

```javascript
import { WebComponent } from '@beforesemicolon/web-component'

class MyCard extends WebComponent {
    static observedAttributes = ['card-title', 'is-open']

    // Default values
    cardTitle = 'Untitled'
    isOpen = false
}
```

### Reading Props in Templates

Inside the component class, you can access the reactive getter functions via `this.props`.

Since these props are reactive signal getters, they should be invoked as functions to read their current value (e.g., `this.props.cardTitle()`). When used in Markup templates, passing the getter function directly allows the template to automatically subscribe to updates:

```javascript
import { WebComponent, html } from '@beforesemicolon/web-component'

class MyCard extends WebComponent {
    static observedAttributes = ['card-title', 'is-open']

    cardTitle = 'Untitled'
    isOpen = false

    render() {
        return html`
            <div
                class="card ${() => (this.props.isOpen() ? 'open' : 'closed')}"
            >
                <h3>${this.props.cardTitle}</h3>
                <slot></slot>
            </div>
        `
    }
}
```

> [!NOTE]
> Passing `this.props.cardTitle` directly as an expression in the template (without calling it) works because Markup is designed to resolve getters reactively. If you are doing calculations or conditional rendering inside a function callback, make sure to call it as a function: `this.props.isOpen()`.

### Attribute Parsing & Serialization

WebComponent does not serialize and deserialize prop values as a component data protocol.

There are two different paths:

1. **String attributes**: Literal HTML attributes and `setAttribute()` values are browser strings. WebComponent passes those strings through its internal JSON parser, so primitive-looking values can become primitives and JSON-looking values can become arrays or objects.
2. **Property/reference values**: Values assigned through the component property, including values passed from Markup expressions, are kept as JavaScript values. Objects, arrays, functions, and other non-primitives are passed by reference and are not written back to HTML attributes.
3. **Primitive property values**: When you assign a primitive value directly to the component property, WebComponent mirrors it back to the matching kebab-case attribute.

```html
<my-card
    card-title="My Project"
    count="3"
    enabled="true"
    tags='["ui", "release"]'
></my-card>
```

In this HTML-only example, WebComponent receives strings from the browser and parses JSON-compatible values before updating `this.props`:

-   `card-title` remains the string `"My Project"`.
-   `count` becomes the number `3`.
-   `enabled` becomes the boolean `true`.
-   `tags` becomes the array `["ui", "release"]`.

When a parent template passes a non-primitive value, keep it as a reference instead of stringifying it:

```javascript
import { WebComponent, html } from '@beforesemicolon/web-component'

const project = {
    title: 'Launch',
    owner: 'Design',
}

class ProjectShell extends WebComponent {
    render() {
        return html`<project-card project=${project}></project-card>`
    }
}
```

The `project` prop is the original object reference. It is not converted to JSON, placed in the DOM as an attribute string, and parsed again later.

### Imperative Updates

You can also read and write props imperatively directly on the element instance. Primitive values sync back to HTML attributes. Non-primitive values update the reactive prop directly and stay as references.

```javascript
const card = document.querySelector('my-card')

// Read value imperatively
console.log(card.cardTitle) // Logs "My Project"

// Update value imperatively
card.cardTitle = 'Updated Title' // Syncs to attribute: card-title="Updated Title"
```

```javascript
const project = {
    title: 'Launch',
    tasks: ['Design', 'Build'],
}

card.project = project

console.log(card.props.project() === project) // true
console.log(card.hasAttribute('project')) // false
```

### Practical Component Example

```javascript
import { WebComponent, html } from '@beforesemicolon/web-component'

class PlanCard extends WebComponent {
    static observedAttributes = ['name', 'price', 'featured']
    name = 'Starter'
    price = 19
    featured = false

    render() {
        return html`
            <article
                class="${() =>
                    this.props.featured() ? 'featured' : 'standard'}"
            >
                <h3>${this.props.name}</h3>
                <strong>$${this.props.price}</strong>
                <slot></slot>
            </article>
        `
    }
}

customElements.define('plan-card', PlanCard)
```

```html
<plan-card name="Team" price="49" featured>
    Includes shared projects and priority support.
</plan-card>
```
