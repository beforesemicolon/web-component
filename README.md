![BFS Web Component Framework](https://github.com/beforesemicolon/web-component/blob/master/docs/cover.jpg)

A lightweight and powerful web component framework intended to remove the tedious aspect of building reactive Web Components.

<p align="center"><strong>Web Component API As It Should Have Been</strong></p>

🥇 Build **✅ Flexible, ✅ Extensible, and ✅ Contextful Components** with **✅ Reactive Template**, **✅ Powerful Directives**, **✅ Event and Data Binding**, **✅ Simple API** in a **✅ Lightweight package** right in Your Browser.

🚫 No Tedious State Management and DOM Manipulation! 

🚫 No Robust Data Store and Context Setup! 

🚫 No Verbose API! 

🚫 No JSX! 

🚫 No Virtual DOM! 

🚫 No Weird HTML or Javascript Syntax! 

🚫 No Decorators Hell!

**Learn More From The [Documentation](https://github.com/beforesemicolon/web-component#documentation)**


### Example
Declare a simple action button component
```js
class ActionButton extends WebComponent {
  static observedAttributes = ['label', 'type', 'disabled', 'autofocus', 'name'];
  
  get stylesheet() {
    return `
      <style>
        :host {
          display: inline-block;
        }
        
        :host .my-button {
          background: #222;
          color: #fff;
        }
      </style>
    `;
  }
  
  get template() {
    return `
      <button 
        class="my-button" 
        type="{type || 'button'}"
        attr.disabled="disabled"
        attr.autofocus="autofocus"
        attr.name="name"
        onclick="handleClick($event)"
        >
        <slot>{label}</slot>
      </button>
    `;
  }
  
  handleClick(event) {
    this.dispatchEvent(new Event('click'));
  }
}

ActionButton.register();
```
Create a simple list data renderer that uses a action button to request more data
```js
class PaginatedList extends WebComponent {
  static observedAttributes = ['tag-name', 'loading', 'items'];
  
  get template() {
    return `
      <p if="loading">
        <slot name="loading">loading...</slot>
      </p>
      <p if="!loading && !items.length">
        <slot name="empty">List is Empty</slot>
      </p>
      <div if="!loading && items.length" class="paginated-list">
        <${this.tagName || 'div'} repeat="items" details="{$item}">{$item}</${this.tagName || 'div'}>
        <action-button onclick="loadMore()">load more</action-button>
      </div>
    `;
  }
  
  loadMore() {
    this.dispatchEvent(new Event('loadmore'));
  }
}

PaginatedList.register();
```

In your HTML you can simply use the tag normally.

```html
<paginated-list items="['one', 'two', 'three']" tag-name="p"></paginated-list>
```

### Install

This module can be used directly in the browsers as well in Node environment

#### Browser
```html 

<!-- use the latest version -->
<script src="https://unpkg.com/@beforesemicolon/web-component/dist/web-component.min.js"></script>

<!-- use a specific version -->
<script src="https://unpkg.com/@beforesemicolon/web-component@0.0.4/dist/web-component.min.js"></script>

<!-- link you app script after -->
<script src"app.js"></script>
```

#### NodeJs

```
npm install @beforesemicolon/web-component
```

You can then import the `WebComponent` class wherever you need it.

```js
const {WebComponent} = require('@beforesemicolon/web-component');
```

#### ⚠️ Warning

Make sure to exclude the `jsdom` module when compiling or building your project to run in the browser.
This module is used so `WebComponent` can work in NodeJs (not a browser environment). In browsers, the DOM
will be available and things will be fine.

For example:

```js
// webpack.config.js

module.exports = {
  //...
  externals: {
    jsdom: 'jsdom',
  },
};
```

```js
// esbuild

require('esbuild').build({
  entryPoints: ['app.js'],
  outfile: 'out.js',
  external: ['jsdom'], // <<< exclude
})
```

    Check your bundler documentation to see how it handles specific modules exclusions.

### Documentation

- [WebComponent](https://github.com/beforesemicolon/web-component/blob/master/docs/WebComponent.md)
- [ContextProviderComponent](https://github.com/beforesemicolon/web-component/blob/master/docs/ContextProviderComponent.md)
- [Configurations](https://github.com/beforesemicolon/web-component/blob/master/docs/configurations.md)
- [Template](https://github.com/beforesemicolon/web-component/blob/master/docs/template.md)
- [Events](https://github.com/beforesemicolon/web-component/blob/master/docs/events.md)
- [Attributes](https://github.com/beforesemicolon/web-component/blob/master/docs/attributes.md)
- [Properties](https://github.com/beforesemicolon/web-component/blob/master/docs/properties.md)
- [Context](https://github.com/beforesemicolon/web-component/blob/master/docs/context.md)
- [Directives](https://github.com/beforesemicolon/web-component/blob/master/docs/directives.md)
- [LiveCycles](https://github.com/beforesemicolon/web-component/blob/master/docs/livecycles.md)
- [Styling](https://github.com/beforesemicolon/web-component/blob/master/docs/stylesheet.md)
- [Error Handling](https://github.com/beforesemicolon/web-component/blob/master/docs/errors.md)
