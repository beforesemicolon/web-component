---
name: Stylesheet
order: 6.1
layout: document
title: Stylesheet - WebComponent by Before Semicolon
description: Learn how to load, assign, and manage component styles using the stylesheet property.
---

## Stylesheet

The `stylesheet` class property is the primary way to define styling for your component. WebComponent accepts a variety of stylesheet formats and processes them automatically based on your Shadow DOM configurations.

### Supported Stylesheet Formats

You can assign a CSS string, a native `CSSStyleSheet` instance, or a CSS import assertion to the `stylesheet` property.

#### 1. CSS Strings

The simplest way is to define your stylesheet as a plain CSS string:

```javascript
import { WebComponent, html } from '@beforesemicolon/web-component'

class SimpleBtn extends WebComponent {
    stylesheet = `
        button {
            background-color: var(--button-bg, ButtonFace);
            color: var(--button-color, ButtonText);
            border: 1px solid var(--button-border, ButtonText);
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
        }
        button:hover {
            opacity: 0.9;
        }
    `

    render() {
        return html`<button><slot></slot></button>`
    }
}
```

#### 2. CSS Import Assertions

If your build environment or browser supports CSS module imports, you can import a `.css` file directly and assign the stylesheet export:

```javascript
import { WebComponent, html } from '@beforesemicolon/web-component'
import styleSheet from './style.css' with { type: 'css' }

class AssetBtn extends WebComponent {
    stylesheet = styleSheet

    render() {
        return html`<button><slot></slot></button>`
    }
}
```

#### 3. Native `CSSStyleSheet`

You can also construct stylesheets imperatively:

```javascript
const sheet = new CSSStyleSheet()
sheet.replaceSync('button { font-weight: bold; }')

class BoldBtn extends WebComponent {
    stylesheet = sheet
}
```

### Shadow DOM vs. Light DOM Behavior

Behind the scenes, WebComponent uses **Adopted StyleSheets** to inject your styles. Where those stylesheets are adopted depends on your component configuration.

#### Under Shadow DOM (Default)

If Shadow DOM is active, the style is adopted by the Shadow Root of the component. It keeps styles isolated and allows the use of the `:host` selector.

```css
:host {
    display: inline-block;
}
```

#### Under Light DOM

If you disable Shadow DOM by setting `config.shadow = false`, the component cannot adopt styles locally since there is no Shadow Root. WebComponent handles this by adopting the styles on the document (or the closest containing ancestor shadow root).

Because global styles can leak, WebComponent automatically parses and rewrites specific selectors:

-   `:host` is rewritten to the custom element's tag name (e.g. `my-element`).
-   `:host-context(selector)` is rewritten to match the target context (e.g. `selector my-element`).

```css
/* Original CSS */
:host {
    display: block;
}
:host(.active) {
    color: red;
}
:host-context(.dark-theme) {
    background-color: black;
}

/* Rewritten for <my-element> */
my-element {
    display: block;
}
my-element.active {
    color: red;
}
.dark-theme my-element {
    background-color: black;
}
```

This ensures your styling rules continue to work as expected, even if you decide to toggle the Shadow DOM configuration.
