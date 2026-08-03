---
name: '{{t.pages.documentation.fundamentals.typescript.meta.typescript}}'
order: 4.4
title: '{{t.pages.documentation.fundamentals.typescript.meta.typescript_webcomponent_by_before_semicolon}}'
description: '{{t.pages.documentation.fundamentals.typescript.meta.complete_type_safety_and_generics_integration_in_webcomponent}}'
layout: document
---

## {{t.pages.documentation.fundamentals.typescript.content.typescript}}

{{t.pages.documentation.fundamentals.typescript.content.beforesemicolon_web_component_is_designed_with_first_class_typescript_support_offering_complete}}

### {{t.pages.documentation.fundamentals.typescript.content.subclassing_with_generics}}

{{t.pages.documentation.fundamentals.typescript.content.the_webcomponent_base_class_accepts_two_optional_generic_parameters_props_and_state}}

```typescript
import { WebComponent, html } from '@beforesemicolon/web-component'

// 1. Define your component's types
interface ButtonProps {
    label: string
    disabled: boolean
}

interface ButtonState {
    clickCount: number
}

// 2. Pass them to the WebComponent class
class CustomButton extends WebComponent<ButtonProps, ButtonState> {
    static observedAttributes = ['label', 'disabled']

    // Provide default props values as class properties
    label = 'Click me'
    disabled = false

    // Provide initial state
    initialState = {
        clickCount: 0,
    }

    handleClick = () => {
        this.setState((prev) => ({ clickCount: prev.clickCount + 1 }))
    }

    render() {
        // Both this.props and this.state are fully typed!
        return html`
            <button
                onclick="${this.handleClick}"
                disabled="${this.props.disabled}"
            >
                ${() => this.props.label()} (${() => this.state.clickCount()})
            </button>
        `
    }
}
```

---

### {{t.pages.documentation.fundamentals.typescript.content.custom_element_references}}

{{t.pages.documentation.fundamentals.typescript.content.when_working_with_dom_apis_or_template_references_you_often_need_a_reference_type_that_contains}}

{{t.pages.documentation.fundamentals.typescript.content.the_htmlcomponentelement_utility_type_provides_this_capability_it_combines_the_webcomponent_clas}}

```typescript
import { HTMLComponentElement } from '@beforesemicolon/web-component'

// Given the CustomButton defined above:
type CustomButtonElement = HTMLComponentElement<ButtonProps>

// Now you can safely interact with the reference:
const myButton = document.querySelector<CustomButtonElement>('custom-button')

if (myButton) {
    // Directly access or update props on the instance
    myButton.label = 'Submit Form'
    myButton.disabled = true

    // Standard HTMLElement / WebComponent methods are also available
    myButton.dispatch('custom-event', { detail: 'clicked' })
}
```

---

### {{t.pages.documentation.fundamentals.typescript.content.exported_utility_types}}

{{t.pages.documentation.fundamentals.typescript.content.the_following_typescript_utility_types_are_exported_from_the_library_to_help_build_typed_compone}}

#### {{t.pages.documentation.fundamentals.typescript.content.objectinterface}}

{{t.pages.documentation.fundamentals.typescript.content.constraints_checking_helper_representing_an_object_containing_key_value_pairs_where_keys_must_be}}

```typescript
type ObjectInterface<P> = {
    [K in keyof P & (string | symbol | number)]: P[K]
}
```

#### {{t.pages.documentation.fundamentals.typescript.content.props}}

{{t.pages.documentation.fundamentals.typescript.content.maps_each_key_in_a_properties_interface_p_to_a_reactive_stategetter_from_beforesemicolon_markup}}

```typescript
type Props<P> = {
    [K in keyof P]: StateGetter<P[K]>
}
```

#### {{t.pages.documentation.fundamentals.typescript.content.propssetters}}

{{t.pages.documentation.fundamentals.typescript.content.maps_each_key_in_a_properties_interface_p_to_a_reactive_statesetter_from_beforesemicolon_markup}}

```typescript
type PropsSetters<P> = {
    [K in keyof P]: StateSetter<P[K]>
}
```

#### {{t.pages.documentation.fundamentals.typescript.content.state}}

{{t.pages.documentation.fundamentals.typescript.content.maps_each_key_in_a_state_interface_s_to_a_reactive_stategetter_from_beforesemicolon_markup_this}}

```typescript
type State<S> = {
    [K in keyof S]: StateGetter<S[K]>
}
```

#### {{t.pages.documentation.fundamentals.typescript.content.statesetters}}

{{t.pages.documentation.fundamentals.typescript.content.maps_each_key_in_a_state_interface_s_to_a_reactive_statesetter_from_beforesemicolon_markup}}

```typescript
type StateSetters<S> = {
    [K in keyof S]: StateSetter<S[K]>
}
```
