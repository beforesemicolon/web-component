# Web Component

[![Static Badge](https://img.shields.io/badge/based_on-markup.beforesemicolon.com-blue)](https://markup.beforesemicolon.com)
[![Test](https://github.com/beforesemicolon/web-component/actions/workflows/test.yml/badge.svg)](https://github.com/beforesemicolon/web-component/actions/workflows/test.yml)
[![npm](https://img.shields.io/npm/v/%40beforesemicolon%2Fweb-component)](https://www.npmjs.com/package/@beforesemicolon/web-component)
![npm](https://img.shields.io/npm/l/%40beforesemicolon%2Fweb-component)

Enhanced [Markup](https://markup.beforesemicolon.com/) with Web Component capability.

## Motivation

-   Native Web Components APIs are too robust. This means you need to write so much code for the simplest components.
-   Even if you manage to handle all the APIs fine, you still need to deal with DOM manipulation and handle your own
    reactivity.
-   [Markup](https://markup.beforesemicolon.com/) offers the simplest and more powerful templating system that can be used
    on the client without setup.

With all these reasons, it only made sense to introduce a simple API to handle everything for you.

```ts
// import everything from Markup as if you are using it directly
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

-   [Create a Component](#create-a-component)
    -   [ShadowRoot](#shadowroot)
        -   [mode](#mode)
        -   [delegatesFocus](#delegatesfocus)
-   [Internals](#internals)
-   [ContentRoot](#content-root)
-   [Root](#root)
-   [Props](#props)
-   [State](#state)
    -   [initialState](#initialstate)
    -   [setState](#setstate)
-   [render](#render)
    -   [Templating](#templating)
    -   [Stylesheet](#stylesheet)
    -   [css](#css)
    -   [updateStylesheet](#updatestylesheet)
-   [Events](#events)
-   [Lifecycles](#lifecycles)
    -   [onMount](#onmount)
    -   [onUpdate](#onupdate)
    -   [onDestroy](#ondestroy)
    -   [onAdoption](#onadoption)
    -   [onError](#onerror)

### Create a Component

To create a component, all you need to do is create a class that extends `WebComponent` then define it.

```ts
class MyButton extends WebComponent {
...
}

customElements.define('my-button', MyButton)
```

#### ShadowRoot

By default, all components you create add a [ShadowRoot](https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot)
in `open` mode.

If you don't want `ShadowRoot` in your components, you can set the `shadow` property to `false`

```ts
class MyButton extends WebComponent {
    config = {
        shadow: false,
    }
}

customElements.define('my-button', MyButton)
```

##### mode

You can set the mode your `ShadowRoot` should be created with by setting the `mode` property. By default, it is set
to `open`.

```ts
class MyButton extends WebComponent {
    config = {
        mode: 'closed',
    }
}

customElements.define('my-button', MyButton)
```

##### delegatesFocus

You may also set whether the `ShadowRoot` delegates focus by setting the `delegatesFocus`. By default, it is set
to `false`.

```ts
class MyButton extends WebComponent {
    config = {
        delegatesFocus: 'closed',
    }
}

customElements.define('my-button', MyButton)
```

### Internals

WebComponent exposes the [ElementInternals](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals)
via the `internals` property that you can access for accessibility purposes.

```ts
class TextField extends WebComponent {
    static formAssociated = true // add this to form-related components
    static observedAttributes = ['disabled', 'placeholder']
    disabled = false
    placeholder = ''

    render() {
        return html`
            <input
                type="text"
                placeholder="${this.props.placeholder}"
                disabled="${this.props.disabled}"
            />
        `
    }
}

const field = new TextField()

field.internals // ElementInternals object
```

### Content Root

WebComponent exposes the root of the component via the `contentRoot` property. If the component has a `shadowRoot`,
it will expose it here regardless of the `mode`. If not, it will be the component itself.

```ts
const field = new TextField()

field.contentRoot // ShadowRoot object
```

This is not to be confused with the `Node` returned by calling
the [getRootNode()](https://developer.mozilla.org/en-US/docs/Web/API/Node/getRootNode) on an element.
The `getRootNode` will return the element context root node and `contentRoot` will contain the node where the template
was rendered to.

### Root

The root is about where the component was rendered at. It can either be the document itself, or the ancestor element shadow root.

### Props

If your component expects props (inputs), you can set the `observedAttributes` static array with all the attribute
names.

```ts
class MyButton extends WebComponent {
    static observedAttributes = ['type', 'disabled', 'label']
}

customElements.define('my-button', MyButton)
```

To define the default values for your props, simply define a property in the class with same name and provide the value.

```ts
class MyButton extends WebComponent {
    static observedAttributes = ['type', 'disabled', 'label']
    type = 'button'
    disabled = false
    label = ''
}

customElements.define('my-button', MyButton)
```

To read your reactive props you can access the `props` property in the class. This is what it is recommended to be used
in the template if you want the template to react to prop changes. Check the templating section for more.

```ts
interface Props {
    type: 'button' | 'reset' | 'submit'
    disabled: boolean
    label: string
}

class MyButton extends WebComponent<Props, {}> {
    static observedAttributes = ['type', 'disabled', 'label']
    type = 'button'
    disabled = false
    label = ''

    constructor() {
        super()

        console.log(this.props) // contains all props as getter functions
        this.props.disabled() // will return the value
    }
}

customElements.define('my-button', MyButton)
```

### State

The state is based on [Markup state](https://markup.beforesemicolon.com/documentation/state-values) which means it will
pair up with your template just fine.

#### initialState

To start using state in your component simply define the initial state with the `initialState` property.

```ts
interface State {
    loading: boolean
}

class MyButton extends WebComponent<{}, State> {
    initialState = {
        loading: false,
    }
}

customElements.define('my-button', MyButton)
```

#### setState

If you have state, you will need to update it. To do that you can call the `setState` method with a whole
or partially new state object or simply a callback function that returns the state.

```ts
interface State {
    loading: boolean
}

class MyButton extends WebComponent<{}, State> {
    initialState = {
        loading: false,
    }

    constructor() {
        super()

        this.setState({
            loading: true,
        })
    }
}

customElements.define('my-button', MyButton)
```

if you provide a partial state object it will be merged with the current state object. No need to spread state when
updating it.

### render

Not all components need an HTML body but in case you need one, you can use the `render` method to return either a
[Markup template](https://markup.beforesemicolon.com/documentation/creating-and-rendering), a string, or a DOM element.

```ts
import { WebComponent, html } from '@beforesemicolon/web-component'

class MyButton extends WebComponent {
    render() {
        return html`
            <button type="button">
                <slot></slot>
            </button>
        `
    }
}

customElements.define('my-button', MyButton)
```

#### Templating

In the `render` method you can return a string, a DOM element or
a [Markup template](https://markup.beforesemicolon.com/documentation/creating-and-rendering).
To learn more about Markup, check
its [documentation](https://markup.beforesemicolon.com/documentation/creating-and-rendering).

#### Stylesheet

You have the ability to specify a style for your component either by providing a CSS string or
a [CSSStyleSheet](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet).

```ts
import { WebComponent, html } from '@beforesemicolon/web-component'
import buttonStyle from './my-button.css' assert { type: 'css' }

class MyButton extends WebComponent {
    stylesheet = buttonStyle
}

customElements.define('my-button', MyButton)
```

Where the style is added will depend on whether the `shadow` option is true or false. If
the component has shadow style will be added to its own [content root](#content-root). Otherwise,
style will be added to the closest [root](#root) node the component was rendered in. It can be the document
itself or root of an ancestor web component.

###### css

you can use the `css` utility to define your style inside the component as well.

```ts
class MyButton extends WebComponent {
    stylesheet = css`
        :host {
            display: inline-block;
        }
        button {
            color: blue;
        }
    `
}

customElements.define('my-button', MyButton)
```

It helps your IDE give you better CSS syntax highlight and autocompletion.

##### updateStylesheet

You can always manipulate the `stylesheet` property according to the `CSSStyleSheet` properties. For when you want to
replace the stylesheet completely with another, you can use the `updateStylesheet` method and
provide either a string or a new instance of `CSSStyleSheet`.

### Events

Components can dispatch custom events of any name and include data. For that, you can use the `dispatch` method.

```ts
class MyButton extends WebComponent {
    handleClick = (e: Event) => {
        e.stopPropagation()
        e.preventDefault()

        this.dispatch('click')
    }

    render() {
        return html`
            <button type="button" onclick="${this.handleClick}">
                <slot></slot>
            </button>
        `
    }
}

customElements.define('my-button', MyButton)
```

### Lifecycles

You could consider the `constructor` and `render` method as some type of "lifecycle" where anything inside the
constructor happen when the component is instantiated and everything in the `render` method happens before
the `onMount`.

#### onMount

The `onMount` method is called whenever the component is added to the DOM.

```ts
class MyButton extends WebComponent {
    onMount() {
        console.log(this.mounted)
    }
}

customElements.define('my-button', MyButton)
```

You may always use the `mounted` property to check if the component is in the DOM or not.

#### onUpdate

The `onUpdate` method is called whenever the component props are updated via the `setAttribute` or changing the props
property on the element instance directly.

```ts
class MyButton extends WebComponent {
    onUpdate(name: string, newValue: unknown, oldValue: unknown) {
        console.log(`prop ${name} updated from ${oldValue} to ${newValue}`)
    }
}

customElements.define('my-button', MyButton)
```

The method will always tell you, which prop and its new and old value.

#### onDestroy

The `onDestroy` method is called whenever the component is removed from the DOM.

```ts
class MyButton extends WebComponent {
    onDestroy() {
        console.log(this.mounted)
    }
}

customElements.define('my-button', MyButton)
```

#### onAdoption

The `onAdoption` method is called whenever the component is moved from one document to another. For example, when you
move a component from an iframe to the main document.

```ts
class MyButton extends WebComponent {
    onAdoption() {
        console.log(document)
    }
}

customElements.define('my-button', MyButton)
```

#### onError

The `onError` method is called whenever the component fails to perform internal actions. These action can also be
related to
code executed inside any lifecycle methods, render, state or style update.

```ts
class MyButton extends WebComponent {
    onError(error: Error) {
        console.log(document)
    }
}

customElements.define('my-button', MyButton)
```

You may also use this method as a single place to expose and handle all the errors.

```ts
class MyButton extends WebComponent {
    onClick() {
        execAsyncAction().catch(this.onErrror)
    }

    onError(error) {
        // handle error
    }
}

customElements.define('my-button', MyButton)
```

You can also enhance components so all errors are handled in the same place.

```ts
// have your global componenent that extends WebComponent
// and that you can use to handle all global related things, for example, error tracking
class Component extends WebComponent {
    onError(error: Error) {
        trackError(error)
        console.error(error)
    }
}

class MyButton extends Component {
    onClick() {
        execAsyncAction().catch(this.onErrror)
    }
}

customElements.define('my-button', MyButton)
```
