---
name: '{{t.pages.documentation.guide.meta.guide_best_practices}}'
order: 3.1
title: '{{t.pages.documentation.guide.meta.webcomponent_guide_and_best_practices_before_semicolon}}'
description: '{{t.pages.documentation.guide.meta.practical_conventions_for_building_reactive_custom_elements_with_beforesemicolon_web_component}}'
layout: document
---

## {{t.pages.documentation.guide.content.guide_best_practices}}

{{t.pages.documentation.guide.content.use_beforesemicolon_web_component_when_you_want_native_custom_elements_with_a_small_reactive_lay}}

## {{t.pages.documentation.guide.content.core_rules}}

1.  {{t.pages.documentation.guide.content.keep_render_declarative_return_html_a_node_a_string_or_nothing_do_not_start_timers_fetch_data_su}}
2.  {{t.pages.documentation.guide.content.use_observed_attributes_for_public_inputs_put_external_inputs_in_static_observedattributes_provi}}
3.  {{t.pages.documentation.guide.content.use_state_for_owned_ui_data_put_private_component_data_in_initialstate_and_update_it_with_this_s}}
4.  {{t.pages.documentation.guide.content.pass_reactive_getters_directly_when_possible_use_this_state_count_or_this_props_label_in_templat}}
5.  {{t.pages.documentation.guide.content.use_lifecycle_hooks_for_side_effects_start_work_in_onmount_return_cleanup_from_onmount_or_use_on}}
6.  {{t.pages.documentation.guide.content.prefer_ref_before_queryselector_use_ref_for_template_owned_elements_and_reach_for_contentroot_on}}
7.  {{t.pages.documentation.guide.content.dispatch_public_events_use_this_dispatch_name_detail_for_component_outputs_consumers_listen_with}}

## {{t.pages.documentation.guide.content.component_shape}}

```javascript
import { WebComponent, html, css } from '@beforesemicolon/web-component'

class ProductCounter extends WebComponent {
    static observedAttributes = ['label', 'max']
    label = 'Quantity'
    max = 10
    initialState = { value: 1 }

    stylesheet = css`
        :host {
            display: inline-grid;
            gap: 0.5rem;
        }
    `

    setValue = (value) => {
        const next = Math.min(Number(this.props.max()), Math.max(1, value))
        this.setState({ value: next })
        this.dispatch('change', { value: next })
    }

    render() {
        return html`
            <label>${this.props.label}</label>
            <button
                type="button"
                onclick="${() => this.setValue(this.state.value() - 1)}"
            >
                -
            </button>
            <output>${this.state.value}</output>
            <button
                type="button"
                onclick="${() => this.setValue(this.state.value() + 1)}"
            >
                +
            </button>
        `
    }
}

customElements.define('product-counter', ProductCounter)
```

## {{t.pages.documentation.guide.content.attribute_formatting}}

{{t.pages.documentation.guide.content.break_long_custom_element_usage_across_lines_it_keeps_examples_readable_and_avoids_horizontal_sc}}

```html
<product-counter
    label="Team seats"
    max="25"
    onchange="console.log(event.detail.value)"
></product-counter>
```

## {{t.pages.documentation.guide.content.props_vs_state}}

{{t.pages.documentation.guide.content.use_props_for_values_controlled_by_the_outside_page_use_state_for_values_the_component_owns}}

```javascript
class UserBadge extends WebComponent {
    static observedAttributes = ['name', 'status']
    name = 'Guest'
    status = 'offline'
    initialState = { expanded: false }

    render() {
        return html`
            <button
                type="button"
                aria-expanded="${this.state.expanded}"
                onclick="${() =>
                    this.setState(({ expanded }) => ({
                        expanded: !expanded,
                    }))}"
            >
                ${this.props.name} is ${this.props.status}
            </button>
        `
    }
}
```

## {{t.pages.documentation.guide.content.side_effects}}

{{t.pages.documentation.guide.content.use_onmount_for_browser_subscriptions_and_return_a_cleanup_function}}

```javascript
class ViewportMeter extends WebComponent {
    initialState = { width: window.innerWidth }

    onMount() {
        const update = () => {
            this.setState({ width: window.innerWidth })
        }

        window.addEventListener('resize', update)
        return () => window.removeEventListener('resize', update)
    }

    render() {
        return html`<output>${this.state.width}px</output>`
    }
}
```

## {{t.pages.documentation.guide.content.styling}}

{{t.pages.documentation.guide.content.use_stylesheet_for_static_css_and_css_when_styles_depend_on_props_or_state}}

```javascript
class ModePanel extends WebComponent {
    static observedAttributes = ['mode']
    mode = 'info'

    stylesheet = css`
        :host {
            display: block;
            border-color: ${() => {
                return this.props.mode() === 'danger'
                    ? 'var(--danger)'
                    : 'var(--primary)'
            }};
        }
    `

    render() {
        return html`<slot></slot>`
    }
}
```

## {{t.pages.documentation.guide.content.form_controls}}

{{t.pages.documentation.guide.content.use_static_formassociated_true_only_for_controls_that_should_participate_in_native_form_submissi}}

```javascript
class RatingInput extends WebComponent {
    static formAssociated = true
    initialState = { value: 0 }

    choose = (value) => {
        this.setState({ value })
        this.internals.setFormValue(String(value))
        this.dispatch('change', { value })
    }

    render() {
        return html`
            <button type="button" onclick="${() => this.choose(1)}">1</button>
            <button type="button" onclick="${() => this.choose(2)}">2</button>
            <button type="button" onclick="${() => this.choose(3)}">3</button>
        `
    }
}
```
