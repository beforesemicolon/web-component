---
name: '{{t.common.content.get_started}}'
order: 2
title: '{{t.pages.documentation.get_started.meta.get_started_webcomponent_by_before_semicolon}}'
description: '{{t.pages.documentation.get_started.meta.learn_how_to_build_your_first_reactive_web_component_using_the_webcomponent_class}}'
layout: document
---

## {{t.common.content.get_started}}

{{t.pages.documentation.get_started.content.this_tutorial_will_guide_you_step_by_step_through_creating_registering_templating_and_using_your}}

### {{t.pages.documentation.get_started.content.step_1_declaring_the_component_class}}

{{t.pages.documentation.get_started.content.to_create_a_new_component_declare_a_class_that_extends_webcomponent}}

```javascript
import { WebComponent } from '@beforesemicolon/web-component'

class MyButton extends WebComponent {
    // Component logic goes here
}
```

### {{t.pages.documentation.get_started.content.step_2_defining_the_custom_element_tag}}

{{t.pages.documentation.get_started.content.register_the_component_class_in_the_global_customelementregistry_using_the_standard_customelemen}}

{{t.pages.documentation.get_started.content.custom_element_names_must_contain_at_least_one_hyphen_and_should_be_written_in_lowercase_kebab_c}}

```javascript
customElements.define('my-button', MyButton)
```

### {{t.pages.documentation.get_started.content.step_3_adding_a_template}}

{{t.pages.documentation.get_started.content.to_render_content_define_a_render_method_in_your_class_the_method_should_return_an_htmltemplate}}

```javascript
import { WebComponent, html } from '@beforesemicolon/web-component'

class MyButton extends WebComponent {
    render() {
        return html` <button type="button">Click Me</button> `
    }
}

customElements.define('my-button', MyButton)
```

### {{t.pages.documentation.get_started.content.step_4_using_the_custom_element_in_html}}

{{t.pages.documentation.get_started.content.once_the_custom_element_is_registered_you_can_place_the_tag_anywhere_in_your_html_document}}

```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <title>WebComponent Tutorial</title>
        <!-- Include the compiled script containing your component definitions -->
        <script type="module" src="./my-button.js"></script>
    </head>
    <body>
        <my-button></my-button>
    </body>
</html>
```

### {{t.pages.documentation.get_started.content.next_steps}}

{{t.pages.documentation.get_started.content.now_that_you_have_built_your_first_web_component_explore_the_core_features_that_make_beforesemic}}

- {{t.pages.documentation.get_started.content.reactive_props_props_and_state_props_md_pass_data_into_your_components_and_handle_attribute_upda}}
- {{t.pages.documentation.get_started.content.reactive_state_props_and_state_state_md_manage_internal_state_and_automatically_trigger_surgical}}
- {{t.pages.documentation.get_started.content.lifecycle_hooks_events_and_lifecycle_lifecycle_md_run_setup_and_cleanup_code_with_onmount_and_on}}
