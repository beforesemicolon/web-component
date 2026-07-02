---
name: Installation
order: 3
title: Installation - WebComponent by Before Semicolon
description: Install WebComponent via npm, yarn, pnpm or include it via CDN.
layout: document
---

## Installation

`@beforesemicolon/web-component` is a plug-and-play library. It does not require complex build steps, compiler configuration, or bundlers. You can use it by installing it via a package manager or directly including it from a CDN in a standard browser script tag.

### Via Package Managers

Install the package using your package manager of choice:

#### npm

```bash
npm install @beforesemicolon/web-component
```

#### yarn

```bash
yarn add @beforesemicolon/web-component
```

#### pnpm

```bash
pnpm add @beforesemicolon/web-component
```

Once installed, you can import `WebComponent`, styling utilities, and Markup templating functions directly into your JavaScript or TypeScript files:

```javascript
import { WebComponent, html, css } from '@beforesemicolon/web-component'
```

### Via CDN

For rapid prototyping or zero-build environments, you can include the script from a CDN (such as **unpkg** or **jsDelivr**) in your document's `<head>`.

#### Latest Version

```html
<script src="https://unpkg.com/@beforesemicolon/web-component/dist/client.js"></script>
```

#### Specific Version

```html
<script src="https://unpkg.com/@beforesemicolon/web-component@1.19.2/dist/client.js"></script>
```

### CDN Global Namespaces

When using the client CDN build, `@beforesemicolon/web-component` exposes a global variable `BFS`. Under this namespace, you can access the core elements:

-   **`BFS.WebComponent`**: The base class for building custom elements.
-   **`BFS.css`**: The tagged template styling helper.
-   **`BFS.MARKUP`**: The underlying Markup library namespace containing `html`, `state`, `effect`, and other template utilities.

Here is an example of accessing these APIs from browser-native scripts:

```javascript
const { WebComponent, css } = BFS
const { html, state } = BFS.MARKUP

class MyCounter extends WebComponent {
    initialState = { count: 0 }

    render() {
        return html`
            <button
                type="button"
                onclick="${() =>
                    this.setState({ count: this.state.count() + 1 })}"
            >
                Count: ${this.state.count}
            </button>
        `
    }
}
customElements.define('my-counter', MyCounter)
```
