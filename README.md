# Web Component

Simplified way to interact with Web Component APIs with [Markup](https://markup.beforesemicolon.com/) templating and state.

```ts
import { WebComponent, html } from '@beforesemicolon/web-component'
import stylesheet from './counter-app.css' assert { type: 'css' }

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

    countUp(e: Event) {
        e.stopPropagation()
        e.preventDefault()

        this.setState(({ count }) => ({ count: count + 1 }))
        this.dispatch('click')
    }

    render() {
        return html`
            <p>${this.state.count}</p>
            <button type="button" onclick="${this.countUp.bind(this)}">
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
<script src="https://unpkg.com/@beforesemicolon/web-component@0.0.4/dist/client.js"></script>

<!-- link you app script after -->
<script>
    const { WebComponent } = BFS
    const { html, state } = BFS.MARKUP
</script>
```

## Documentation

### Create a Component

#### ShadowRoot

##### mode

##### delegatesFocus

### Props

### State

#### initiateState

#### setState

### render

#### Templating

#### Stylesheet

##### updateStylesheet

### Events

#### dispatch

### Lifecycles

#### onMount

##### mounted

#### onUpdate

#### onDestroy

#### onAdoption
