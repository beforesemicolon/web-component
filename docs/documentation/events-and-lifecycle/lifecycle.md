---
name: '{{t.pages.documentation.events_and_lifecycle.lifecycle.meta.lifecycle}}'
order: 7.2
title: '{{t.pages.documentation.events_and_lifecycle.lifecycle.meta.lifecycle_webcomponent_by_before_semicolon}}'
description: '{{t.pages.documentation.events_and_lifecycle.lifecycle.meta.learn_how_to_hook_into_key_execution_stages_of_your_webcomponent_using_onmount_ondestroy_onupdat}}'
layout: document
---

## {{t.pages.documentation.events_and_lifecycle.lifecycle.content.lifecycle}}

{{t.pages.documentation.events_and_lifecycle.lifecycle.content.every_beforesemicolon_web_component_instance_transitions_through_a_series_of_lifecycle_phases_st}}

{{t.pages.documentation.events_and_lifecycle.lifecycle.content.instead_of_dealing_with_native_custom_element_callback_names_beforesemicolon_web_component_provi}}

---

### {{t.pages.documentation.events_and_lifecycle.lifecycle.content.lifecycle_hook_methods}}

#### {{t.pages.documentation.events_and_lifecycle.lifecycle.content.onmount}}

{{t.pages.documentation.events_and_lifecycle.lifecycle.content.called_when_the_element_is_first_connected_to_the_dom_this_is_the_ideal_place_to_run_setups_such}}

- {{t.pages.documentation.events_and_lifecycle.lifecycle.content.cleanup_function_the_onmount_method_can_optionally_return_a_cleanup_function_if_provided_this_fu}}

```javascript
onMount() {
    console.log('Component is now in the DOM.');

    const onResize = () => console.log('Resized');
    window.addEventListener('resize', onResize);

    // Return cleanup callback
    return () => {
        window.removeEventListener('resize', onResize);
    };
}
```

#### {{t.pages.documentation.events_and_lifecycle.lifecycle.content.ondestroy}}

{{t.pages.documentation.events_and_lifecycle.lifecycle.content.called_when_the_element_is_disconnected_and_removed_from_the_dom_use_this_hook_for_final_cleanup}}

```javascript
onDestroy() {
    console.log('Component has been removed from the DOM.');
}
```

#### {{t.pages.documentation.events_and_lifecycle.lifecycle.content.onupdate_name_newvalue_oldvalue}}

{{t.pages.documentation.events_and_lifecycle.lifecycle.content.called_when_an_observed_attribute_declared_in_static_observedattributes_changes_value_this_hook}}

```typescript
onUpdate(name: string, newValue: unknown, oldValue: unknown): void
```

```javascript
static observedAttributes = ['theme'];

onUpdate(name, newValue, oldValue) {
    if (name === 'theme') {
        console.log(`Theme changed from ${oldValue} to ${newValue}`);
    }
}
```

#### {{t.pages.documentation.events_and_lifecycle.lifecycle.content.onadoption}}

{{t.pages.documentation.events_and_lifecycle.lifecycle.content.called_when_the_browser_s_native_adoptedcallback_fires_which_happens_when_the_custom_element_is}}

```javascript
onAdoption() {
    console.log('Component has been adopted into a new document.');
}
```

#### {{t.pages.documentation.events_and_lifecycle.lifecycle.content.onerror_error}}

{{t.pages.documentation.events_and_lifecycle.lifecycle.content.called_when_webcomponent_catches_an_error_from_rendering_state_updates_stylesheet_updates_lifecy}}

```typescript
onError(error: Error | unknown): void
```

```javascript
onError(error) {
    reportError(error)
}
```

{{t.pages.documentation.events_and_lifecycle.lifecycle.content.use_onerror_for_component_local_error_reporting_or_fallback_state_avoid_throwing_inside_onerror}}

---

### {{t.pages.documentation.events_and_lifecycle.lifecycle.content.side_effects_with_effect}}

{{t.pages.documentation.events_and_lifecycle.lifecycle.content.because_webcomponent_is_powered_by_markup_you_can_use_markup_s_effect_helper_for_reactive_side_e}}

{{t.pages.documentation.events_and_lifecycle.lifecycle.content.use_effect_when_the_side_effect_should_follow_reactive_props_or_state_keep_it_out_of_render_so_r}}

```javascript
import { WebComponent, effect, html } from '@beforesemicolon/web-component'

class SaveStatus extends WebComponent {
    static observedAttributes = ['status']

    status = 'idle'

    onMount() {
        return effect(() => {
            document.title = `Status: ${this.props.status()}`
        })
    }

    render() {
        return html`<p>${this.props.status}</p>`
    }
}
```

{{t.pages.documentation.events_and_lifecycle.lifecycle.content.the_function_returned_by_effect_unsubscribes_the_effect_returning_it_from_onmount_ties_the_effec}}

### {{t.pages.documentation.events_and_lifecycle.lifecycle.content.checking_mount_status}}

{{t.pages.documentation.events_and_lifecycle.lifecycle.content.you_can_check_whether_the_component_is_currently_connected_to_the_dom_using_the_this_mounted_boo}}

```typescript
get mounted(): boolean
```

{{t.pages.documentation.events_and_lifecycle.lifecycle.content.this_is_particularly_useful_when_performing_asynchronous_tasks_like_fetching_data_to_prevent_upd}}

```javascript
async fetchData() {
    const data = await api.getDetails();
    if (this.mounted) {
        this.setState({ data });
    }
}
```

---

### {{t.pages.documentation.events_and_lifecycle.lifecycle.content.lifecycle_order_of_execution}}

{{t.pages.documentation.events_and_lifecycle.lifecycle.content.understanding_the_exact_sequence_in_which_callbacks_are_invoked_helps_in_structuring_components}}

1. {{t.pages.documentation.events_and_lifecycle.lifecycle.content.constructor}}
   {{t.pages.documentation.events_and_lifecycle.lifecycle.content.the_browser_instantiates_the_element_beforesemicolon_web_component_maps_static_observedattribute}}
2. {{t.pages.documentation.events_and_lifecycle.lifecycle.content.render}}
   {{t.pages.documentation.events_and_lifecycle.lifecycle.content.called_during_the_connection_phase_the_component_renders_its_template_and_appends_it_to_its_cont}}
3. {{t.pages.documentation.events_and_lifecycle.lifecycle.content.stylesheet_configuration}}
   {{t.pages.documentation.events_and_lifecycle.lifecycle.content.initializes_and_applies_stylesheets_e_g_from_the_stylesheet_property_or_the_css_tagged_template}}
4. {{t.pages.documentation.events_and_lifecycle.lifecycle.content.onmount_2}}
   {{t.pages.documentation.events_and_lifecycle.lifecycle.content.triggered_immediately_after_rendering_is_complete_and_stylesheets_are_attached_the_return_value}}
5. {{t.pages.documentation.events_and_lifecycle.lifecycle.content.effect_callbacks}}
   {{t.pages.documentation.events_and_lifecycle.lifecycle.content.markup_effects_created_during_onmount_run_immediately_and_re_run_later_when_their_tracked_reacti}}
6. {{t.pages.documentation.events_and_lifecycle.lifecycle.content.onupdate}}
   {{t.pages.documentation.events_and_lifecycle.lifecycle.content.runs_every_time_an_observed_attribute_changes_only_while_the_component_is_mounted}}
7. {{t.pages.documentation.events_and_lifecycle.lifecycle.content.adoptedcallback_onadoption}}
   {{t.pages.documentation.events_and_lifecycle.lifecycle.content.runs_when_the_browser_adopts_the_element_into_a_different_document}}
8. {{t.pages.documentation.events_and_lifecycle.lifecycle.content.mount_cleanup}}
   {{t.pages.documentation.events_and_lifecycle.lifecycle.content.runs_the_cleanup_function_returned_by_onmount_if_any_when_the_element_disconnects}}
9. {{t.pages.documentation.events_and_lifecycle.lifecycle.content.ondestroy_2}}
   {{t.pages.documentation.events_and_lifecycle.lifecycle.content.runs_immediately_after_the_mount_cleanup_function_finishes}}
10. {{t.pages.documentation.events_and_lifecycle.lifecycle.content.onerror}}
    {{t.pages.documentation.events_and_lifecycle.lifecycle.content.runs_whenever_webcomponent_catches_an_error_from_one_of_its_guarded_rendering_update_stylesheet_lifec}}
