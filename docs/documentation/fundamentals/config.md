---
name: '{{t.pages.documentation.fundamentals.config.meta.config}}'
order: 4.3
title: '{{t.pages.documentation.fundamentals.config.meta.config_webcomponent_by_before_semicolon}}'
description: '{{t.pages.documentation.fundamentals.config.meta.configure_shadow_dom_shadow_root_options_on_your_components}}'
layout: document
---

## {{t.pages.documentation.fundamentals.config.content.config}}

{{t.pages.documentation.fundamentals.config.content.by_default_beforesemicolon_web_component_creates_an_encapsulated_shadow_dom_for_each_component_y}}

### {{t.pages.documentation.fundamentals.config.content.default_configuration}}

{{t.pages.documentation.fundamentals.config.content.if_you_do_not_define_a_custom_config_property_the_component_defaults_to_the_following_settings}}

```javascript
class MyComponent extends WebComponent {
    config = {
        shadow: true,
        mode: 'open',
        delegatesFocus: false,
        clonable: false,
        serializable: false,
        slotAssignment: 'named',
    }
}
```

### {{t.pages.documentation.fundamentals.config.content.disabling_shadow_dom}}

{{t.pages.documentation.fundamentals.config.content.in_some_scenarios_you_might_want_a_component_to_render_directly_into_the_light_dom_e_g_to_inheri}}

```javascript
import { WebComponent, html } from '@beforesemicolon/web-component'

class LightDomElement extends WebComponent {
    config = {
        shadow: false,
    }

    render() {
        return html` <p>I am rendered directly in the light DOM!</p> `
    }
}

customElements.define('light-dom-element', LightDomElement)
```

> {{t.common.content.note}}
> {{t.pages.documentation.fundamentals.config.content.when_shadow_false_is_configured_this_contentroot_will_reference_the_component_element_itself_rat}}

---

### {{t.pages.documentation.fundamentals.config.content.shadow_dom_configuration_options}}

{{t.pages.documentation.fundamentals.config.content.when_shadow_is_set_to_true_the_rest_of_the_configuration_properties_are_passed_directly_to_the_n}}

{{t.pages.documentation.fundamentals.config.content.option_type_default_description}}
| :--------------- | :-------------------- | :-------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
{{t.pages.documentation.fundamentals.config.content.shadow_boolean_true_enables_or_disables_shadow_dom_rendering}}
{{t.pages.documentation.fundamentals.config.content.mode_open_closed_open_defines_accessibility_to_the_shadow_root_from_outside_javascript_if_open_t}}
{{t.pages.documentation.fundamentals.config.content.delegatesfocus_boolean_false_when_set_to_true_clicking_a_non_focusable_part_of_the_shadow_dom_de}}
{{t.pages.documentation.fundamentals.config.content.clonable_boolean_false_if_set_to_true_the_shadow_root_can_be_cloned_using_clonenode_supported_in}}
{{t.pages.documentation.fundamentals.config.content.serializable_boolean_false_if_set_to_true_the_shadow_root_will_be_serialized_when_using_apis_lik}}
{{t.pages.documentation.fundamentals.config.content.slotassignment_named_manual_named_controls_how_nodes_are_assigned_to_slots_named_assigns_element}}

#### {{t.pages.documentation.fundamentals.config.content.example_focus_delegation_closed_shadow_root}}

{{t.pages.documentation.fundamentals.config.content.here_is_an_example_of_configuring_a_closed_shadow_root_with_focus_delegation_enabled}}

```javascript
import { WebComponent, html } from '@beforesemicolon/web-component'

class FocusInput extends WebComponent {
    config = {
        shadow: true,
        mode: 'closed',
        delegatesFocus: true,
    }

    render() {
        return html`
            <div class="wrapper">
                <label for="input">Enter text:</label>
                <input id="input" type="text" />
            </div>
        `
    }
}

customElements.define('focus-input', FocusInput)
```
