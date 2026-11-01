# Web Component

[![Static Badge](https://img.shields.io/badge/documentation-blue)](https://web-component.beforesemicolon.com/)
[![Test](https://github.com/beforesemicolon/web-component/actions/workflows/test.yml/badge.svg)](https://github.com/beforesemicolon/web-component/actions/workflows/test.yml)
[![npm](https://img.shields.io/npm/v/%40beforesemicolon%2Fweb-component)](https://www.npmjs.com/package/@beforesemicolon/web-component)
![npm](https://img.shields.io/npm/l/%40beforesemicolon%2Fweb-component)

Reactive Web Component API enhanced with [Markup](https://markup.beforesemicolon.com/).

## Motivation

- Native Web Components APIs are too robust. This means you need to write so much code for the simplest components.
- Even if you manage to handle all the APIs fine, you still need to deal with DOM manipulation and handle your own reactivity.
- [Markup](https://markup.beforesemicolon.com/) offers the simplest and more powerful templating system that can be used
  on the client without setup.

With all these reasons, it only made sense to introduce a simple API to handle everything for you.

```ts
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

## Install

```
npm install @beforesemicolon/web-component
```

In the browser

```html
<!-- use the latest version -->
<script src="https://unpkg.com/@beforesemicolon/web-component/dist/client.js"></script>

<!-- use a specific version -->
<script src="https://unpkg.com/@beforesemicolon/web-component@1.21.0-next/dist/client.js"></script>

<!-- link you app script after -->
<script>
    const { WebComponent } = BFS
    const { html, state, effect } = BFS.MARKUP
</script>
```

## AI and ecosystem context

- [`llms.txt`](https://web-component.beforesemicolon.com/llms.txt) is the concise,
  package-owned API and ecosystem contract for AI tools.
- [`llms-full.txt`](https://web-component.beforesemicolon.com/llms-full.txt)
  contains the complete resolved documentation and examples.

Web Component re-exports Markup. Router and Intl build on Web Component and can
be composed together without changing its component model.

## Community

- [Contributing guidelines](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Security policy](SECURITY.md)
- [BSD 3-Clause License](LICENSE)
