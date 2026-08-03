---
name: '{{t.pages.documentation.props_and_state.props.meta.props}}'
order: 5.1
layout: document
title: '{{t.pages.documentation.props_and_state.props.meta.props_webcomponent_by_before_semicolon}}'
description: '{{t.pages.documentation.props_and_state.props.meta.define_and_read_reactive_external_properties_mapped_to_observed_attributes}}'
---

## {{t.pages.documentation.props_and_state.props.content.props}}

{{t.pages.documentation.props_and_state.props.content.props_are_the_external_inputs_to_your_component_in_webcomponent_props_are_bound_to_html_attribut}}

### {{t.pages.documentation.props_and_state.props.content.declaring_props}}

{{t.pages.documentation.props_and_state.props.content.to_declare_reactive_props_add_their_attribute_names_to_the_static_observedattributes_array_webco}}

```javascript
import { WebComponent } from '@beforesemicolon/web-component'

class MyCard extends WebComponent {
    static observedAttributes = ['card-title', 'is-open']
}
```

### {{t.pages.documentation.props_and_state.props.content.case_conversion}}

{{t.pages.documentation.props_and_state.props.content.html_attributes_are_case_insensitive_and_conventionally_written_in_kebab_case_e_g_card_title_web}}

{{t.pages.documentation.props_and_state.props.content.for_example}}

- {{t.pages.documentation.props_and_state.props.content.card_title_becomes_cardtitle}}
- {{t.pages.documentation.props_and_state.props.content.is_open_becomes_isopen}}
- {{t.pages.documentation.props_and_state.props.content.disabled_remains_disabled}}

### {{t.pages.documentation.props_and_state.props.content.default_values}}

{{t.pages.documentation.props_and_state.props.content.you_can_specify_default_values_for_your_props_by_defining_them_as_class_fields_if_the_correspond}}

```javascript
import { WebComponent } from '@beforesemicolon/web-component'

class MyCard extends WebComponent {
    static observedAttributes = ['card-title', 'is-open']

    // Default values
    cardTitle = 'Untitled'
    isOpen = false
}
```

### {{t.pages.documentation.props_and_state.props.content.reading_props_in_templates}}

{{t.pages.documentation.props_and_state.props.content.inside_the_component_class_you_can_access_the_reactive_getter_functions_via_this_props}}

{{t.pages.documentation.props_and_state.props.content.since_these_props_are_reactive_signal_getters_they_should_be_invoked_as_functions_to_read_their}}

```javascript
import { WebComponent, html } from '@beforesemicolon/web-component'

class MyCard extends WebComponent {
    static observedAttributes = ['card-title', 'is-open']

    cardTitle = 'Untitled'
    isOpen = false

    render() {
        return html`
            <div
                class="card ${() => (this.props.isOpen() ? 'open' : 'closed')}"
            >
                <h3>${this.props.cardTitle}</h3>
                <slot></slot>
            </div>
        `
    }
}
```

> {{t.common.content.note}}
> {{t.pages.documentation.props_and_state.props.content.passing_this_props_cardtitle_directly_as_an_expression_in_the_template_without_calling_it_works}}

### {{t.pages.documentation.props_and_state.props.content.attribute_parsing_serialization}}

{{t.pages.documentation.props_and_state.props.content.webcomponent_does_not_serialize_and_deserialize_prop_values_as_a_component_data_protocol}}

{{t.pages.documentation.props_and_state.props.content.there_are_two_different_paths}}

1. {{t.pages.documentation.props_and_state.props.content.string_attributes_literal_html_attributes_and_setattribute_values_are_browser_strings_webcompone}}
2. {{t.pages.documentation.props_and_state.props.content.property_reference_values_values_assigned_through_the_component_property_including_values_passed}}
3. {{t.pages.documentation.props_and_state.props.content.primitive_property_values_when_you_assign_a_primitive_value_directly_to_the_component_property_w}}

```html
<my-card
    card-title="My Project"
    count="3"
    enabled="true"
    tags='["ui", "release"]'
></my-card>
```

{{t.pages.documentation.props_and_state.props.content.in_this_html_only_example_webcomponent_receives_strings_from_the_browser_and_parses_json_compati}}

- {{t.pages.documentation.props_and_state.props.content.card_title_remains_the_string_my_project}}
- {{t.pages.documentation.props_and_state.props.content.count_becomes_the_number_3}}
- {{t.pages.documentation.props_and_state.props.content.enabled_becomes_the_boolean_true}}
- {{t.pages.documentation.props_and_state.props.content.tags_becomes_the_array_ui_release}}

{{t.pages.documentation.props_and_state.props.content.when_a_parent_template_passes_a_non_primitive_value_keep_it_as_a_reference_instead_of_stringifyi}}

```javascript
import { WebComponent, html } from '@beforesemicolon/web-component'

const project = {
    title: 'Launch',
    owner: 'Design',
}

class ProjectShell extends WebComponent {
    render() {
        return html`<project-card project=${project}></project-card>`
    }
}
```

{{t.pages.documentation.props_and_state.props.content.the_project_prop_is_the_original_object_reference_it_is_not_converted_to_json_placed_in_the_dom}}

### {{t.pages.documentation.props_and_state.props.content.imperative_updates}}

{{t.pages.documentation.props_and_state.props.content.you_can_also_read_and_write_props_imperatively_directly_on_the_element_instance_primitive_values}}

```javascript
const card = document.querySelector('my-card')

// Read value imperatively
console.log(card.cardTitle) // Logs "My Project"

// Update value imperatively
card.cardTitle = 'Updated Title' // Syncs to attribute: card-title="Updated Title"
```

```javascript
const project = {
    title: 'Launch',
    tasks: ['Design', 'Build'],
}

card.project = project

console.log(card.props.project() === project) // true
console.log(card.hasAttribute('project')) // false
```

### {{t.pages.documentation.props_and_state.props.content.practical_component_example}}

```javascript
import { WebComponent, html } from '@beforesemicolon/web-component'

class PlanCard extends WebComponent {
    static observedAttributes = ['name', 'price', 'featured']
    name = 'Starter'
    price = 19
    featured = false

    render() {
        return html`
            <article
                class="${() =>
                    this.props.featured() ? 'featured' : 'standard'}"
            >
                <h3>${this.props.name}</h3>
                <strong>$${this.props.price}</strong>
                <slot></slot>
            </article>
        `
    }
}

customElements.define('plan-card', PlanCard)
```

```html
<plan-card name="Team" price="49" featured>
    Includes shared projects and priority support.
</plan-card>
```
