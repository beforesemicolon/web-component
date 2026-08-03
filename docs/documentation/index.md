---
name: '{{t.pages.documentation.index.meta.what_is_webcomponent}}'
order: 1
title: '{{t.pages.documentation.index.meta.what_is_webcomponent_webcomponent_by_before_semicolon}}'
description: '{{t.pages.documentation.index.meta.webcomponent_is_a_reactive_layer_on_top_of_native_web_components_api_powered_by_markup_it_adds_s}}'
layout: document
---

## {{t.pages.documentation.index.content.what_is_webcomponent}}

{{t.pages.documentation.index.content.beforesemicolon_web_component_is_a_lightweight_compiler_free_reactive_layer_built_on_top_of_the}}

{{t.pages.documentation.index.content.by_design_the_native_web_components_apis_are_low_level_and_verbose_writing_raw_custom_elements_o}}

### {{t.pages.documentation.index.content.key_enhancements}}

{{t.pages.documentation.index.content.webcomponent_wraps_native_custom_elements_with_several_major_enhancements}}

- {{t.pages.documentation.index.content.state_management_reactive_internal_state_that_triggers_targeted_dom_updates_when_mutated_via_set}}
- {{t.pages.documentation.index.content.props_management_maps_observed_attributes_directly_to_reactive_properties_handling_automatic_cam}}
- {{t.pages.documentation.index.content.component_styling_first_class_support_for_cssstylesheet_objects_css_import_assertions_and_reacti}}
- {{t.pages.documentation.index.content.form_integration_out_of_the_box_support_for_form_associated_custom_elements_exposing_standard_fo}}
- {{t.pages.documentation.index.content.lifecycles_predictable_wrappers_around_native_element_connection_callbacks_supporting_cleanup_fu}}
- {{t.pages.documentation.index.content.template_refs_easily_reference_and_query_rendered_dom_elements_without_using_verbose_queryselect}}
- {{t.pages.documentation.index.content.error_handling_a_centralized_onerror_hook_to_catch_and_process_runtime_rendering_or_lifecycle_er}}
- {{t.pages.documentation.index.content.event_dispatching_a_clean_dispatch_helper_to_fire_standard_customevent_instances_with_typed_deta}}

### {{t.pages.documentation.index.content.start_here}}

- {{t.common.content.get_started_get_started_md}}
- {{t.common.content.guide_best_practices_guide_md}}
- {{t.pages.documentation.index.content.ai_guide_ai_md}}
- {{t.common.content.creating_components_fundamentals_creating_components_md}}

### {{t.pages.documentation.index.content.full_example}}

{{t.pages.documentation.index.content.here_is_a_complete_reactive_counter_component_implemented_in_typescript_showcasing_props_state_e}}

```typescript
// import everything from Markup as if you are using it directly
import { WebComponent, html } from '@beforesemicolon/web-component'
import stylesheet from './counter-app.css' with { type: 'css' }

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

    countUp = (e: Event) => {
        e.stopPropagation()
        e.preventDefault()

        this.setState(({ count }) => ({ count: count + 1 }))
        this.dispatch('click')
    }

    render() {
        return html`
            <p>${this.state.count}</p>
            <button type="button" onclick="${this.countUp}">
                ${this.props.label}
            </button>
        `
    }
}

customElements.define('counter-app', CounterApp)
```

{{t.pages.documentation.index.content.in_your_html_you_can_simply_use_the_tag_normally}}

```html
<counter-app label="count up"></counter-app>
```
