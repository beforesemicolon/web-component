---
name: '{{t.pages.documentation.ai.meta.ai_guide}}'
order: 3.2
title: '{{t.pages.documentation.ai.meta.ai_guide_webcomponent_by_before_semicolon}}'
description: '{{t.pages.documentation.ai.meta.ai_first_guide_to_beforesemicolon_web_component_apis_source_boundaries_and_common_implementation}}'
layout: document
---

## {{t.pages.documentation.ai.content.ai_guide}}

{{t.pages.documentation.ai.content.use_this_page_first_if_you_are_an_ai_agent_scanning_the_webcomponent_docs}}

## {{t.pages.documentation.ai.content.read_first}}

- {{t.pages.documentation.ai.content.what_is_webcomponent_index_md}}
- {{t.common.content.get_started_get_started_md}}
- {{t.common.content.guide_best_practices_guide_md}}
- {{t.common.content.creating_components_fundamentals_creating_components_md}}
- {{t.pages.documentation.ai.content.props_props_and_state_props_md}}
- {{t.pages.documentation.ai.content.state_props_and_state_state_md}}
- {{t.pages.documentation.ai.content.stylesheet_styling_stylesheet_md}}
- {{t.pages.documentation.ai.content.events_events_and_lifecycle_events_md}}

## {{t.pages.documentation.ai.content.package_boundary}}

- {{t.pages.documentation.ai.content.beforesemicolon_web_component_exports_webcomponent_htmlcomponentelement_css_and_the_webcomponent}}
- {{t.pages.documentation.ai.content.it_also_re_exports_beforesemicolon_markup_so_examples_can_import_html_repeat_when_state_and_othe}}
- {{t.pages.documentation.ai.content.the_browser_bundle_exposes_window_bfs_webcomponent_window_bfs_css_and_window_bfs_markup}}

## {{t.pages.documentation.ai.content.runtime_facts}}

- {{t.pages.documentation.ai.content.static_observedattributes_defines_public_attributes_and_creates_camelcase_reactive_props_under_t}}
- {{t.pages.documentation.ai.content.default_prop_values_are_class_fields_with_the_camelcase_prop_name}}
- {{t.pages.documentation.ai.content.initialstate_defines_local_state_getters_under_this_state}}
- {{t.pages.documentation.ai.content.this_setstate_only_works_after_the_component_is_mounted}}
- {{t.pages.documentation.ai.content.this_dispatch_name_detail_creates_a_customevent_with_detail_add_native_custom_event_options_manu}}
- {{t.pages.documentation.ai.content.render_may_return_a_markup_htmltemplate_a_string_a_dom_node_or_nothing}}
- {{t.pages.documentation.ai.content.stylesheet_accepts_a_css_string_a_cssstylesheet_or_a_reactive_css_result}}
- {{t.pages.documentation.ai.content.config_shadow_defaults_to_true}}
- {{t.pages.documentation.ai.content.when_config_shadow_false_host_selectors_are_rewritten_to_the_custom_element_tag}}

## {{t.pages.documentation.ai.content.common_tasks}}

- {{t.pages.documentation.ai.content.public_input_add_the_kebab_case_name_to_static_observedattributes_and_read_this_props_camelname}}
- {{t.pages.documentation.ai.content.internal_ui_state_add_a_key_to_initialstate_and_update_it_with_this_setstate}}
- {{t.pages.documentation.ai.content.dom_element_access_add_ref_name_and_use_this_refs_name_0_after_render}}
- {{t.pages.documentation.ai.content.component_output_call_this_dispatch_event_name_value}}
- {{t.pages.documentation.ai.content.mount_side_effects_use_onmount_and_return_cleanup}}
- {{t.pages.documentation.ai.content.prop_reactions_use_onupdate_name_newvalue_oldvalue}}
- {{t.pages.documentation.ai.content.scoped_css_assign_stylesheet}}
- {{t.pages.documentation.ai.content.reactive_css_assign_stylesheet_css}}
- {{t.pages.documentation.ai.content.native_forms_set_static_formassociated_true_and_use_this_internals}}

## {{t.pages.documentation.ai.content.avoid}}

- {{t.pages.documentation.ai.content.do_not_call_this_setstate_in_the_constructor_or_during_class_field_initialization}}
- {{t.pages.documentation.ai.content.do_not_mutate_arrays_or_objects_inside_state_in_place_return_a_new_value_from_setstate}}
- {{t.pages.documentation.ai.content.do_not_document_native_lifecycle_callbacks_as_extension_points_use_onmount_onupdate_ondestroy_an}}
- {{t.pages.documentation.ai.content.do_not_assume_dispatch_bubbles_or_crosses_shadow_boundaries_unless_the_source_code_supports_opti}}
- {{t.pages.documentation.ai.content.do_not_use_long_one_line_custom_element_examples_when_several_attributes_are_present}}
