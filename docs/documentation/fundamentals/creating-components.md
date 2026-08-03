---
name: '{{t.pages.documentation.fundamentals.creating_components.meta.creating_components}}'
order: 4.1
title: '{{t.pages.documentation.fundamentals.creating_components.meta.creating_components_webcomponent_by_before_semicolon}}'
description: '{{t.pages.documentation.fundamentals.creating_components.meta.learn_how_to_subclass_webcomponent_and_register_your_custom_elements}}'
layout: document
---

## {{t.pages.documentation.fundamentals.creating_components.content.creating_components}}

{{t.pages.documentation.fundamentals.creating_components.content.to_create_a_new_custom_element_with_beforesemicolon_web_component_you_subclass_the_webcomponent}}

{{t.pages.documentation.fundamentals.creating_components.content.here_is_a_basic_example_of_a_component}}

```javascript
import { WebComponent, html } from '@beforesemicolon/web-component'

class MyElement extends WebComponent {
    render() {
        return html`<p>Hello from MyElement!</p>`
    }
}

customElements.define('my-element', MyElement)
```

### {{t.pages.documentation.fundamentals.creating_components.content.tag_naming_requirements}}

{{t.pages.documentation.fundamentals.creating_components.content.custom_element_tag_names_must_adhere_to_the_standard_html_specification}}

1. {{t.pages.documentation.fundamentals.creating_components.content.must_contain_at_least_one_hyphen_this_distinguishes_custom_elements_from_standard_html_elements}}
2. {{t.pages.documentation.fundamentals.creating_components.content.must_start_with_a_lowercase_ascii_letter_e_g_a_z}}
3. {{t.pages.documentation.fundamentals.creating_components.content.cannot_contain_uppercase_letters_standard_html_parsers_treat_tag_names_as_case_insensitive_so_cu}}

### {{t.pages.documentation.fundamentals.creating_components.content.subclassing_webcomponent}}

{{t.pages.documentation.fundamentals.creating_components.content.the_webcomponent_class_inherits_from_the_native_htmlelement_this_means_your_component_is_a_nativ}}

### {{t.pages.documentation.fundamentals.creating_components.content.reserved_properties}}

{{t.pages.documentation.fundamentals.creating_components.content.because_webcomponent_and_the_native_htmlelement_define_essential_properties_and_methods_for_life}}

{{t.pages.documentation.fundamentals.creating_components.content.below_is_the_complete_list_of_reserved_property_names_that_cannot_be_overridden_or_declared_in_o}}

#### {{t.pages.documentation.fundamentals.creating_components.content.base_configuration_styling}}

- {{t.pages.documentation.fundamentals.creating_components.content.config_used_to_define_shadow_dom_configuration}}
- {{t.pages.documentation.fundamentals.creating_components.content.stylesheet_used_to_define_scoped_stylesheets_e_g_via_css_tagged_templates}}
- {{t.pages.documentation.fundamentals.creating_components.content.updatestylesheet_sheet_method_to_dynamically_update_replace_the_stylesheet}}

#### {{t.pages.documentation.fundamentals.creating_components.content.reactivity_internal_refs}}

- {{t.pages.documentation.fundamentals.creating_components.content.props_object_containing_reactive_prop_getters}}
- {{t.pages.documentation.fundamentals.creating_components.content.initialstate_object_containing_initial_values_for_internal_state}}
- {{t.pages.documentation.fundamentals.creating_components.content.state_object_containing_reactive_state_getters}}
- {{t.pages.documentation.fundamentals.creating_components.content.setstate_newstate_callback_method_used_to_reactively_update_the_internal_state}}
- {{t.pages.documentation.fundamentals.creating_components.content.refs_object_containing_references_to_elements_marked_with_the_ref_attribute_in_the_template}}

#### {{t.pages.documentation.fundamentals.creating_components.content.dom_shadow_roots}}

- {{t.pages.documentation.fundamentals.creating_components.content.mounted_boolean_getter_indicating_if_the_component_is_currently_connected_to_the_dom}}
- {{t.pages.documentation.fundamentals.creating_components.content.contentroot_getter_returning_the_render_target_shadowroot_or_the_element_itself_if_shadow_dom_is}}
- {{t.pages.documentation.fundamentals.creating_components.content.root_getter_returning_the_ancestor_shadow_root_or_document_of_the_element}}
- {{t.pages.documentation.fundamentals.creating_components.content.internals_getter_returning_the_elementinternals_instance_via_attachinternals_useful_for_form_ass}}
- {{t.pages.documentation.fundamentals.creating_components.content.render_method_that_returns_the_html_template_or_node_to_be_rendered}}
- {{t.pages.documentation.fundamentals.creating_components.content.dispatch_name_detail_method_to_fire_custom_dom_events_easily}}

#### {{t.pages.documentation.fundamentals.creating_components.content.lifecycle_methods}}

- {{t.pages.documentation.fundamentals.creating_components.content.connectedcallback_native_element_connection_handler_use_onmount_instead_for_custom_behavior}}
- {{t.pages.documentation.fundamentals.creating_components.content.attributechangedcallback_name_oldvalue_newvalue_native_attribute_change_handler_use_onupdate_ins}}
- {{t.pages.documentation.fundamentals.creating_components.content.disconnectedcallback_native_element_disconnection_handler_use_ondestroy_instead_for_custom_behav}}
- {{t.pages.documentation.fundamentals.creating_components.content.adoptedcallback_native_adoption_handler_use_onadoption_instead_for_custom_behavior}}
- {{t.pages.documentation.fundamentals.creating_components.content.onerror_error_callback_executed_when_errors_occur_within_lifecycles_or_rendering}}

#### {{t.pages.documentation.fundamentals.creating_components.content.native_htmlelement_properties}}

- {{t.pages.documentation.fundamentals.creating_components.content.style_standard_css_declaration_block}}
- {{t.pages.documentation.fundamentals.creating_components.content.classname_standard_class_name_string}}
- {{t.pages.documentation.fundamentals.creating_components.content.classlist_standard_class_token_list}}

> {{t.pages.documentation.fundamentals.creating_components.content.warning}}
> {{t.pages.documentation.fundamentals.creating_components.content.attempting_to_define_any_of_these_reserved_names_as_custom_props_or_mapping_them_via_observedatt}}
