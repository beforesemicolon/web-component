---
name: '{{t.pages.documentation.events_and_lifecycle.error_handling.meta.error_handling}}'
order: 7.3
title: '{{t.pages.documentation.events_and_lifecycle.error_handling.meta.error_handling_webcomponent_by_before_semicolon}}'
description: '{{t.pages.documentation.events_and_lifecycle.error_handling.meta.intercept_and_process_runtime_errors_from_render_state_updates_styles_or_lifecycles_using_the_on}}'
layout: document
---

## {{t.pages.documentation.events_and_lifecycle.error_handling.content.error_handling}}

{{t.pages.documentation.events_and_lifecycle.error_handling.content.handling_runtime_errors_gracefully_is_crucial_for_building_robust_web_applications_beforesemicol}}

### {{t.pages.documentation.events_and_lifecycle.error_handling.content.the_onerror_hook}}

{{t.pages.documentation.events_and_lifecycle.error_handling.content.by_default_the_onerror_hook_logs_the_error_to_the_console_using_console_error}}

```typescript
onError(error: Error | unknown): void {
    console.error(error);
}
```

{{t.pages.documentation.events_and_lifecycle.error_handling.content.you_can_override_this_method_to_customize_how_your_component_handles_errors_such_as_showing_a_to}}

```javascript
import { WebComponent, html } from '@beforesemicolon/web-component'

class ErrorProneComponent extends WebComponent {
    onMount() {
        throw new Error('Failed to start component')
    }

    onError(error) {
        telemetry.logError(error)
        this.dispatch('componenterror', {
            message: error instanceof Error ? error.message : String(error),
        })
    }

    render() {
        return html`<p>Starting...</p>`
    }
}
```

---

### {{t.pages.documentation.events_and_lifecycle.error_handling.content.what_triggers_onerror}}

{{t.pages.documentation.events_and_lifecycle.error_handling.content.the_component_automatically_wraps_internal_processes_in_try_catch_blocks_if_any_of_the_following}}

- {{t.pages.documentation.events_and_lifecycle.error_handling.content.state_mutations_errors_during_this_setstate_such_as_trying_to_update_state_on_an_unmounted_compo}}
- {{t.pages.documentation.events_and_lifecycle.error_handling.content.dynamic_stylesheet_updates_errors_inside_this_updatestylesheet_or_when_compiling_reactive_styles}}
- {{t.pages.documentation.events_and_lifecycle.error_handling.content.custom_event_dispatching_errors_occurring_while_creating_or_dispatching_custom_events_through_th}}
- {{t.pages.documentation.events_and_lifecycle.error_handling.content.lifecycle_connections_errors_thrown_during_the_component_connection_or_adoption_phases_including}}
- {{t.pages.documentation.events_and_lifecycle.error_handling.content.lifecycle_disconnections_errors_thrown_when_the_component_is_being_disconnected_including_during}}

---

### {{t.pages.documentation.events_and_lifecycle.error_handling.content.centralized_error_tracking_pattern}}

{{t.pages.documentation.events_and_lifecycle.error_handling.content.in_larger_applications_repeating_error_handling_logic_in_every_component_is_inefficient_the_reco}}

{{t.pages.documentation.events_and_lifecycle.error_handling.content.here_is_an_example_of_a_base_class_setup}}

```typescript
// src/components/base-component.ts
import { WebComponent, ObjectInterface } from '@beforesemicolon/web-component'

export abstract class BaseComponent<
    P extends ObjectInterface<P> = Record<string, unknown>,
    S extends ObjectInterface<S> = Record<string, unknown>,
> extends WebComponent<P, S> {
    onError(error: Error | unknown) {
        const errorDetails = {
            tagName: this.tagName.toLowerCase(),
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            timestamp: new Date().toISOString(),
        }

        // 1. Log to console
        console.error(`[BaseComponent Error] <${errorDetails.tagName}>:`, error)

        // 2. Report to third-party error monitoring tool (e.g. Sentry, LogRocket)
        if (window.errorTracker) {
            window.errorTracker.captureException(error, { extra: errorDetails })
        }
    }
}
```

{{t.pages.documentation.events_and_lifecycle.error_handling.content.now_instead_of_extending_webcomponent_directly_your_feature_components_extend_basecomponent}}

```typescript
// src/components/user-profile.ts
import { BaseComponent } from './base-component.ts'
import { html } from '@beforesemicolon/web-component'

class UserProfile extends BaseComponent {
    render() {
        return html`<div>User Profile</div>`
    }
}

customElements.define('user-profile', UserProfile)
```

### {{t.pages.documentation.events_and_lifecycle.error_handling.content.reporting_your_own_component_errors}}

{{t.pages.documentation.events_and_lifecycle.error_handling.content.onerror_is_not_only_for_errors_webcomponent_catches_internally_if_your_component_has_its_own_asy}}

{{t.pages.documentation.events_and_lifecycle.error_handling.content.this_is_especially_useful_when_all_components_extend_a_shared_base_component_the_base_class_beco}}

```typescript
import { html } from '@beforesemicolon/web-component'
import { BaseComponent } from './base-component.ts'

class UserProfile extends BaseComponent {
    static observedAttributes = ['user-id']

    userId = ''

    async loadUser() {
        try {
            const response = await fetch(`/api/users/${this.props.userId()}`)

            if (!response.ok) {
                throw new Error(`Failed to load user ${this.props.userId()}`)
            }

            const user = await response.json()
            this.setState({ user })
        } catch (error) {
            this.onError(error)
        }
    }

    onMount() {
        this.loadUser()
    }

    render() {
        return html`<section>User profile</section>`
    }
}
```

{{t.pages.documentation.events_and_lifecycle.error_handling.content.you_can_use_the_same_approach_inside_event_handlers}}

```typescript
handleSave = async () => {
    try {
        await saveSettings(this.state.settings())
        this.dispatch('saved')
    } catch (error) {
        this.onError(error)
    }
}
```

{{t.pages.documentation.events_and_lifecycle.error_handling.content.this_keeps_the_component_s_local_control_flow_explicit_while_still_routing_every_report_through}}
