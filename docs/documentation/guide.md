---
name: Guide & Best Practices
order: 3.1
title: WebComponent Guide and Best Practices - Before Semicolon
description: Practical conventions for building reactive custom elements with @beforesemicolon/web-component.
layout: document
---

## Guide & Best Practices

Use `@beforesemicolon/web-component` when you want native custom elements with a small reactive layer for templates, props, state, scoped styles, lifecycle hooks, and form integration.

## Core Rules

1.  **Keep `render()` declarative**: Return `html`, a `Node`, a string, or nothing. Do not start timers, fetch data, subscribe to global events, or mutate state inside `render()`.
2.  **Use observed attributes for public inputs**: Put external inputs in `static observedAttributes`, provide defaults as class fields, and read them from `this.props`.
3.  **Use state for owned UI data**: Put private component data in `initialState` and update it with `this.setState()`.
4.  **Pass reactive getters directly when possible**: Use `${this.state.count}` or `${this.props.label}` in templates. Call getters inside calculations, conditions, or event handlers.
5.  **Use lifecycle hooks for side effects**: Start work in `onMount()`, return cleanup from `onMount()` or use `onDestroy()`, and respond to prop changes in `onUpdate()`.
6.  **Prefer `ref` before `querySelector`**: Use `ref` for template-owned elements and reach for `contentRoot` only when dynamic querying is genuinely clearer.
7.  **Dispatch public events**: Use `this.dispatch(name, detail)` for component outputs. Consumers listen with normal DOM APIs or Markup `on...` handlers.

## Component Shape

```javascript
import { WebComponent, html, css } from '@beforesemicolon/web-component'

class ProductCounter extends WebComponent {
    static observedAttributes = ['label', 'max']
    label = 'Quantity'
    max = 10
    initialState = { value: 1 }

    stylesheet = css`
        :host {
            display: inline-grid;
            gap: 0.5rem;
        }
    `

    setValue = (value) => {
        const next = Math.min(Number(this.props.max()), Math.max(1, value))
        this.setState({ value: next })
        this.dispatch('change', { value: next })
    }

    render() {
        return html`
            <label>${this.props.label}</label>
            <button
                type="button"
                onclick="${() => this.setValue(this.state.value() - 1)}"
            >
                -
            </button>
            <output>${this.state.value}</output>
            <button
                type="button"
                onclick="${() => this.setValue(this.state.value() + 1)}"
            >
                +
            </button>
        `
    }
}

customElements.define('product-counter', ProductCounter)
```

## Attribute Formatting

Break long custom element usage across lines. It keeps examples readable and avoids horizontal scroll.

```html
<product-counter
    label="Team seats"
    max="25"
    onchange="console.log(event.detail.value)"
></product-counter>
```

## Props vs State

Use props for values controlled by the outside page. Use state for values the component owns.

```javascript
class UserBadge extends WebComponent {
    static observedAttributes = ['name', 'status']
    name = 'Guest'
    status = 'offline'
    initialState = { expanded: false }

    render() {
        return html`
            <button
                type="button"
                aria-expanded="${this.state.expanded}"
                onclick="${() =>
                    this.setState(({ expanded }) => ({
                        expanded: !expanded,
                    }))}"
            >
                ${this.props.name} is ${this.props.status}
            </button>
        `
    }
}
```

## Side Effects

Use `onMount()` for browser subscriptions and return a cleanup function.

```javascript
class ViewportMeter extends WebComponent {
    initialState = { width: window.innerWidth }

    onMount() {
        const update = () => {
            this.setState({ width: window.innerWidth })
        }

        window.addEventListener('resize', update)
        return () => window.removeEventListener('resize', update)
    }

    render() {
        return html`<output>${this.state.width}px</output>`
    }
}
```

## Styling

Use `stylesheet` for static CSS and `css` when styles depend on props or state.

```javascript
class ModePanel extends WebComponent {
    static observedAttributes = ['mode']
    mode = 'info'

    stylesheet = css`
        :host {
            display: block;
            border-color: ${() => {
                return this.props.mode() === 'danger'
                    ? 'var(--danger)'
                    : 'var(--primary)'
            }};
        }
    `

    render() {
        return html`<slot></slot>`
    }
}
```

## Form Controls

Use `static formAssociated = true` only for controls that should participate in native form submission or validation.

```javascript
class RatingInput extends WebComponent {
    static formAssociated = true
    initialState = { value: 0 }

    choose = (value) => {
        this.setState({ value })
        this.internals.setFormValue(String(value))
        this.dispatch('change', { value })
    }

    render() {
        return html`
            <button type="button" onclick="${() => this.choose(1)}">1</button>
            <button type="button" onclick="${() => this.choose(2)}">2</button>
            <button type="button" onclick="${() => this.choose(3)}">3</button>
        `
    }
}
```
