---
name: updateStylesheet
order: 6.3
layout: document
title: updateStylesheet - WebComponent by Before Semicolon
description: Swap stylesheets dynamically at runtime using updateStylesheet.
---

## updateStylesheet

While the `css` tagged template is perfect for fine-grained style changes, there are times when you need to replace or detach stylesheets entirely (e.g., swapping global themes, switching between light and dark mode stylesheets, or handling third-party stylesheets). You can perform these dynamic updates using `this.updateStylesheet()`.

### Method Signature

```typescript
updateStylesheet(sheet: CSSStyleSheet | string | null): void
```

#### Parameters

-   **`sheet`**:
    -   `CSSStyleSheet`: Adopts the new stylesheet object directly.
    -   `string`: Parses the CSS string into a stylesheet, rewrites `:host` selectors if Shadow DOM is disabled, and adopts it.
    -   `null`: Detaches and removes the current stylesheet from the element's content root (or document).

### Dynamic Theme Swapping Example

In this example, we define two themes and swap the stylesheet dynamically when a user clicks a button:

```javascript
import { WebComponent, html } from '@beforesemicolon/web-component'

const lightTheme = `
    :host {
        display: block;
        background-color: white;
        color: black;
        padding: 16px;
    }
`

const darkTheme = `
    :host {
        display: block;
        background-color: #222;
        color: white;
        padding: 16px;
    }
`

class ThemeBox extends WebComponent {
    initialState = { isDark: false }
    stylesheet = lightTheme

    toggleTheme = () => {
        this.setState((prev) => {
            const nextIsDark = !prev.isDark

            // Swap stylesheets dynamically
            this.updateStylesheet(nextIsDark ? darkTheme : lightTheme)

            return { isDark: nextIsDark }
        })
    }

    render() {
        return html`
            <div>
                <p>
                    Current Theme: ${() =>
                        this.state.isDark() ? 'Dark' : 'Light'}
                </p>
                <button onclick="${this.toggleTheme}">Toggle Theme</button>
            </div>
        `
    }
}

customElements.define('theme-box', ThemeBox)
```

### Detaching Stylesheets

To remove all styling applied via the component's stylesheet property, call `this.updateStylesheet(null)`:

```javascript
// Remove the current adopted stylesheet
this.updateStylesheet(null)
```

### How WebComponent Handles Swapping

When you call `updateStylesheet(sheet)`, WebComponent will:

1. Locate the currently active stylesheet and filter it out of the container's `adoptedStyleSheets` array.
2. Convert the new stylesheet parameter into a native `CSSStyleSheet` if it is a string.
3. Apply Light DOM selector rewriting (e.g., converting `:host` to the element's tag name) if `config.shadow` is `false`.
4. Append the new stylesheet to `adoptedStyleSheets` on either:
    - The element's `ShadowRoot` (if Shadow DOM is enabled).
    - The `document` or parent Shadow Root (if Shadow DOM is disabled).
