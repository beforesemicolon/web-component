---
name: '{{t.pages.documentation.styling.update_stylesheet.meta.updatestylesheet}}'
order: 6.3
layout: document
title: '{{t.pages.documentation.styling.update_stylesheet.meta.updatestylesheet_webcomponent_by_before_semicolon}}'
description: '{{t.pages.documentation.styling.update_stylesheet.meta.swap_stylesheets_dynamically_at_runtime_using_updatestylesheet}}'
---

## {{t.pages.documentation.styling.update_stylesheet.content.updatestylesheet}}

{{t.pages.documentation.styling.update_stylesheet.content.while_the_css_tagged_template_is_perfect_for_fine_grained_style_changes_there_are_times_when_you}}

### {{t.pages.documentation.styling.update_stylesheet.content.method_signature}}

```typescript
updateStylesheet(sheet: CSSStyleSheet | string | null): void
```

#### {{t.pages.documentation.styling.update_stylesheet.content.parameters}}

- {{t.pages.documentation.styling.update_stylesheet.content.sheet}}
    - {{t.pages.documentation.styling.update_stylesheet.content.cssstylesheet_adopts_the_new_stylesheet_object_directly}}
    - {{t.pages.documentation.styling.update_stylesheet.content.string_parses_the_css_string_into_a_stylesheet_rewrites_host_selectors_if_shadow_dom_is_disabled}}
    - {{t.pages.documentation.styling.update_stylesheet.content.null_detaches_and_removes_the_current_stylesheet_from_the_element_s_content_root_or_document}}

### {{t.pages.documentation.styling.update_stylesheet.content.dynamic_theme_swapping_example}}

{{t.pages.documentation.styling.update_stylesheet.content.in_this_example_we_define_two_themes_and_swap_the_stylesheet_dynamically_when_a_user_clicks_a_bu}}

```javascript
import { WebComponent, html } from '@beforesemicolon/web-component'

const lightTheme = `
    :host {
        display: block;
        background-color: white;
        color: black;
        padding: 16px;
    }
`

const darkTheme = `
    :host {
        display: block;
        background-color: #222;
        color: white;
        padding: 16px;
    }
`

class ThemeBox extends WebComponent {
    initialState = { isDark: false }
    stylesheet = lightTheme

    toggleTheme = () => {
        this.setState((prev) => {
            const nextIsDark = !prev.isDark

            // Swap stylesheets dynamically
            this.updateStylesheet(nextIsDark ? darkTheme : lightTheme)

            return { isDark: nextIsDark }
        })
    }

    render() {
        return html`
            <div>
                <p>
                    Current Theme:
                    ${() => (this.state.isDark() ? 'Dark' : 'Light')}
                </p>
                <button onclick="${this.toggleTheme}">Toggle Theme</button>
            </div>
        `
    }
}

customElements.define('theme-box', ThemeBox)
```

### {{t.pages.documentation.styling.update_stylesheet.content.detaching_stylesheets}}

{{t.pages.documentation.styling.update_stylesheet.content.to_remove_all_styling_applied_via_the_component_s_stylesheet_property_call_this_updatestylesheet}}

```javascript
// Remove the current adopted stylesheet
this.updateStylesheet(null)
```

### {{t.pages.documentation.styling.update_stylesheet.content.how_webcomponent_handles_swapping}}

{{t.pages.documentation.styling.update_stylesheet.content.when_you_call_updatestylesheet_sheet_webcomponent_will}}

1. {{t.pages.documentation.styling.update_stylesheet.content.locate_the_currently_active_stylesheet_and_filter_it_out_of_the_container_s_adoptedstylesheets_a}}
2. {{t.pages.documentation.styling.update_stylesheet.content.convert_the_new_stylesheet_parameter_into_a_native_cssstylesheet_if_it_is_a_string}}
3. {{t.pages.documentation.styling.update_stylesheet.content.apply_light_dom_selector_rewriting_e_g_converting_host_to_the_element_s_tag_name_if_config_shado}}
4. {{t.pages.documentation.styling.update_stylesheet.content.append_the_new_stylesheet_to_adoptedstylesheets_on_either}}
    - {{t.pages.documentation.styling.update_stylesheet.content.the_element_s_shadowroot_if_shadow_dom_is_enabled}}
    - {{t.pages.documentation.styling.update_stylesheet.content.the_document_or_parent_shadow_root_if_shadow_dom_is_disabled}}
