---
name: '{{t.pages.documentation.props_and_state.state.meta.state}}'
order: 5.2
layout: document
title: '{{t.pages.documentation.props_and_state.state.meta.state_webcomponent_by_before_semicolon}}'
description: '{{t.pages.documentation.props_and_state.state.meta.manage_reactive_local_component_state_using_initialstate_and_setstate}}'
---

## {{t.pages.documentation.props_and_state.state.content.state}}

{{t.pages.documentation.props_and_state.state.content.state_is_the_internal_reactive_data_owned_and_managed_exclusively_by_the_component_unlike_props}}

### {{t.pages.documentation.props_and_state.state.content.declaring_initial_state}}

{{t.pages.documentation.props_and_state.state.content.to_define_a_component_s_internal_state_assign_an_object_to_the_initialstate_class_property_each}}

```javascript
import { WebComponent } from '@beforesemicolon/web-component'

class CounterElement extends WebComponent {
    initialState = {
        count: 0,
        label: 'Clicks',
    }
}
```

### {{t.pages.documentation.props_and_state.state.content.reading_state_in_templates}}

{{t.pages.documentation.props_and_state.state.content.like_props_the_properties_of_this_state_are_reactive_getter_functions_you_can_access_the_values}}

- {{t.pages.documentation.props_and_state.state.content.pass_the_getter_directly_to_let_the_template_handle_reactive_bindings_this_state_count}}
- {{t.pages.documentation.props_and_state.state.content.invoke_it_as_a_function_when_executing_calculations_or_inside_conditional_blocks_this_state_coun}}

```javascript
import { WebComponent, html } from '@beforesemicolon/web-component'

class CounterElement extends WebComponent {
    initialState = {
        count: 0,
        label: 'Clicks',
    }

    render() {
        return html`
            <div>
                <span>${this.state.label}: ${this.state.count}</span>
            </div>
        `
    }
}
```

### {{t.pages.documentation.props_and_state.state.content.modifying_state_via_setstate}}

{{t.pages.documentation.props_and_state.state.content.to_update_state_reactively_call_this_setstate_this_method_accepts_either_a_partial_state_object}}

#### {{t.pages.documentation.props_and_state.state.content.object_merge_format}}

{{t.pages.documentation.props_and_state.state.content.you_can_pass_a_partial_object_containing_the_fields_you_want_to_update_webcomponent_will_merge_t}}

```javascript
// Updates only the count; label remains untouched
this.setState({ count: 10 })
```

#### {{t.pages.documentation.props_and_state.state.content.callback_format}}

{{t.pages.documentation.props_and_state.state.content.if_your_new_state_depends_on_the_previous_state_pass_a_callback_function_the_callback_receives_t}}

```javascript
this.setState((prev) => ({
    count: prev.count + 1,
}))
```

### {{t.pages.documentation.props_and_state.state.content.lifecycle_restrictions}}

{{t.pages.documentation.props_and_state.state.content.state_updates_trigger_dom_updates_because_of_this_calling_this_setstate_before_the_component_is}}

```javascript
class MyComponent extends WebComponent {
    initialState = { data: null }

    constructor() {
        super()
        // ERROR: Cannot update state while component is unmounted.
        this.setState({ data: 'foo' })
    }
}
```

{{t.pages.documentation.props_and_state.state.content.if_you_need_to_fetch_data_or_trigger_state_updates_as_soon_as_the_component_loads_do_so_in_the_o}}

```javascript
class MyComponent extends WebComponent {
    initialState = { data: null }

    onMount() {
        fetch('/api/data')
            .then((res) => res.json())
            .then((data) => {
                if (!this.mounted) return
                this.setState({ data })
            })
    }
}
```

### {{t.pages.documentation.props_and_state.state.content.derived_ui_example}}

{{t.pages.documentation.props_and_state.state.content.keep_the_source_state_intact_and_derive_display_values_inside_functions}}

```javascript
import { WebComponent, html, repeat } from '@beforesemicolon/web-component'

class SearchableList extends WebComponent {
    initialState = {
        query: '',
        items: ['Alpha', 'Beta', 'Gamma'],
    }

    results = () => {
        const query = this.state.query().toLowerCase()
        return this.state.items().filter((item) => {
            return item.toLowerCase().includes(query)
        })
    }

    render() {
        return html`
            <input
                value="${this.state.query}"
                oninput="${(event) =>
                    this.setState({ query: event.target.value })}"
            />
            <ul>
                ${repeat(
                    this.results,
                    (item) => html`<li>${item}</li>`,
                    () => html`<li>No matches.</li>`
                )}
            </ul>
        `
    }
}
```
