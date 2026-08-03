---
name: '{{t.pages.home.meta.webcomponent}}'
order: 0
title: '{{t.pages.home.meta.webcomponent_by_before_semicolon}}'
description: '{{t.pages.home.meta.build_reactive_web_components_enhanced_with_state_props_scoped_styles_lifecycles_and_form_integr}}'
layout: landing
---

::: layout landing-hero version="v1.19.2" title="{{t.pages.home.content.web_components}}" title2="{{t.pages.home.content.now_reactive}}" primaryLabel="{{t.common.content.get_started}}" secondaryLabel="npm i @beforesemicolon/web-component"

=== copy

{{t.pages.home.content.a_tiny_reactive_layer_over_the_native_web_components_api_props_state_scoped_styles_and_lifecycle}}

=== stat

## {{t.pages.home.content.native}}

{{t.pages.home.content.custom_elements}}

=== stat

## 0

{{t.pages.home.content.dependencies}}

=== stat

## ∞

{{t.pages.home.content.framework_friendly}}

=== code filename=hello-world.js lang=javascript

```javascript
import { WebComponent, html } from '@beforesemicolon/web-component'

class HelloWorld extends WebComponent {
    static observedAttributes = ['name']

    name = 'World'

    render() {
        return html`<h1>Hello, ${this.props.name}!</h1> `
    }
}

customElements.define('hello-world', HelloWorld)
// <hello-world name="James"></hello-world>
```

:::

::: layout landing-ecosystem

=== header

{{t.pages.home.content.the_ecosystem}}

## {{t.pages.home.content.built_on_web_component}}

{{t.pages.home.content.production_ready_libraries_built_on_top_of_web_component_same_custom_element_foundation_modular}}

=== product title=Router package=@beforesemicolon/router color=accent icon=router href=https://router.beforesemicolon.com

{{t.pages.home.content.declarative_routing_as_web_component_tags_built_on_top_of_web_component_nested_routes_params_404}}

=== product title=Intl package=@beforesemicolon/intl color=primary icon=reactive href=https://intl.beforesemicolon.com

{{t.pages.home.content.localization_for_component_first_interfaces_built_on_top_of_web_component_locale_scopes_messages}}

:::

::: layout landing-features

=== header

{{t.pages.home.content.why_web_component}}

## {{t.pages.home.content.custom_elements_supercharged}}

{{t.pages.home.content.everything_you_love_about_native_web_components_plus_the_reactivity_ergonomics_and_tiny_footprin}}

=== feature icon=reactive

### {{t.pages.home.content.reactive_props_state}}

{{t.pages.home.content.observed_attributes_become_reactive_props_updating_state_updates_only_the_dom_that_depends_on_it}}

=== feature icon=tiny

### {{t.pages.home.content.tiny}}

{{t.pages.home.content.a_thin_layer_over_the_native_web_components_api_built_on_markup_no_extra_dependencies}}

=== feature icon=standards

### {{t.pages.home.content.scoped_styles}}

{{t.pages.home.content.per_component_stylesheets_that_ship_with_the_element_no_leaks_no_conflicts_no_css_in_js_runtime}}

=== feature icon=plug

### {{t.pages.home.content.native_lifecycles}}

{{t.pages.home.content.onmount_onupdate_ondestroy_onadoption_first_class_hooks_for_everything_custom_elements_expose}}

=== feature icon=webComponents

### {{t.pages.home.content.works_everywhere}}

{{t.pages.home.content.custom_elements_run_in_any_framework_in_plain_html_or_in_any_tool_that_renders_dom}}

=== feature icon=surgical

### {{t.pages.home.content.built_on_markup}}

{{t.pages.home.content.same_reactive_engine_same_templating_same_0_build_philosophy_drop_in_a_script_tag_and_ship}}

:::

::: layout landing-showcase

=== header

{{t.pages.home.content.see_it_in_action}}

## {{t.pages.home.content.real_components_native_tags}}

{{t.pages.home.content.build_focused_elements_that_own_their_props_state_styles_lifecycle_work_and_public_events}}

=== example label="{{t.pages.home.content.quantity_stepper}}" color=accent filename=quantity-stepper.js lang=javascript

```javascript
import { WebComponent, html } from '@beforesemicolon/web-component'

class QuantityStepper extends WebComponent {
    static observedAttributes = ['label', 'min', 'max']
    label = 'Seats'
    min = 1
    max = 10
    initialState = { value: 1 }

    setValue = (value) => {
        const next = Math.min(
            Number(this.props.max()),
            Math.max(Number(this.props.min()), value)
        )
        this.setState({ value: next })
        this.dispatch('change', { value: next })
    }

    render() {
        return html`
            <label>${this.props.label}</label>
            <button onclick="${() => this.setValue(this.state.value() - 1)}">
                -
            </button>
            <output>${this.state.value}</output>
            <button onclick="${() => this.setValue(this.state.value() + 1)}">
                +
            </button>
        `
    }
}

customElements.define('quantity-stepper', QuantityStepper)
```

=== example label="{{t.pages.home.content.todo_list}}" color=accent filename=todo-list.js lang=javascript

```javascript
import { WebComponent, html, repeat } from '@beforesemicolon/web-component'

class TodoList extends WebComponent {
    initialState = {
        draft: '',
        todos: ['Plan release', 'Write docs'],
    }

    add = () => {
        const text = this.state.draft().trim()
        if (!text) return

        this.setState(({ todos }) => ({
            draft: '',
            todos: [...todos, text],
        }))
    }

    render() {
        return html`
            <input
                value="${this.state.draft}"
                oninput="${(event) =>
                    this.setState({ draft: event.target.value })}"
            />
            <button onclick="${this.add}">Add</button>
            <ul>
                ${repeat(this.state.todos, (todo) => html`<li>${todo}</li>`)}
            </ul>
        `
    }
}

customElements.define('todo-list', TodoList)
```

=== example label="{{t.pages.home.content.pricing_toggle}}" color=accent filename=pricing-toggle.js lang=javascript

```javascript
import { WebComponent, html } from '@beforesemicolon/web-component'

class PricingToggle extends WebComponent {
    static observedAttributes = ['monthly', 'yearly']
    monthly = 19
    yearly = 190
    initialState = { yearly: false }

    toggle = () => {
        this.setState(({ yearly }) => ({ yearly: !yearly }))
    }

    render() {
        return html`
            <button
                type="button"
                aria-pressed="${this.state.yearly}"
                onclick="${this.toggle}"
            >
                Bill yearly
            </button>
            <strong>
                $${() => {
                    return this.state.yearly()
                        ? this.props.yearly()
                        : this.props.monthly()
                }}
            </strong>
        `
    }
}

customElements.define('pricing-toggle', PricingToggle)
```

=== example label="{{t.pages.home.content.validated_field}}" color=accent filename=email-field.js lang=javascript

```javascript
import { WebComponent, html } from '@beforesemicolon/web-component'

class EmailField extends WebComponent {
    static formAssociated = true
    initialState = { value: '', error: '' }

    update = (event) => {
        const value = event.target.value
        const valid = value.includes('@')

        this.setState({
            value,
            error: valid ? '' : 'Enter a valid email.',
        })
        this.internals.setFormValue(value)
        this.internals.setValidity(
            valid ? {} : { customError: true },
            valid ? '' : 'Enter a valid email.',
            this.refs.input?.[0]
        )
    }

    render() {
        return html`
            <input
                ref="input"
                type="email"
                value="${this.state.value}"
                oninput="${this.update}"
            />
            <small>${this.state.error}</small>
        `
    }
}

customElements.define('email-field', EmailField)
```

=== example label="{{t.pages.home.content.reactive_stylesheet}}" color=accent filename=status-pill.js lang=javascript

```javascript
import {
    WebComponent,
    html,
    css,
    is,
    when,
} from '@beforesemicolon/web-component'

class StatusPill extends WebComponent {
    static observedAttributes = ['status']
    status = 'ready'

    stylesheet = css`
        :host {
            display: inline-flex;
            border-radius: 999px;
            padding: 0.35rem 0.7rem;
            background: ${when(
                is(this.props.status, 'ready'),
                '#dcfce7',
                '#dbeafe'
            )};
            color: ${when(
                is(this.props.status, 'ready'),
                '#166534',
                '#1d4ed8'
            )};
        }
    `

    render() {
        return html`<slot>${this.props.status}</slot>`
    }
}

customElements.define('status-pill', StatusPill)
```

:::

::: layout landing-install

=== header

{{t.pages.home.content.quick_start}}

## {{t.pages.home.content.install_in_seconds}}

{{t.pages.home.content.choose_your_preferred_installation_method_works_everywhere_javascript_runs}}

=== tab key=cdn label=CDN command="<script src=&quot;https://unpkg.com/@beforesemicolon/web-component/dist/client.js&quot;></script>"

=== tab key=npm label=npm command="npm install @beforesemicolon/web-component"

=== tab key=yarn label=yarn command="yarn add @beforesemicolon/web-component"

=== tab key=pnpm label=pnpm command="pnpm add @beforesemicolon/web-component"

:::

::: layout landing-cta title="{{t.pages.home.content.build_reactive_web_components}}" title2="{{t.pages.home.content.your_way}}"

=== copy

{{t.pages.home.content.combine_the_simplicity_of_vanilla_web_standards_with_the_power_of_modern_reactivity}}

:::
