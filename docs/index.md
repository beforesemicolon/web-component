---
name: WebComponent
order: 0
title: WebComponent by Before Semicolon
description: Build reactive Web Components enhanced with state, props, scoped styles, lifecycles, and form integration — powered by Markup.
layout: landing
---

::: layout landing-hero version="v1.19.2" title="Web Components." title2="Now Reactive." primaryLabel="Get Started" secondaryLabel="npm i @beforesemicolon/web-component"

=== copy

A tiny reactive layer over the native Web Components API. Props, state, scoped styles, and lifecycles &mdash; all built on [Markup](https://markup.beforesemicolon.com/).

=== stat

## Native

CUSTOM ELEMENTS

=== stat

## 0

DEPENDENCIES

=== stat

## ∞

FRAMEWORK-FRIENDLY

=== code filename=hello-world.js lang=javascript

```javascript
import { WebComponent, html } from '@beforesemicolon/web-component'

class HelloWorld extends WebComponent {
    static observedAttributes = ['name']

    name = 'World'

    render() {
        return html`<h1>Hello, ${this.props.name}!</h1> `
    }
}

customElements.define('hello-world', HelloWorld)
// <hello-world name="James"></hello-world>
```

:::

::: layout landing-ecosystem

=== header

`// the ecosystem`

## Built on Web Component.

Production-ready libraries built on top of Web Component &mdash; same custom-element foundation, modular packages.

=== product title=Router package=@beforesemicolon/router color=accent icon=router href=https://router.beforesemicolon.com

Declarative routing as web component tags &mdash; built on top of Web Component. Nested routes, params, 404s.

=== product title=Intl package=@beforesemicolon/intl color=primary icon=reactive href=https://intl.beforesemicolon.com

Localization for component-first interfaces &mdash; built on top of Web Component. Locale scopes, messages, formatters.

:::

::: layout landing-features

=== header

`// why web-component`

## Custom Elements, supercharged.

Everything you love about native Web Components &mdash; plus the reactivity, ergonomics, and tiny footprint of Markup.

=== feature icon=reactive

### Reactive props & state

Observed attributes become reactive props. Updating state updates only the DOM that depends on it.

=== feature icon=tiny

### Tiny

A thin layer over the native Web Components API. Built on Markup &mdash; no extra dependencies.

=== feature icon=standards

### Scoped styles

Per-component stylesheets that ship with the element. No leaks, no conflicts, no CSS-in-JS runtime.

=== feature icon=plug

### Native lifecycles

onMount, onUpdate, onDestroy, onAdoption &mdash; first-class hooks for everything Custom Elements expose.

=== feature icon=webComponents

### Works everywhere

Custom Elements run in any framework, in plain HTML, or in any tool that renders DOM.

=== feature icon=surgical

### Built on Markup

Same reactive engine, same templating, same 0-build philosophy. Drop in a script tag and ship.

:::

::: layout landing-showcase

=== header

`// see it in action`

## Real components. Native tags.

Build focused elements that own their props, state, styles, lifecycle work, and public events.

=== example label="Quantity stepper" color=accent filename=quantity-stepper.js lang=javascript

```javascript
import { WebComponent, html } from '@beforesemicolon/web-component'

class QuantityStepper extends WebComponent {
    static observedAttributes = ['label', 'min', 'max']
    label = 'Seats'
    min = 1
    max = 10
    initialState = { value: 1 }

    setValue = (value) => {
        const next = Math.min(
            Number(this.props.max()),
            Math.max(Number(this.props.min()), value)
        )
        this.setState({ value: next })
        this.dispatch('change', { value: next })
    }

    render() {
        return html`
            <label>${this.props.label}</label>
            <button onclick="${() => this.setValue(this.state.value() - 1)}">
                -
            </button>
            <output>${this.state.value}</output>
            <button onclick="${() => this.setValue(this.state.value() + 1)}">
                +
            </button>
        `
    }
}

customElements.define('quantity-stepper', QuantityStepper)
```

=== example label="Todo list" color=accent filename=todo-list.js lang=javascript

```javascript
import { WebComponent, html, repeat } from '@beforesemicolon/web-component'

class TodoList extends WebComponent {
    initialState = {
        draft: '',
        todos: ['Plan release', 'Write docs'],
    }

    add = () => {
        const text = this.state.draft().trim()
        if (!text) return

        this.setState(({ todos }) => ({
            draft: '',
            todos: [...todos, text],
        }))
    }

    render() {
        return html`
            <input
                value="${this.state.draft}"
                oninput="${(event) =>
                    this.setState({ draft: event.target.value })}"
            />
            <button onclick="${this.add}">Add</button>
            <ul>
                ${repeat(this.state.todos, (todo) => html`<li>${todo}</li>`)}
            </ul>
        `
    }
}

customElements.define('todo-list', TodoList)
```

=== example label="Pricing toggle" color=accent filename=pricing-toggle.js lang=javascript

```javascript
import { WebComponent, html } from '@beforesemicolon/web-component'

class PricingToggle extends WebComponent {
    static observedAttributes = ['monthly', 'yearly']
    monthly = 19
    yearly = 190
    initialState = { yearly: false }

    toggle = () => {
        this.setState(({ yearly }) => ({ yearly: !yearly }))
    }

    render() {
        return html`
            <button
                type="button"
                aria-pressed="${this.state.yearly}"
                onclick="${this.toggle}"
            >
                Bill yearly
            </button>
            <strong>
                $${() => {
                    return this.state.yearly()
                        ? this.props.yearly()
                        : this.props.monthly()
                }}
            </strong>
        `
    }
}

customElements.define('pricing-toggle', PricingToggle)
```

=== example label="Validated field" color=accent filename=email-field.js lang=javascript

```javascript
import { WebComponent, html } from '@beforesemicolon/web-component'

class EmailField extends WebComponent {
    static formAssociated = true
    initialState = { value: '', error: '' }

    update = (event) => {
        const value = event.target.value
        const valid = value.includes('@')

        this.setState({
            value,
            error: valid ? '' : 'Enter a valid email.',
        })
        this.internals.setFormValue(value)
        this.internals.setValidity(
            valid ? {} : { customError: true },
            valid ? '' : 'Enter a valid email.',
            this.refs.input?.[0]
        )
    }

    render() {
        return html`
            <input
                ref="input"
                type="email"
                value="${this.state.value}"
                oninput="${this.update}"
            />
            <small>${this.state.error}</small>
        `
    }
}

customElements.define('email-field', EmailField)
```

=== example label="Reactive stylesheet" color=accent filename=status-pill.js lang=javascript

```javascript
import {
    WebComponent,
    html,
    css,
    is,
    when,
} from '@beforesemicolon/web-component'

class StatusPill extends WebComponent {
    static observedAttributes = ['status']
    status = 'ready'

    stylesheet = css`
        :host {
            display: inline-flex;
            border-radius: 999px;
            padding: 0.35rem 0.7rem;
            background: ${when(
                is(this.props.status, 'ready'),
                '#dcfce7',
                '#dbeafe'
            )};
            color: ${when(
                is(this.props.status, 'ready'),
                '#166534',
                '#1d4ed8'
            )};
        }
    `

    render() {
        return html`<slot>${this.props.status}</slot>`
    }
}

customElements.define('status-pill', StatusPill)
```

:::

::: layout landing-install

=== header

`// quick start`

## Install in seconds.

Choose your preferred installation method. Works everywhere JavaScript runs.

=== tab key=cdn label=CDN command="<script src=&quot;https://unpkg.com/@beforesemicolon/web-component/dist/client.js&quot;></script>"

=== tab key=npm label=npm command="npm install @beforesemicolon/web-component"

=== tab key=yarn label=yarn command="yarn add @beforesemicolon/web-component"

=== tab key=pnpm label=pnpm command="pnpm add @beforesemicolon/web-component"

:::

::: layout landing-cta title="Build reactive Web Components," title2="your way."

=== copy

Combine the simplicity of vanilla Web Standards with the power of modern reactivity.

:::
