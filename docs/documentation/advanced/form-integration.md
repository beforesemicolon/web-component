---
name: '{{t.pages.documentation.advanced.form_integration.meta.form_integration}}'
order: 8.1
title: '{{t.pages.documentation.advanced.form_integration.meta.form_integration_webcomponent_by_before_semicolon}}'
description: '{{t.pages.documentation.advanced.form_integration.meta.build_form_associated_custom_elements_with_elementinternals_submitted_values_validation_disabled}}'
layout: document
---

## {{t.pages.documentation.advanced.form_integration.content.form_integration}}

{{t.pages.documentation.advanced.form_integration.content.custom_elements_can_render_inside_a_but_that_does_not_automatically_make_them_form_controls_a_no}}

{{t.pages.documentation.advanced.form_integration.content.beforesemicolon_web_component_supports_that_native_api_directly_it_exposes_the_element_s_element}}

### {{t.pages.documentation.advanced.form_integration.content.the_default_problem}}

{{t.pages.documentation.advanced.form_integration.content.start_with_a_component_that_wraps_a_native_input}}

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

{{t.pages.documentation.advanced.form_integration.content.you_can_place_it_in_a_form}}

```html
<form id="profile-form">
    <text-field name="firstName" placeholder="First name"></text-field>
    <button type="submit">Save</button>
</form>
```

{{t.pages.documentation.advanced.form_integration.content.but_submitting_the_form_will_not_include_firstname}}

```javascript
const form = document.querySelector('#profile-form')

form.addEventListener('submit', (event) => {
    event.preventDefault()

    const data = new FormData(event.currentTarget)

    console.log(Object.fromEntries(data)) // {}
})
```

{{t.pages.documentation.advanced.form_integration.content.the_browser_sees_the_custom_element_as_an_element_not_as_a_successful_form_control_with_a_submit}}

### {{t.pages.documentation.advanced.form_integration.content.enable_form_association}}

{{t.pages.documentation.advanced.form_integration.content.add_static_formassociated_true_so_the_browser_treats_the_custom_element_as_form_associated}}

```javascript
class TextField extends WebComponent {
    static formAssociated = true
    static observedAttributes = ['value', 'placeholder', 'name']
}
```

{{t.pages.documentation.advanced.form_integration.content.this_is_native_custom_element_behavior_not_a_webcomponent_specific_abstraction_it_allows_the_ele}}

{{t.pages.documentation.advanced.form_integration.content.form_association_alone_does_not_submit_a_value_it_only_lets_the_custom_element_participate_in_th}}

### {{t.pages.documentation.advanced.form_integration.content.elementinternals}}

{{t.pages.documentation.advanced.form_integration.content.this_internals_exposes_the_native_elementinternals_object_created_with_attachinternals}}

```typescript
get internals(): ElementInternals
```

{{t.pages.documentation.advanced.form_integration.content.use_it_to_communicate_with_the_parent_form}}

- {{t.pages.documentation.advanced.form_integration.content.setformvalue_value_controls_what_formdata_receives_for_the_element_s_name}}
- {{t.pages.documentation.advanced.form_integration.content.setvalidity_flags_message_anchor_controls_native_validity_state}}
- {{t.pages.documentation.advanced.form_integration.content.reportvalidity_asks_the_browser_to_show_validation_ui}}
- {{t.pages.documentation.advanced.form_integration.content.form_returns_the_associated_form}}
- {{t.pages.documentation.advanced.form_integration.content.labels_returns_labels_associated_with_the_custom_element}}

### {{t.pages.documentation.advanced.form_integration.content.register_the_submitted_value}}

{{t.pages.documentation.advanced.form_integration.content.call_setformvalue_whenever_the_component_value_changes_the_submitted_field_name_comes_from_the_c}}

```javascript
handleInput = (event) => {
    const value = event.target.value

    this.value = value
    this.internals.setFormValue(value)
    this.dispatch('change', { value })
}
```

{{t.pages.documentation.advanced.form_integration.content.now_the_same_form_produces_useful_data}}

```javascript
console.log(Object.fromEntries(new FormData(form)))
// { firstName: "Ada" }
```

{{t.pages.documentation.advanced.form_integration.content.you_can_also_register_an_initial_value_when_the_browser_associates_the_element_with_a_form}}

```javascript
formAssociatedCallback() {
    this.internals.setFormValue(this.props.value())
}
```

### {{t.pages.documentation.advanced.form_integration.content.validation}}

{{t.pages.documentation.advanced.form_integration.content.a_form_associated_custom_element_can_use_native_validation_instead_of_inventing_a_parallel_error}}

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

{{t.pages.documentation.advanced.form_integration.content.setvalidity_accepts_the_same_validity_flags_exposed_by_native_form_controls_passing_an_empty_or}}

### {{t.pages.documentation.advanced.form_integration.content.native_form_callbacks}}

{{t.pages.documentation.advanced.form_integration.content.form_associated_custom_elements_use_native_callback_names_webcomponent_does_not_wrap_these_becau}}

#### {{t.pages.documentation.advanced.form_integration.content.formassociatedcallback_form}}

{{t.pages.documentation.advanced.form_integration.content.called_when_the_browser_associates_or_disassociates_the_element_with_a_form_use_this_to_register}}

```javascript
formAssociatedCallback() {
    this.syncValue(this.props.value(), false)
}
```

#### {{t.pages.documentation.advanced.form_integration.content.formdisabledcallback_disabled}}

{{t.pages.documentation.advanced.form_integration.content.called_when_the_element_becomes_disabled_because_its_own_disabled_attribute_changed_or_because_a}}

```javascript
formDisabledCallback(disabled) {
    this.disabled = disabled
}
```

{{t.pages.documentation.advanced.form_integration.content.if_your_template_passes_this_props_disabled_into_an_internal_input_assigning_this_disabled_updat}}

#### {{t.pages.documentation.advanced.form_integration.content.formresetcallback}}

{{t.pages.documentation.advanced.form_integration.content.called_when_the_parent_form_resets_use_it_to_restore_the_component_s_default_value_clear_validat}}

```javascript
formResetCallback() {
    this.syncValue('', false)
}
```

#### {{t.pages.documentation.advanced.form_integration.content.formstaterestorecallback_state_mode}}

{{t.pages.documentation.advanced.form_integration.content.called_when_the_browser_restores_form_state_for_example_after_navigation_or_autocomplete_use_it}}

```javascript
formStateRestoreCallback(state, mode) {
    if (mode === 'restore' || mode === 'autocomplete') {
        this.syncValue(String(state ?? ''), false)
    }
}
```

### {{t.pages.documentation.advanced.form_integration.content.complete_text_field}}

{{t.pages.documentation.advanced.form_integration.content.this_example_keeps_the_custom_element_api_small_while_integrating_with_native_form_submission_va}}

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

{{t.pages.documentation.advanced.form_integration.content.use_it_like_a_normal_form_field}}

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

### {{t.pages.documentation.advanced.form_integration.content.practical_rules}}

- {{t.pages.documentation.advanced.form_integration.content.add_static_formassociated_true_only_to_components_that_should_behave_as_native_form_controls}}
- {{t.pages.documentation.advanced.form_integration.content.always_call_this_internals_setformvalue_when_the_submitted_value_changes}}
- {{t.pages.documentation.advanced.form_integration.content.keep_the_submitted_value_and_the_visible_internal_control_value_synchronized}}
- {{t.pages.documentation.advanced.form_integration.content.use_this_internals_setvalidity_when_the_custom_element_should_participate_in_native_constraint_v}}
- {{t.pages.documentation.advanced.form_integration.content.use_formdisabledcallback_to_respond_to_ancestor_changes}}
- {{t.pages.documentation.advanced.form_integration.content.use_formresetcallback_to_restore_defaults_when_the_parent_form_resets}}
- {{t.pages.documentation.advanced.form_integration.content.use_formstaterestorecallback_for_browser_restore_and_autocomplete_flows}}
- {{t.pages.documentation.advanced.form_integration.content.keep_component_events_like_change_useful_for_app_code_but_do_not_rely_on_events_for_native_form}}
