---
name: Lifecycle
order: 7.2
title: Lifecycle - WebComponent by Before Semicolon
description: Learn how to hook into key execution stages of your WebComponent using onMount, onDestroy, onUpdate, onAdoption, onError, and Markup effects.
layout: document
---

## Lifecycle

Every `@beforesemicolon/web-component` instance transitions through a series of lifecycle phases, starting from its construction to its destruction and removal from the DOM.

Instead of dealing with native custom element callback names, `@beforesemicolon/web-component` provides clean, high-level hooks to handle setup, side effects, updates, cleanup, adoption, and runtime errors.

---

### Lifecycle Hook Methods

#### `onMount()`

Called when the element is first connected to the DOM. This is the ideal place to run setups such as setting up timers, fetching remote data, or adding event listeners.

-   **Cleanup function**: The `onMount()` method can optionally return a cleanup function. If provided, this function is automatically executed when the component is disconnected from the DOM, right before `onDestroy()` is called.

```javascript
onMount() {
    console.log('Component is now in the DOM.');

    const onResize = () => console.log('Resized');
    window.addEventListener('resize', onResize);

    // Return cleanup callback
    return () => {
        window.removeEventListener('resize', onResize);
    };
}
```

#### `onDestroy()`

Called when the element is disconnected and removed from the DOM. Use this hook for final cleanups if they were not already handled in the cleanup callback returned by `onMount()`.

```javascript
onDestroy() {
    console.log('Component has been removed from the DOM.');
}
```

#### `onUpdate(name, newValue, oldValue)`

Called when an observed attribute (declared in `static observedAttributes`) changes value. This hook runs only after the component is fully mounted.

```typescript
onUpdate(name: string, newValue: unknown, oldValue: unknown): void
```

```javascript
static observedAttributes = ['theme'];

onUpdate(name, newValue, oldValue) {
    if (name === 'theme') {
        console.log(`Theme changed from ${oldValue} to ${newValue}`);
    }
}
```

#### `onAdoption()`

Called when the browser's native `adoptedCallback()` fires, which happens when the custom element is moved to a new document. This is uncommon in most apps, but useful for iframe, portal, document migration, and testing scenarios.

```javascript
onAdoption() {
    console.log('Component has been adopted into a new document.');
}
```

#### `onError(error)`

Called when WebComponent catches an error from rendering, state updates, stylesheet updates, lifecycle execution, adoption, or cleanup. The default implementation logs the error with `console.error`.

```typescript
onError(error: Error | unknown): void
```

```javascript
onError(error) {
    reportError(error)
}
```

Use `onError()` for component-local error reporting or fallback state. Avoid throwing inside `onError()` unless you intentionally want the error to escape the component boundary.

---

### Side Effects with `effect()`

Because WebComponent is powered by Markup, you can use Markup's `effect()` helper for reactive side effects. An effect runs immediately, tracks any reactive getters it reads synchronously, and runs again when those values change.

Use `effect()` when the side effect should follow reactive props or state. Keep it out of `render()` so rendering stays declarative.

```javascript
import { WebComponent, effect, html } from '@beforesemicolon/web-component'

class SaveStatus extends WebComponent {
    static observedAttributes = ['status']

    status = 'idle'

    onMount() {
        return effect(() => {
            document.title = `Status: ${this.props.status()}`
        })
    }

    render() {
        return html`<p>${this.props.status}</p>`
    }
}
```

The function returned by `effect()` unsubscribes the effect. Returning it from `onMount()` ties the effect to the component lifetime, so WebComponent calls it when the element disconnects.

### Checking Mount Status

You can check whether the component is currently connected to the DOM using the `this.mounted` boolean getter.

```typescript
get mounted(): boolean
```

This is particularly useful when performing asynchronous tasks (like fetching data) to prevent updating the state on an unmounted component, which would otherwise throw an error.

```javascript
async fetchData() {
    const data = await api.getDetails();
    if (this.mounted) {
        this.setState({ data });
    }
}
```

---

### Lifecycle Order of Execution

Understanding the exact sequence in which callbacks are invoked helps in structuring components properly. The lifecycles run in the following sequence:

1. **`constructor`**  
   The browser instantiates the element. `@beforesemicolon/web-component` maps `static observedAttributes` to internal reactive props getters and setters, throwing errors if any prop conflicts with reserved keywords.
2. **`render`**  
   Called during the connection phase. The component renders its template and appends it to its content root.
3. **`stylesheet configuration`**  
   Initializes and applies stylesheets (e.g., from the `stylesheet` property or the `css` tagged template).
4. **`onMount`**  
   Triggered immediately after rendering is complete and stylesheets are attached. The return value (if it is a function) is cached as the mount cleanup callback.
5. **`effect` callbacks**  
   Markup effects created during `onMount()` run immediately and re-run later when their tracked reactive getters change. If the effect unsubscribe is returned from `onMount()`, it becomes the component's mount cleanup callback.
6. **`onUpdate`**  
   Runs every time an observed attribute changes (only while the component is mounted).
7. **`adoptedCallback` / `onAdoption`**  
   Runs when the browser adopts the element into a different document.
8. **`Mount Cleanup`**  
   Runs the cleanup function returned by `onMount()` (if any) when the element disconnects.
9. **`onDestroy`**  
   Runs immediately after the mount cleanup function finishes.
10. **`onError`**  
    Runs whenever WebComponent catches an error from one of its guarded rendering, update, stylesheet, lifecycle, adoption, or cleanup paths.
