# Implement and review native custom elements

This guide applies to the release installed with this skill. Check the
[offline API index](./index.md) before assuming that another version exports
the same helper or uses the same lifecycle. Tests must exercise the intended
consumer's actual setup (npm, classic script, or both).

## Start with the contract, not the class

Before implementation, write the following contract. Keep each item small
enough that a consumer can use it without reading the source.

1. **Tag and registration:** the hyphenated tag and the entry that registers it.
2. **Inputs:** the observed lowercase attributes, corresponding camel-case
   fields, defaults, and any properties for structured values.
3. **Content:** a default slot for one insertion point, or named slots for
   genuinely distinct regions.
4. **Interactions:** each event's name, payload, dispatch point, and whether
   it bubbles, composes, or can be canceled.
5. **Styling contract:** any intentional CSS parts or documented theme tokens.
   Otherwise style the host and implementation without exporting internals.
6. **Migration:** if replacing an existing API, list it and identify callers.
   Keep backwards compatibility only when it is a real requirement.

Look for a fit in native HTML, registered components, and the installed stack
before adding classes. If a native button already supplies keyboard activation,
use it. If a compatible Cube control already supplies domain-independent
selection and focus, check its public record and use it, rather than
duplicating interactions in a new shadow root. Keep application routing,
authorization, business-specific styling, and store rules in their owning
applications. A package skill cannot supply those facts.

## Review bindings before introducing utility functions

Inside a template, bind getters by reference to preserve subscriptions.
Call a getter when you need its current value in an action or a selector.

**Avoid:** copying public props to internal state to mirror them in a template,
eagerly calling getters in bindings, and projecting conditions through
unnecessary wrapper functions.

```js
// These interpolations run now rather than meaning "listen for future changes".
render() {
    return html`
        <p>${this.props.heading()}</p>
        <button disabled="${this.props.disabled()}">Save</button>
    `
}
```

**Prefer:** a direct binding for passthrough and the [predicate
helpers](./index.md) for supported composition.

```js
// The component observes heading and disabled and declares saving in initialState.
render() {
    const cannotSave = or(this.props.disabled, this.state.saving)
    return html`
        <p>${this.props.heading}</p>
        <button type="button" disabled="${cannotSave}" onclick="${this.save}">
            Save
        </button>
    `
}
```

Compose helpers after the inputs exist. Do not initialize a class field with
`or(this.props.disabled, this.state.saving)`: a getter for internal state is
not available until first connection. Building the composition in `render`
keeps it declarative.

Use [`pick`](./api/pick.md) for a reactive nested property and
[`when`](./api/when.md) and [`is`](./api/is.md) for optional branches:

```js
const label = pick(this.props.record, 'details.label')
const canShowLabel = isNot(label, '')
return html`${when(canShowLabel, html`<span>${label}</span>`)}`
```

Do not use `pick` or an arrow for every static property of a currently rendered
row. A callback such as `(item) => html` with `item.label` is already clear
when the row value itself is not a getter. When callback arguments are necessary
to identify a row, a small forwarding closure belongs in the template; the
logic still belongs in one owner method.

## Separate collections from their rendered views

**Avoid** mutating the original collection, repeating sort or filter work in
row render callbacks, building one large HTML string, or keeping a second
independently editable copy.

**Prefer** a pure selector that computes a filtered or sorted view from its
sources, with [`repeat`](./api/repeat.md) owning rendering. Clearing the search
then reveals the same source records without an extra synchronization step.
Use stable domain IDs as repeat keys where a list can change.
Use JavaScript for real data transformations such as text normalization or a
domain sort; none of the template helpers replaces those transformations.
The [status picker](../examples/status-picker.js) demonstrates the distinction.

Use `initialState` for values that can change and that the UI needs to react
to. Use a normal instance field for nonreactive resources such as a request
controller. Use `setState` only while mounted; the component rejects updates
after removal. Prefer immutable updates where consumers depend on changed
object identities. Do not call `setState` or perform durable work inside
`render`.

## Treat public events as the interaction API

**Avoid** putting a function in `onclick` as a _public observed attribute_,
searching inside another element's shadow root, listening to two names for the
same outcome, or forcing the consumer to inspect `event.target` to reconstruct
domain data.

**Prefer** a concrete native control with one bound action, and dispatch a
custom event with complete, documented detail. Keep that detail small.
`this.dispatch` dispatches from the element and does not bubble, compose,
or request cancellation. Attach directly to the host. For an explicitly
delegated, cross-shadow, or cancelable contract, choose native `CustomEvent`
options intentionally and test them. Do not combine the helper and a native
dispatch for the same action.

```js
// Consumer code, outside the component.
picker.addEventListener('status-select', ({ detail }) => saveStatus(detail.id))
picker.items = availableStatuses
```

A slot is a content insertion point, not the activation target. Bind to a
concrete button and allow normal keyboard behavior. If the consumer owns
unknown children, delegate from the appropriate concrete container only when
needed and test the actual targets.

## Keep lifecycle and instance boundaries explicit

- Each connection gets its own resources. Use `onMount` for work that needs
  mounted DOM. Return a function that unsubscribes, cancels scheduled work,
  or aborts the connection's controller. Invalidate late async responses;
  checking only `mounted` is not enough if the same instance can reconnect
  before an earlier request completes.
- Use `onUpdate(name, next, previous)` for an observed input change that must
  trigger work. Do not refresh or rebuild a template just to show a prop
  value. Verify whether the hook reports the camel-case field before
  comparing a field name; this release does.
- Use `onAdoption` if the element needs to respond to moving to another
  document. `onDestroy` runs after mount cleanup during normal removal.
  Keep cleanup idempotent when resources may have already been disposed.
- Use a Markup `ref="name"` and `this.refs.name?.[0]` for concrete DOM nodes
  owned by this template. An external consumer uses documented domain
  properties, events, and native DOM APIs, not another component's internal
  getters, refs, update methods, lifecycle, or shadow tree.
- Use CSS variables to theme components and [`css`](./api/css.md) when style
  values truly react to state. Prefer static, component-owned CSS otherwise.
  Keep shadow DOM by default. Do not introduce style-only observed attributes,
  callback props, or undocumented CSS parts to work around composition.

Example guard for connection-owned asynchronous work:

```js
onMount() {
    const lifetime = new AbortController()
    void this.loadInitialData(lifetime.signal)
    return () => lifetime.abort()
}

loadInitialData = async (signal) => {
    try {
        const response = await fetch('/status', { signal })
        if (!response.ok) throw new Error('Unable to load status')
        const record = await response.json()
        if (!signal.aborted && this.mounted) this.setState({ record })
    } catch (error) {
        if (!signal.aborted) this.onError(error)
    }
}
```

The controller belongs to that connection; a stale response cannot write to
the next connection even if `mounted` is true again. A real network boundary
should validate the response before putting it in application state, and
should preserve the project's error and retry policy.

## Verify the behavior, not just the markup

Use the [local example instructions](../examples/README.md) to test without
network access. Render the real component and real template. Mock only
external boundaries where practical, not the component or helper under test.

1. Register and mount the component through the same entry as an actual
   consumer. Verify one attribute or property change updates the rendered
   result without replacing the component.
2. Interact through an accessible control. Verify keyboard activation,
   the resulting visible state, and exactly one event with the complete
   payload. Verify disabled or unavailable interactions do not emit it.
3. Change a filter and clear it. Check that the full original collection
   comes back. Verify empty and relevant error states.
4. Remove the component and assert listeners or observers were cleaned up.
   Reconnect and verify the component responds once. If it owns requests,
   complete an obsolete request after reconnection and verify it cannot
   overwrite current state.
5. Prefer roles, labels, input values and public properties; when a unit
   test must inspect the subject's shadow content, query its
   `contentRoot`, rather than assuming light DOM or reading an unrelated
   component's internals. Wait for observable reactive updates, not fixed
   sleeps.
6. Run project type checks, scoped component tests, and its checker when
   available. Reproduce the requested interaction in the actual target
   setup before describing it as verified.
