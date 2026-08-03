---
name: '{{t.pages.documentation.props_and_state.refs.meta.refs}}'
order: 5.3
layout: document
title: '{{t.pages.documentation.props_and_state.refs.meta.refs_webcomponent_by_before_semicolon}}'
description: '{{t.pages.documentation.props_and_state.refs.meta.safely_reference_and_interact_with_rendered_dom_elements_inside_your_templates}}'
---

## {{t.pages.documentation.props_and_state.refs.content.refs}}

{{t.pages.documentation.props_and_state.refs.content.while_declarative_programming_is_preferred_there_are_times_when_you_need_to_access_dom_elements}}

### {{t.pages.documentation.props_and_state.refs.content.binding_refs_in_templates}}

{{t.pages.documentation.props_and_state.refs.content.to_bind_a_dom_element_add_a_ref_attribute_with_a_unique_name_to_any_element_in_your_template}}

```javascript
import { WebComponent, html } from '@beforesemicolon/web-component'

class FocusInput extends WebComponent {
    render() {
        return html`
            <div>
                <input type="text" ref="textInput" placeholder="Type here..." />
                <button onclick="${this.focusInput}">Focus Input</button>
            </div>
        `
    }

    focusInput = () => {
        // We will access the element here
    }
}
```

### {{t.pages.documentation.props_and_state.refs.content.accessing_refs_via_this_refs}}

{{t.pages.documentation.props_and_state.refs.content.you_can_access_all_bound_elements_using_the_this_refs_getter}}

{{t.pages.documentation.props_and_state.refs.content.since_multiple_elements_can_share_the_same_ref_name_each_key_in_this_refs_returns_an_array_of_el}}

```javascript
focusInput = () => {
    const inputElement = this.refs.textInput?.[0]
    if (inputElement) {
        inputElement.focus()
    }
}
```

### {{t.pages.documentation.props_and_state.refs.content.refs_and_lifecycle}}

{{t.pages.documentation.props_and_state.refs.content.references_are_only_populated_after_the_component_is_rendered_and_mounted_they_are_not_available}}

{{t.pages.documentation.props_and_state.refs.content.if_you_need_to_perform_imperative_operations_immediately_when_the_element_appears_use_the_onmoun}}

```javascript
import { WebComponent, html } from '@beforesemicolon/web-component'

class AutoFocusInput extends WebComponent {
    render() {
        return html` <input type="text" ref="username" /> `
    }

    onMount() {
        // Element is now in the DOM, safe to access refs
        const input = this.refs.username?.[0]
        if (input) {
            input.focus()
        }
    }
}
```

### {{t.pages.documentation.props_and_state.refs.content.multiple_elements_dynamic_refs}}

{{t.pages.documentation.props_and_state.refs.content.you_can_use_the_same_ref_name_on_multiple_elements_to_group_them_webcomponent_will_return_all_re}}

```javascript
import { WebComponent, html } from '@beforesemicolon/web-component'

class ListSelector extends WebComponent {
    render() {
        return html`
            <ul>
                <li ref="item">Item A</li>
                <li ref="item">Item B</li>
                <li ref="item">Item C</li>
            </ul>
            <button onclick="${this.logItems}">Log Items</button>
        `
    }

    logItems = () => {
        const items = this.refs.item ?? []
        items.forEach((li, index) => {
            console.log(`Element ${index}:`, li.textContent)
        })
    }
}
```

{{t.pages.documentation.props_and_state.refs.content.refs_are_dynamic_if_elements_are_conditionally_rendered_e_g_using_helper_functions_like_when_the}}
