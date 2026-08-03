---
name: '{{t.pages.documentation.events_and_lifecycle.events.meta.events}}'
order: 7.1
title: '{{t.pages.documentation.events_and_lifecycle.events.meta.events_webcomponent_by_before_semicolon}}'
description: '{{t.pages.documentation.events_and_lifecycle.events.meta.learn_how_to_dispatch_and_listen_to_custom_events_in_webcomponent_using_the_dispatch_method}}'
layout: document
---

## {{t.pages.documentation.events_and_lifecycle.events.content.events}}

{{t.pages.documentation.events_and_lifecycle.events.content.custom_elements_often_need_to_communicate_changes_or_actions_back_to_their_parents_or_the_rest_o}}

### {{t.pages.documentation.events_and_lifecycle.events.content.dispatching_custom_events}}

{{t.pages.documentation.events_and_lifecycle.events.content.to_dispatch_a_custom_event_from_inside_a_component_use_the_this_dispatch_name_detail_method}}

```typescript
dispatch(name: string, detail?: Record<string, unknown>): void
```

{{t.pages.documentation.events_and_lifecycle.events.content.this_method_is_a_convenient_wrapper_around_the_native_dispatchevent_api_it_instantiates_a_standa}}

{{t.pages.documentation.events_and_lifecycle.events.content.here_is_a_practical_example_of_a_counter_component_that_dispatches_an_event_whenever_the_count_c}}

```javascript
import { WebComponent, html } from '@beforesemicolon/web-component'

class CounterButton extends WebComponent {
    initialState = { count: 0 }

    increment = () => {
        const nextCount = this.state.count() + 1
        this.setState({ count: nextCount })

        // Dispatch the custom event with the payload
        this.dispatch('countchange', { count: nextCount })
    }

    render() {
        return html`
            <button type="button" onclick="${this.increment}">
                Increment (${() => this.state.count()})
            </button>
        `
    }
}

customElements.define('counter-button', CounterButton)
```

### {{t.pages.documentation.events_and_lifecycle.events.content.passing_payloads}}

{{t.pages.documentation.events_and_lifecycle.events.content.the_second_parameter_to_this_dispatch_is_an_optional_detail_object_containing_any_custom_data_in}}

```javascript
// Inside your component
this.dispatch('submit', {
    userId: 'usr_123',
    timestamp: Date.now(),
})
```

### {{t.pages.documentation.events_and_lifecycle.events.content.listening_to_custom_events}}

{{t.pages.documentation.events_and_lifecycle.events.content.since_components_are_native_custom_elements_you_can_listen_to_these_events_using_standard_web_ap}}

#### {{t.pages.documentation.events_and_lifecycle.events.content.in_markup_templates}}

{{t.pages.documentation.events_and_lifecycle.events.content.markup_templates_support_binding_event_listeners_for_any_standard_or_custom_event_by_prefixing_t}}

{{t.pages.documentation.events_and_lifecycle.events.content.for_example_if_your_custom_element_is_named_and_dispatches_a_countchange_event_you_can_listen_to}}

```javascript
import { html } from '@beforesemicolon/web-component'

const handleCountChange = (event) => {
    console.log('New count received:', event.detail.count)
}

const template = html`
    <div>
        <h3>My Application</h3>
        <counter-button oncountchange="${handleCountChange}"></counter-button>
    </div>
`
```

#### {{t.pages.documentation.events_and_lifecycle.events.content.using_native_event_listeners}}

{{t.pages.documentation.events_and_lifecycle.events.content.you_can_also_interact_with_the_component_imperatively_in_standard_javascript_using_the_native_ad}}

```javascript
const element = document.querySelector('counter-button')

element.addEventListener('countchange', (event) => {
    console.log('Count updated imperatively:', event.detail.count)
})
```

### {{t.pages.documentation.events_and_lifecycle.events.content.event_boundary_notes}}

{{t.pages.documentation.events_and_lifecycle.events.content.this_dispatch_intentionally_keeps_a_small_api}}

```javascript
this.dispatch('countchange', { count: nextCount })
```

{{t.pages.documentation.events_and_lifecycle.events.content.if_you_need_custom_event_options_such_as_bubbles_composed_or_cancelable_use_the_native_api_direc}}

```javascript
this.dispatchEvent(
    new CustomEvent('countchange', {
        detail: { count: nextCount },
        bubbles: true,
        composed: true,
    })
)
```
