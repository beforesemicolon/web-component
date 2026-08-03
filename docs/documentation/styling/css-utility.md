---
name: '{{t.pages.documentation.styling.css_utility.meta.css_utility}}'
order: 6.2
layout: document
title: '{{t.pages.documentation.styling.css_utility.meta.css_utility_webcomponent_by_before_semicolon}}'
description: '{{t.pages.documentation.styling.css_utility.meta.use_the_css_tagged_template_literal_to_build_highly_reactive_and_dynamic_component_styles}}'
---

## {{t.pages.documentation.styling.css_utility.content.css_utility}}

{{t.pages.documentation.styling.css_utility.content.for_stylesheets_that_need_to_change_dynamically_in_response_to_state_or_property_updates_webcomp}}

### {{t.pages.documentation.styling.css_utility.content.how_it_works}}

{{t.pages.documentation.styling.css_utility.content.the_css_tag_returns_an_instance_of_the_cssstyle_class_under_the_hood_any_function_interpolated_i}}

{{t.pages.documentation.styling.css_utility.content.when_any_reactive_prop_or_state_getter_is_called_inside_these_functions_it_registers_as_a_depend}}

### {{t.pages.documentation.styling.css_utility.content.practical_example}}

{{t.pages.documentation.styling.css_utility.content.in_the_following_example_the_background_and_text_color_of_the_badge_change_reactively_based_on_t}}

```javascript
import { WebComponent, html, css } from '@beforesemicolon/web-component'

class StatusBadge extends WebComponent {
    static observedAttributes = ['status']
    status = 'info'

    stylesheet = css`
        :host {
            display: inline-block;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.875rem;
            font-weight: bold;

            /* Reactive styles */
            background-color: ${() =>
                this.props.status() === 'success' ? '#d4edda' : '#e2e3e5'};
            color: ${() =>
                this.props.status() === 'success' ? '#155724' : '#383d41'};
        }
    `

    render() {
        return html`<slot></slot>`
    }
}

customElements.define('status-badge', StatusBadge)
```

### {{t.pages.documentation.styling.css_utility.content.using_markup_helpers_when_is}}

{{t.pages.documentation.styling.css_utility.content.to_make_dynamic_styling_cleaner_you_can_use_beforesemicolon_markup_s_reactive_helpers_like_when}}

- {{t.pages.documentation.styling.css_utility.content.is_getter_expectedvalue_checks_if_a_getter_returns_a_matching_value}}
- {{t.pages.documentation.styling.css_utility.content.when_condition_thenvalue_otherwisevalue_evaluates_a_condition_can_be_a_getter_or_a_function_and}}

{{t.pages.documentation.styling.css_utility.content.here_is_the_same_example_using_these_helpers}}

```javascript
import {
    WebComponent,
    html,
    css,
    when,
    is,
} from '@beforesemicolon/web-component'

class StatusBadge extends WebComponent {
    static observedAttributes = ['status']
    status = 'info'

    stylesheet = css`
        :host {
            display: inline-block;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;

            /* Using when & is helpers */
            background-color: ${when(
                is(this.props.status, 'success'),
                '#d4edda',
                '#e2e3e5'
            )};
            color: ${when(
                is(this.props.status, 'success'),
                '#155724',
                '#383d41'
            )};
        }
    `

    render() {
        return html`<slot></slot>`
    }
}
```

### {{t.pages.documentation.styling.css_utility.content.the_cssstyle_class}}

{{t.pages.documentation.styling.css_utility.content.the_css_function_parses_the_strings_and_values_into_a_cssstyle_instance_the_class_has_the_follow}}

- {{t.pages.documentation.styling.css_utility.content.tostring_evaluates_and_returns_the_stylesheet_as_a_plain_css_string}}
- {{t.pages.documentation.styling.css_utility.content.onupdate_callback_registers_a_callback_function_that_is_invoked_with_the_updated_css_string_when}}

```javascript
import { css } from '@beforesemicolon/web-component'

const themeColor = state('blue')

const style = css`
    button {
        background-color: ${() => themeColor[0]()};
    }
`

style.onUpdate((newCss) => {
    console.log('CSS updated:', newCss)
})
```

{{t.pages.documentation.styling.css_utility.content.webcomponent_hooks_into_the_onupdate_method_automatically_meaning_you_rarely_need_to_call_onupda}}
