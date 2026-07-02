---
name: Get Started
order: 2
title: Get Started - WebComponent by Before Semicolon
description: Learn how to build your first reactive Web Component using the WebComponent class.
layout: document
---

## Get Started

This tutorial will guide you step-by-step through creating, registering, templating, and using your first reactive custom element using `@beforesemicolon/web-component`.

### Step 1: Declaring the Component Class

To create a new component, declare a class that extends `WebComponent`.

```javascript
import { WebComponent } from '@beforesemicolon/web-component'

class MyButton extends WebComponent {
    // Component logic goes here
}
```

### Step 2: Defining the Custom Element Tag

Register the component class in the global `CustomElementRegistry` using the standard `customElements.define` method.

Custom element names MUST contain at least one hyphen (`-`) and should be written in lowercase (kebab-case) to prevent conflicts with standard HTML elements.

```javascript
customElements.define('my-button', MyButton)
```

### Step 3: Adding a Template

To render content, define a `render()` method in your class. The method should return an `HtmlTemplate` (created using the `html` tagged template literal), a plain HTML string, a native DOM `Node`, or `void`.

```javascript
import { WebComponent, html } from '@beforesemicolon/web-component'

class MyButton extends WebComponent {
    render() {
        return html` <button type="button">Click Me</button> `
    }
}

customElements.define('my-button', MyButton)
```

### Step 4: Using the Custom Element in HTML

Once the custom element is registered, you can place the `<my-button>` tag anywhere in your HTML document.

```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <title>WebComponent Tutorial</title>
        <!-- Include the compiled script containing your component definitions -->
        <script type="module" src="./my-button.js"></script>
    </head>
    <body>
        <my-button></my-button>
    </body>
</html>
```

### Next Steps

Now that you have built your first web component, explore the core features that make `@beforesemicolon/web-component` powerful:

-   **[Reactive Props](./props-and-state/props.md)**: Pass data into your components and handle attribute updates.
-   **[Reactive State](./props-and-state/state.md)**: Manage internal state and automatically trigger surgical DOM updates.
-   **[Lifecycle Hooks](./events-and-lifecycle/lifecycle.md)**: Run setup and cleanup code with `onMount` and `onDestroy`.
