---
name: TypeScript
order: 4.4
title: TypeScript - WebComponent by Before Semicolon
description: Complete type safety and generics integration in WebComponent.
layout: document
---

## TypeScript

`@beforesemicolon/web-component` is designed with first-class TypeScript support, offering complete type safety for properties, internal state, reference bindings, and custom element interfaces.

### Subclassing with Generics

The `WebComponent` base class accepts two optional generic parameters: `Props` and `State`.

```typescript
import { WebComponent, html } from '@beforesemicolon/web-component'

// 1. Define your component's types
interface ButtonProps {
    label: string
    disabled: boolean
}

interface ButtonState {
    clickCount: number
}

// 2. Pass them to the WebComponent class
class CustomButton extends WebComponent<ButtonProps, ButtonState> {
    static observedAttributes = ['label', 'disabled']

    // Provide default props values as class properties
    label = 'Click me'
    disabled = false

    // Provide initial state
    initialState = {
        clickCount: 0,
    }

    handleClick = () => {
        this.setState((prev) => ({ clickCount: prev.clickCount + 1 }))
    }

    render() {
        // Both this.props and this.state are fully typed!
        return html`
            <button
                onclick="${this.handleClick}"
                disabled="${this.props.disabled}"
            >
                ${() => this.props.label()} (${() => this.state.clickCount()})
            </button>
        `
    }
}
```

---

### Custom Element References

When working with DOM APIs or template references, you often need a reference type that contains both the custom properties of your element and the standard `WebComponent` / `HTMLElement` APIs.

The `HTMLComponentElement<Props>` utility type provides this capability. It combines the `WebComponent` class with your custom property signatures (without requiring getters) so you can directly read or write values.

```typescript
import { HTMLComponentElement } from '@beforesemicolon/web-component'

// Given the CustomButton defined above:
type CustomButtonElement = HTMLComponentElement<ButtonProps>

// Now you can safely interact with the reference:
const myButton = document.querySelector<CustomButtonElement>('custom-button')

if (myButton) {
    // Directly access or update props on the instance
    myButton.label = 'Submit Form'
    myButton.disabled = true

    // Standard HTMLElement / WebComponent methods are also available
    myButton.dispatch('custom-event', { detail: 'clicked' })
}
```

---

### Exported Utility Types

The following TypeScript utility types are exported from the library to help build typed component-based architectures:

#### `ObjectInterface<P>`

Constraints checking helper representing an object containing key-value pairs where keys must be `string`, `number`, or `symbol`.

```typescript
type ObjectInterface<P> = {
    [K in keyof P & (string | symbol | number)]: P[K]
}
```

#### `Props<P>`

Maps each key in a properties interface `P` to a reactive `StateGetter` from `@beforesemicolon/markup`. This matches the type of `this.props`.

```typescript
type Props<P> = {
    [K in keyof P]: StateGetter<P[K]>
}
```

#### `PropsSetters<P>`

Maps each key in a properties interface `P` to a reactive `StateSetter` from `@beforesemicolon/markup`.

```typescript
type PropsSetters<P> = {
    [K in keyof P]: StateSetter<P[K]>
}
```

#### `State<S>`

Maps each key in a state interface `S` to a reactive `StateGetter` from `@beforesemicolon/markup`. This matches the type of `this.state`.

```typescript
type State<S> = {
    [K in keyof S]: StateGetter<S[K]>
}
```

#### `StateSetters<S>`

Maps each key in a state interface `S` to a reactive `StateSetter` from `@beforesemicolon/markup`.

```typescript
type StateSetters<S> = {
    [K in keyof S]: StateSetter<S[K]>
}
```
