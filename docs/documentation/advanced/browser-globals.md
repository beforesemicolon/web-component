---
name: Browser Globals
order: 8.3
title: Browser Globals - WebComponent by Before Semicolon
description: Use WebComponent and re-exported Markup APIs via CDN and global window namespaces.
layout: document
---

## Browser Globals

For quick prototyping, testing, or simple web pages, you might prefer not to set up a build pipeline (like Webpack, Vite, or Rollup). `@beforesemicolon/web-component` fully supports **zero-build** setups by offering a pre-bundled client script that exposes all API functions on a single browser global namespace.

---

### CDN Integration

To use the component library directly in your HTML files, load the client script from a CDN (such as `unpkg.com` or `jsdelivr.net`):

```html
<!-- Load the latest version -->
<script src="https://unpkg.com/@beforesemicolon/web-component/dist/client.js"></script>

<!-- Or pin a specific version (recommended for production) -->
<script src="https://unpkg.com/@beforesemicolon/web-component@1.19.2/dist/client.js"></script>
```

Once loaded, the library attaches a single global variable `BFS` to the browser's `window` object.

---

### The `BFS` Global Namespace

The `window.BFS` namespace is structured as follows:

-   **`window.BFS.WebComponent`**: The core component base class.
-   **`window.BFS.css`**: The tagged template function for creating reactive scoped CSS.
-   **`window.BFS.MARKUP`**: An object containing all the re-exported APIs from the underlying `@beforesemicolon/markup` package.

#### Re-exported Markup APIs under `BFS.MARKUP`

Through `BFS.MARKUP`, you can access all template rendering and reactivity tools:

-   **`html`**: Tagged template function for rendering DOM elements.
-   **`state`**: Creates reactive state getters and setters.
-   **`effect`**: Tracks side-effects depending on states.
-   **Helper utilities**: `when`, `repeat`, `suspense`, `visible`, etc.

---

### Complete Zero-Build Example

Here is a complete, single-file HTML page showing how to declare and use a reactive custom element without any compilers or bundlers:

```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <title>Zero-Build Web Component Example</title>
        <!-- 1. Load the library from CDN -->
        <script src="https://unpkg.com/@beforesemicolon/web-component/dist/client.js"></script>
    </head>
    <body>
        <!-- 2. Declare custom elements in the HTML -->
        <user-card username="john_doe"></user-card>

        <script>
            // 3. Extract APIs from the global namespace
            const { WebComponent, css } = window.BFS
            const { html, state } = window.BFS.MARKUP

            // 4. Define your reactive component class
            class UserCard extends WebComponent {
                static observedAttributes = ['username']

                initialState = {
                    name: 'John Doe',
                    role: 'Developer',
                }

                // Scoped, reactive CSS
                stylesheet = css`
                    :host {
                        display: block;
                        padding: 1rem;
                        border: 1px solid #ccc;
                        border-radius: 8px;
                        font-family: sans-serif;
                        background-color: #f9f9f9;
                    }
                    h3 {
                        margin: 0 0 0.5rem;
                        color: var(--primary-color, #333);
                    }
                `

                render() {
                    return html`
                        <h3>${() => this.state.name()}</h3>
                        <p>Username: @${this.props.username}</p>
                        <p>Role: ${() => this.state.role()}</p>
                    `
                }
            }

            // 5. Register the element with the browser
            customElements.define('user-card', UserCard)
        </script>
    </body>
</html>
```

---

### Standard ES Modules Alternative

If you want to use modern JavaScript imports (`import` syntax) without a bundler, you can import directly from the CDN if the browser supports ES Modules:

```javascript
import {
    WebComponent,
    html,
    state,
} from 'https://unpkg.com/@beforesemicolon/web-component/dist/esm/index.js'
```

Pin the package version for production pages so CDN updates cannot change behavior unexpectedly.
