---
name: '{{t.pages.documentation.styling.stylesheet.meta.stylesheet}}'
order: 6.1
layout: document
title: '{{t.pages.documentation.styling.stylesheet.meta.stylesheet_webcomponent_by_before_semicolon}}'
description: '{{t.pages.documentation.styling.stylesheet.meta.learn_how_to_load_assign_and_manage_component_styles_using_the_stylesheet_property}}'
---

## {{t.pages.documentation.styling.stylesheet.content.stylesheet}}

{{t.pages.documentation.styling.stylesheet.content.the_stylesheet_class_property_is_the_primary_way_to_define_styling_for_your_component_webcompone}}

### {{t.pages.documentation.styling.stylesheet.content.supported_stylesheet_formats}}

{{t.pages.documentation.styling.stylesheet.content.you_can_assign_a_css_string_a_native_cssstylesheet_instance_or_a_css_import_assertion_to_the_sty}}

#### {{t.pages.documentation.styling.stylesheet.content.text_1_css_strings}}

{{t.pages.documentation.styling.stylesheet.content.the_simplest_way_is_to_define_your_stylesheet_as_a_plain_css_string}}

```javascript
import { WebComponent, html } from '@beforesemicolon/web-component'

class SimpleBtn extends WebComponent {
    stylesheet = `
        button {
            background-color: var(--button-bg, ButtonFace);
            color: var(--button-color, ButtonText);
            border: 1px solid var(--button-border, ButtonText);
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
        }
        button:hover {
            opacity: 0.9;
        }
    `

    render() {
        return html`<button><slot></slot></button>`
    }
}
```

#### {{t.pages.documentation.styling.stylesheet.content.text_2_css_import_assertions}}

{{t.pages.documentation.styling.stylesheet.content.if_your_build_environment_or_browser_supports_css_module_imports_you_can_import_a_css_file_direc}}

```javascript
import { WebComponent, html } from '@beforesemicolon/web-component'
import styleSheet from './style.css' with { type: 'css' }

class AssetBtn extends WebComponent {
    stylesheet = styleSheet

    render() {
        return html`<button><slot></slot></button>`
    }
}
```

#### {{t.pages.documentation.styling.stylesheet.content.text_3_native_cssstylesheet}}

{{t.pages.documentation.styling.stylesheet.content.you_can_also_construct_stylesheets_imperatively}}

```javascript
const sheet = new CSSStyleSheet()
sheet.replaceSync('button { font-weight: bold; }')

class BoldBtn extends WebComponent {
    stylesheet = sheet
}
```

### {{t.pages.documentation.styling.stylesheet.content.shadow_dom_vs_light_dom_behavior}}

{{t.pages.documentation.styling.stylesheet.content.behind_the_scenes_webcomponent_uses_adopted_stylesheets_to_inject_your_styles_where_those_styles}}

#### {{t.pages.documentation.styling.stylesheet.content.under_shadow_dom_default}}

{{t.pages.documentation.styling.stylesheet.content.if_shadow_dom_is_active_the_style_is_adopted_by_the_shadow_root_of_the_component_it_keeps_styles}}

```css
:host {
    display: inline-block;
}
```

#### {{t.pages.documentation.styling.stylesheet.content.under_light_dom}}

{{t.pages.documentation.styling.stylesheet.content.if_you_disable_shadow_dom_by_setting_config_shadow_false_the_component_cannot_adopt_styles_local}}

{{t.pages.documentation.styling.stylesheet.content.because_global_styles_can_leak_webcomponent_automatically_parses_and_rewrites_specific_selectors}}

- {{t.pages.documentation.styling.stylesheet.content.host_is_rewritten_to_the_custom_element_s_tag_name_e_g_my_element}}
- {{t.pages.documentation.styling.stylesheet.content.host_context_selector_is_rewritten_to_match_the_target_context_e_g_selector_my_element}}

```css
/* Original CSS */
:host {
    display: block;
}
:host(.active) {
    color: red;
}
:host-context(.dark-theme) {
    background-color: black;
}

/* Rewritten for <my-element> */
my-element {
    display: block;
}
my-element.active {
    color: red;
}
.dark-theme my-element {
    background-color: black;
}
```

{{t.pages.documentation.styling.stylesheet.content.this_ensures_your_styling_rules_continue_to_work_as_expected_even_if_you_decide_to_toggle_the_sh}}
