---
name: AI Guide
order: 3.2
title: AI Guide - WebComponent by Before Semicolon
description: AI-first guide to @beforesemicolon/web-component APIs, source boundaries, and common implementation mistakes.
layout: document
---

## AI Guide

Use this page first if you are an AI agent scanning the WebComponent docs.

## Read First

-   [What is WebComponent?](./index.md)
-   [Get Started](./get-started.md)
-   [Guide & Best Practices](./guide.md)
-   [Creating Components](./fundamentals/creating-components.md)
-   [Props](./props-and-state/props.md)
-   [State](./props-and-state/state.md)
-   [Stylesheet](./styling/stylesheet.md)
-   [Events](./events-and-lifecycle/events.md)

## Package Boundary

-   `@beforesemicolon/web-component` exports `WebComponent`, `HTMLComponentElement`, `css`, and the WebComponent-specific types.
-   It also re-exports `@beforesemicolon/markup`, so examples can import `html`, `repeat`, `when`, `state`, and other Markup APIs from `@beforesemicolon/web-component`.
-   The browser bundle exposes `window.BFS.WebComponent`, `window.BFS.css`, and `window.BFS.MARKUP`.

## Runtime Facts

-   `static observedAttributes` defines public attributes and creates camelCase reactive props under `this.props`.
-   Default prop values are class fields with the camelCase prop name.
-   `initialState` defines local state getters under `this.state`.
-   `this.setState()` only works after the component is mounted.
-   `this.dispatch(name, detail)` creates a `CustomEvent` with `detail`. Add native custom event options manually only if the runtime API changes to support them.
-   `render()` may return a Markup `HtmlTemplate`, a string, a DOM `Node`, or nothing.
-   `stylesheet` accepts a CSS string, a `CSSStyleSheet`, or a reactive `css` result.
-   `config.shadow` defaults to `true`.
-   When `config.shadow = false`, `:host` selectors are rewritten to the custom element tag.

## Common Tasks

-   Public input: add the kebab-case name to `static observedAttributes` and read `this.props.camelName`.
-   Internal UI state: add a key to `initialState` and update it with `this.setState()`.
-   DOM element access: add `ref="name"` and use `this.refs.name?.[0]` after render.
-   Component output: call `this.dispatch('event-name', { value })`.
-   Mount side effects: use `onMount()` and return cleanup.
-   Prop reactions: use `onUpdate(name, newValue, oldValue)`.
-   Scoped CSS: assign `stylesheet`.
-   Reactive CSS: assign `stylesheet = css\`...\``.
-   Native forms: set `static formAssociated = true` and use `this.internals`.

## Avoid

-   Do not call `this.setState()` in the constructor or during class field initialization.
-   Do not mutate arrays or objects inside state in place; return a new value from `setState`.
-   Do not document native lifecycle callbacks as extension points; use `onMount`, `onUpdate`, `onDestroy`, and `onAdoption`.
-   Do not assume `dispatch()` bubbles or crosses shadow boundaries unless the source code supports options for that.
-   Do not use long one-line custom element examples when several attributes are present.
