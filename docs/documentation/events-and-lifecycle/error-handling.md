---
name: Error Handling
order: 7.3
title: Error Handling - WebComponent by Before Semicolon
description: Intercept and process runtime errors from render, state updates, styles, or lifecycles using the onError hook.
layout: document
---

## Error Handling

Handling runtime errors gracefully is crucial for building robust web applications. `@beforesemicolon/web-component` features a centralized `onError()` hook that allows you to intercept and handle errors occurring within the component boundary.

### The `onError` Hook

By default, the `onError` hook logs the error to the console using `console.error`.

```typescript
onError(error: Error | unknown): void {
    console.error(error);
}
```

You can override this method to customize how your component handles errors, such as showing a toast notification, logging to an external service, or dispatching an error event.

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

### What Triggers `onError`?

The component automatically wraps internal processes in `try/catch` blocks. If any of the following operations fail, the error is caught and passed to the `onError` hook:

-   **State Mutations**: Errors during `this.setState()`, such as trying to update state on an unmounted component.
-   **Dynamic Stylesheet Updates**: Errors inside `this.updateStylesheet()` or when compiling reactive styles using the `css` template tag.
-   **Custom Event Dispatching**: Errors occurring while creating or dispatching custom events through `this.dispatch()`.
-   **Lifecycle Connections**: Errors thrown during the component connection or adoption phases, including setups inside `onMount()` and `onAdoption()`.
-   **Lifecycle Disconnections**: Errors thrown when the component is being disconnected, including during the mount cleanup callbacks and `onDestroy()`.

---

### Centralized Error Tracking Pattern

In larger applications, repeating error handling logic in every component is inefficient. The recommended pattern is to build a base `Component` class that extends `WebComponent` to centralize logging and error telemetry across all components.

Here is an example of a base class setup:

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

Now, instead of extending `WebComponent` directly, your feature components extend `BaseComponent`:

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

### Reporting Your Own Component Errors

`onError()` is not only for errors WebComponent catches internally. If your component has its own async work, event handlers, or imperative code, catch those errors locally and call `this.onError(error)`.

This is especially useful when all components extend a shared base component. The base class becomes the single reporting boundary, while individual components decide which local failures should be reported.

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

You can use the same approach inside event handlers:

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

This keeps the component's local control flow explicit while still routing every report through the same base `onError()` implementation.
