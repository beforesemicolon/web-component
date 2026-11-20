---
name: beforesemicolon-web-component
description: Define, register, consume, or review native custom elements with @beforesemicolon/web-component. Use for reactive props and internal state, slots, events, styles, and component lifecycle in npm and classic browser projects.
---

# Build with Web Component

## Read the complete offline skill

This installed skill includes all of its guides and runnable examples. You do
not need the package website or a network connection to read them.

- [Offline guide and API index](./references/index.md): one documented page and concrete example for every public runtime and TypeScript export.
- [Full package maintainer guide](./references/maintainer-guide.md): the extended reference from this release's package source.
- [Worked patterns and tests](./references/patterns.md): compose realistic interfaces and verify their behavior.
- [Local npm and browser examples](./examples/README.md): copy the installed runtime into the example folder for completely local browser tests.

Read the smallest relevant guide or API page. Prefer the facts in this bundle
when it matches the project version. If the app uses a different version,
install the matching skill bundle before depending on a behavior.

## Find the matching release

- Read the resolved @beforesemicolon/web-component version from installed metadata, the lockfile, or the actual classic script URL. Read its `ai/index.json`, or replace `VERSION` in `https://cdn.jsdelivr.net/npm/@beforesemicolon/web-component@VERSION/ai/index.json`. Select `web-component/WebComponent` and any applicable records. For older releases without an index, use their matching declarations and source.
- npm exports `WebComponent`, `css`, and Markup APIs such as `html` as named exports. For nested Markup behavior in an npm project, use the Markup dependency version actually resolved for Web Component. The classic bundle provides `window.BFS.WebComponent`, `window.BFS.css`, and `window.BFS.MARKUP.html`; it does not provide `BFS.html`. Load Web Component before classic libraries that depend on its runtime, and do not install another classic Markup runtime on top of it.
- Keep the project's entry style. For a prebuilt Cube control, load the component's verified registration entry, not a new custom element with an invented public API. Use the Markup skill for template reactivity when it is available.

## Companion packages

Keep working Before Semicolon dependencies where they fit, and choose the
smallest compatible set for the task. Open a companion skill only when it owns
behavior you need:

- `@beforesemicolon/markup` (`beforesemicolon-markup`): reactive HTML templates, state, effects, and helpers already re-exported by Web Component.
- `@beforesemicolon/router` (`beforesemicolon-router`): URL navigation, route matching, and route-aware views.
- `@beforesemicolon/intl` (`beforesemicolon-intl`): locale switching, scoped translations, and formatters.
- `@beforesemicolon/cube` (`beforesemicolon-cube`): ready-made UI controls, accessible interactions, and design tokens.

In a classic browser app, Web Component already provides `window.BFS.MARKUP`.
Do not load a separate Markup script when Web Component supplies that runtime.

## Choose a setup

For classic HTML on Web Component 1.22.0, place the exact browser script
before the code that defines elements. Use only one runtime:

```html
<script src="https://cdn.jsdelivr.net/npm/@beforesemicolon/web-component@1.22.0/dist/client.js"></script>
<status-label status-text="Ready"></status-label>
<script>
    const { WebComponent } = window.BFS
    const { html } = window.BFS.MARKUP

    class StatusLabel extends WebComponent {
        static observedAttributes = ['status-text']
        statusText = 'Pending'

        render() {
            return html`<span role="status">${this.props.statusText}</span>`
        }
    }

    customElements.define('status-label', StatusLabel)
</script>
```

## Define a small native contract

1. Define a hyphenated tag once with `customElements.define`. State which lowercase attributes, slots, events, and CSS parts you intend to support before adding an element.
2. Declare reactive attribute names in `static observedAttributes` and default values in camelCase instance fields. Read `this.props.name()` in logic and bind `this.props.name` directly in a template. Use `initialState` and `setState` for reactive internals; do not mutate state from `render` or call `setState` while detached.
3. Use a default slot for one consumer-supplied area and named slots for distinct additional areas. Use native controls for their keyboard and focus behavior. Attach handlers directly to concrete controls, not slots. Use a stable arrow method when passing a handler.
4. Use `this.dispatch(name, detail)` for one documented event per action. Provide a complete payload from the source data. The helper dispatches at the custom element without bubbling or composing. Listen on that host; use a deliberate native `CustomEvent` contract if propagation is required. Do not impose callback props or require callers to reach into another element's state or methods.
5. Use the default shadow root unless the consumer requires otherwise. Put local styles in `stylesheet` with `css` for inline CSS, and style the host with `:host`. Expose a CSS part only for a supported customization contract. Do not shadow native attributes such as `class`, `id`, or `style` as component inputs.
6. Use `onMount` for subscriptions and listeners. Return cleanup to run when the element is removed. `onMount` runs again on reconnection. Use `onUpdate` for prop-driven effects and `refs` for owned nodes. Keep `render` declarative.

## Runnable pattern

```js
import { WebComponent, html } from '@beforesemicolon/web-component'

class StatusButton extends WebComponent {
    static observedAttributes = ['message']
    message = 'Ready'
    initialState = { count: 0 }

    onMount() {
        const reset = () => this.setState({ count: 0 })
        window.addEventListener('reset-status', reset)
        return () => window.removeEventListener('reset-status', reset)
    }

    confirm = () => {
        const count = this.state.count() + 1
        this.setState({ count })
        this.dispatch('status-confirm', {
            message: this.props.message(),
            count,
        })
    }

    render() {
        return html`
            <button type="button" onclick="${this.confirm}">
                <slot>Confirm status</slot>
            </button>
            <output>${this.props.message}: ${this.state.count}</output>
        `
    }
}

customElements.define('status-button', StatusButton)
```

Use `<status-button message="Ready">Confirm status</status-button>`. For classic HTML, load the exact Web Component client first and replace the import with `const { WebComponent } = window.BFS` and `const { html } = window.BFS.MARKUP`.

## Reusable patterns

- **Public values:** Supply `status-text` in HTML or assign `statusText` on the element. Keep fields for attributes explicit; pass rich child content through slots, rather than through string or function props.
- **Event payloads:** Listen directly on the host, for example `element.addEventListener('status-confirm', ({ detail }) => renderResult(detail.count))`. Read the documented `detail` shape instead of trying to reconstruct it from internal DOM nodes.
- **Reactive CSS:** Import `css` (or read `window.BFS.css`) and derive style values inside the class. If the component observes an `emphasis` attribute with default `normal`, use a controlled mapping rather than injecting text from that attribute:

    ```js
    color = () =>
        this.props.emphasis() === 'strong'
            ? 'var(--emphasis, currentColor)'
            : 'inherit'
    stylesheet = css`
        :host {
            color: ${this.color};
        }
    `
    ```

- **Owned DOM and cleanup:** Bind a Markup `ref` to a concrete descendant and use `this.refs.name?.[0]` if imperative access is necessary. Attach document listeners or abortable requests in `onMount` or other owner actions, and dispose or abort on removal. Do not query another element's shadow DOM as its public API.
- **Customization:** Use a slot for content and a documented `part` for specific CSS customization, not a pass-through `className` or CSS override on every instance. Filter stable/public parts through the design contract before exposing them.

Verify that an attribute update changes rendered text, activating the named button emits one event with the documented detail, and removal cleans up the subscription. Test reconnecting if reconnection matters. Run the project's checker if available.
