# Web Component worked patterns

Use the [API index](./index.md) for each public runtime and TypeScript export,
including all named Markup re-exports. The [maintainer guide](./maintainer-guide.md)
covers installation, lifecycle, state, rendering, form integration, and
composition with Router and Intl. Use the [local example runner](../examples/README.md)
to check an observed attribute, input action, event payload, and cleanup.
Read the [review guide](./component-review.md) before replacing component
contracts or writing tests. The [status picker](../examples/status-picker.html)
shows direct reactive bindings, a custom filter selector, a slot, and a
payload event in one local example.

## Define values, events, and style contracts together

| Need                                       | Supported public contract                                                      |
| ------------------------------------------ | ------------------------------------------------------------------------------ |
| Set a simple value from markup             | Observe a lowercase attribute and define its camelCase default field           |
| Set structured data in JavaScript          | Assign the declared public property instead of stringifying a function or node |
| Render consumer-owned content              | Use the default slot, or named slots for distinct insertion points             |
| Tell a caller something happened           | Emit one event with a documented detail shape                                  |
| Let consumers theme the host               | Use CSS variables and deliberately exposed parts                               |
| Own transient UI data inside the component | Use getters in `this.state` and update mounted state through `setState`        |

Example contract: `status-note` observes `card-title` and `emphasis`, exposes
one slot and a supported `heading` part, and emits `note-dismiss` with
`{ title: string }`. There is no callback attribute. Use a native button.
The selector `:host` owns the shell; no extra wrapper is needed.

```js
import { WebComponent, css, html } from '@beforesemicolon/web-component'

class StatusNote extends WebComponent {
    static observedAttributes = ['card-title', 'emphasis']
    cardTitle = 'Status'
    emphasis = 'normal'
    initialState = { dismissed: false }

    border = () =>
        this.props.emphasis() === 'strong' ? 'currentColor' : 'transparent'
    stylesheet = css`
        :host {
            display: block;
            border: 1px solid ${this.border};
        }
    `

    dismiss = () => {
        if (this.state.dismissed()) return
        this.setState({ dismissed: true })
        this.dispatch('note-dismiss', { title: this.props.cardTitle() })
    }

    render() {
        return html`<section aria-label="${this.props.cardTitle}">
            <strong part="heading">${this.props.cardTitle}</strong>
            <slot></slot>
            <button
                type="button"
                onclick="${this.dismiss}"
                disabled="${this.state.dismissed}"
            >
                Dismiss
            </button>
        </section>`
    }
}
customElements.define('status-note', StatusNote)
```

Use `<status-note card-title="Saved" emphasis="strong">Your changes are ready</status-note>`.
Attach a direct listener on the host for `note-dismiss`. Check that an
attribute update changes the visible heading and that pressing Enter on
Dismiss emits the documented payload once. Keep complex values out of
untrusted raw markup, and use typed, explicit properties rather than a bag of
arbitrary attributes.

## Distinguish lifecycle and DOM guarantees

- `onMount` runs after each connection and render; return a cleanup function
  for each set of listeners. `onDestroy` runs during removal. Do not store
  long-lived event listeners in `render`.
- `onUpdate(name, next, previous)` is an observed prop update hook. Bind
  simple reactive values directly; do not rebuild a template on every prop
  change. Reserve the hook for a genuinely prop-driven effect.
- `onAdoption` handles moving the element to a different document.
  `onError` is the owner for a caught component error. Avoid throwing again
  inside that hook.
- `contentRoot` is the component's own ShadowRoot (or host if configured for
  light DOM); `root` is the closest contextual root tracked by the base.
  `mounted` tells you when `setState` is allowed. `refs` contains arrays of
  nodes attached to the returned Markup template. Do not access sibling
  component internals through these properties.
- Return a Markup `HtmlTemplate`, a DOM node, a trusted string, or no value
  from `render`, as the exact declaration allows. Prefer Markup for dynamic
  data. Never concatenate untrusted HTML.

```js
onMount() {
    const lifetime = new AbortController()
    window.addEventListener('resize', this.reportSize, { signal: lifetime.signal })
    this.refs.initialFocus?.[0]?.focus()
    return () => lifetime.abort()
}
```

For form controls, set `static formAssociated = true` and use the component's
`internals` to set its form value or validity. Give the actual control an
accessible name. When a native input can deliver the required semantics,
prefer wrapping it to reimplementing browser keyboard and form behavior.

## Use styles through supported boundaries

Use the [css factory](./api/css.md) for reactive styling and reserved values
such as theme tokens. Use a `CSSStyleSheet` or shared stylesheet string where
the project already owns those assets. The [CSSStyle record](./api/CSSStyle.md)
shows the named npm class; classic loads `window.BFS.css`, not a
`window.BFS.CSSStyle` class. For explicit imperative replacement,
the [WebComponent record](./api/WebComponent.md) describes
`updateStylesheet(sheet)`; do not add a style-only attribute just to call it.

## Pick the integration that owns the behavior

For generic list rendering and getters, use the relevant Markup re-export
record. In classic mode the included Markup runtime is locked; in npm it can
resolve to a compatible newer Markup version, so read the actual resolution.
Use Router for navigable URL state and Intl for runtime locale changes. Do not
manually duplicate either in a component, and do not load a second Markup script
after the Web Component classic bundle.
