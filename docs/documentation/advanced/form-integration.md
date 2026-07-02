---
name: Form Integration
order: 8.1
title: Form Integration - WebComponent by Before Semicolon
description: Build form-associated custom elements with ElementInternals, submitted values, validation, disabled state, reset, and state restoration.
layout: document
---

## Form Integration

Custom elements can render inside a `<form>`, but that does not automatically make them form controls. A normal custom element is ignored by `FormData`, native constraint validation, fieldset disabled state, and form reset behavior unless it opts into the browser's **Form-Associated Custom Elements** API.

`@beforesemicolon/web-component` supports that native API directly. It exposes the element's `ElementInternals` instance as `this.internals`, while you use standard browser callbacks such as `formAssociatedCallback()`, `formDisabledCallback()`, `formResetCallback()`, and `formStateRestoreCallback()`.

### The Default Problem

Start with a component that wraps a native input:

```javascript
import { WebComponent, html } from '@beforesemicolon/web-component'

class TextField extends WebComponent {
    static observedAttributes = ['value', 'placeholder', 'name']

    value = ''
    placeholder = ''
    name = ''

    handleInput = (event) => {
        this.value = event.target.value
        this.dispatch('change', { value: this.value })
    }

    render() {
        return html`
            <input
                type="text"
                value="${this.props.value}"
                placeholder="${this.props.placeholder}"
                oninput="${this.handleInput}"
            />
        `
    }
}

customElements.define('text-field', TextField)
```

You can place it in a form:

```html
<form id="profile-form">
    <text-field name="firstName" placeholder="First name"></text-field>
    <button type="submit">Save</button>
</form>
```

But submitting the form will not include `firstName`:

```javascript
const form = document.querySelector('#profile-form')

form.addEventListener('submit', (event) => {
    event.preventDefault()

    const data = new FormData(event.currentTarget)

    console.log(Object.fromEntries(data)) // {}
})
```

The browser sees the custom element as an element, not as a successful form control with a submitted value.

### Enable Form Association

Add `static formAssociated = true` so the browser treats the custom element as form-associated:

```javascript
class TextField extends WebComponent {
    static formAssociated = true
    static observedAttributes = ['value', 'placeholder', 'name']
}
```

This is native custom element behavior, not a WebComponent-specific abstraction. It allows the element to be associated with a parent form and receive native form callbacks.

Form association alone does not submit a value. It only lets the custom element participate in the form system. You still need `this.internals.setFormValue()`.

### ElementInternals

`this.internals` exposes the native `ElementInternals` object created with `attachInternals()`.

```typescript
get internals(): ElementInternals
```

Use it to communicate with the parent form:

-   `setFormValue(value)`: controls what `FormData` receives for the element's `name`.
-   `setValidity(flags, message, anchor)`: controls native validity state.
-   `reportValidity()`: asks the browser to show validation UI.
-   `form`: returns the associated form.
-   `labels`: returns labels associated with the custom element.

### Register the Submitted Value

Call `setFormValue()` whenever the component value changes. The submitted field name comes from the custom element's own `name` attribute.

```javascript
handleInput = (event) => {
    const value = event.target.value

    this.value = value
    this.internals.setFormValue(value)
    this.dispatch('change', { value })
}
```

Now the same form produces useful data:

```javascript
console.log(Object.fromEntries(new FormData(form)))
// { firstName: "Ada" }
```

You can also register an initial value when the browser associates the element with a form:

```javascript
formAssociatedCallback() {
    this.internals.setFormValue(this.props.value())
}
```

### Validation

A form-associated custom element can use native validation instead of inventing a parallel error system. A common pattern is to delegate validity to the internal native control, then report that validity through `ElementInternals`.

```javascript
validate(report = false) {
    const input = this.refs.input?.[0]

    if (!input) return

    const validity = input.validity
    const message = validity.valid ? '' : this.props.error()

    this.internals.setValidity(
        validity,
        message,
        validity.valid ? undefined : input
    )

    if (report) {
        this.internals.reportValidity()
    }
}
```

`setValidity()` accepts the same validity flags exposed by native form controls. Passing an empty or valid `ValidityState` clears the error. Passing an anchor element lets the browser position native validation UI near the relevant internal control.

### Native Form Callbacks

Form-associated custom elements use native callback names. WebComponent does not wrap these because they are part of the browser platform.

#### `formAssociatedCallback(form)`

Called when the browser associates or disassociates the element with a form. Use this to register the initial submitted value and validity.

```javascript
formAssociatedCallback() {
    this.syncValue(this.props.value(), false)
}
```

#### `formDisabledCallback(disabled)`

Called when the element becomes disabled because its own `disabled` attribute changed or because an ancestor `<fieldset>` changed disabled state.

```javascript
formDisabledCallback(disabled) {
    this.disabled = disabled
}
```

If your template passes `this.props.disabled` into an internal input, assigning `this.disabled` updates the prop and keeps the rendered control in sync.

#### `formResetCallback()`

Called when the parent form resets. Use it to restore the component's default value, clear validation state, and update the native form value.

```javascript
formResetCallback() {
    this.syncValue('', false)
}
```

#### `formStateRestoreCallback(state, mode)`

Called when the browser restores form state, for example after navigation or autocomplete. Use it to restore the component's visible value and submitted value.

```javascript
formStateRestoreCallback(state, mode) {
    if (mode === 'restore' || mode === 'autocomplete') {
        this.syncValue(String(state ?? ''), false)
    }
}
```

### Complete Text Field

This example keeps the custom element API small while integrating with native form submission, validation, reset, fieldset disabled state, and restore behavior.

```javascript
import { WebComponent, html } from '@beforesemicolon/web-component'

class TextField extends WebComponent {
    static formAssociated = true
    static observedAttributes = [
        'value',
        'placeholder',
        'name',
        'pattern',
        'disabled',
        'required',
        'error',
    ]

    value = ''
    placeholder = ''
    name = ''
    pattern = ''
    disabled = false
    required = false
    error = 'Invalid field value.'

    formAssociatedCallback() {
        this.syncValue(this.props.value(), false)
    }

    formDisabledCallback(disabled) {
        this.disabled = disabled
    }

    formResetCallback() {
        this.syncValue('', false)
    }

    formStateRestoreCallback(state, mode) {
        if (mode === 'restore' || mode === 'autocomplete') {
            this.syncValue(String(state ?? ''), false)
        }
    }

    syncValue(value, report = true) {
        this.value = value
        this.internals.setFormValue(value)

        const input = this.refs.input?.[0]

        if (input) {
            const validity = input.validity

            this.internals.setValidity(
                validity,
                validity.valid ? '' : this.props.error(),
                validity.valid ? undefined : input
            )

            if (report) {
                this.internals.reportValidity()
            }
        }

        this.dispatch('change', { value })
    }

    handleInput = (event) => {
        this.syncValue(event.target.value)
    }

    render() {
        const { error, ...inputAttrs } = this.props

        return html`
            <input
                ${inputAttrs}
                ref="input"
                part="input"
                type="text"
                oninput="${this.handleInput}"
            />
        `
    }
}

customElements.define('text-field', TextField)
```

Use it like a normal form field:

```html
<form id="profile-form">
    <text-field
        name="firstName"
        placeholder="First name"
        pattern="[A-Za-z]+"
        required
        error="First name can only contain letters."
    ></text-field>

    <button type="reset">Reset</button>
    <button type="submit">Save</button>
</form>
```

### Practical Rules

-   Add `static formAssociated = true` only to components that should behave as native form controls.
-   Always call `this.internals.setFormValue()` when the submitted value changes.
-   Keep the submitted value and the visible internal control value synchronized.
-   Use `this.internals.setValidity()` when the custom element should participate in native constraint validation.
-   Use `formDisabledCallback()` to respond to ancestor `<fieldset disabled>` changes.
-   Use `formResetCallback()` to restore defaults when the parent form resets.
-   Use `formStateRestoreCallback()` for browser restore and autocomplete flows.
-   Keep component events like `change` useful for app code, but do not rely on events for native form submission.
