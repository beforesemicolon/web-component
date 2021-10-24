# Web Component
A web component framework that simplifies how web components are created on the client with 
automatic properties and attribute watch, template data binding and auto update on render and more.

------- `Web Component As It Should Have Been` -------

#### ⚠️ This is in Beta!!

This module already includes all the MVP features it needs to be used. Although it has unit tests
it still needs to be taken through enough test cases to be recommended for production.

🧪 **Help Test It** 🧪 and open issues when you find something. It will be super appreciated! 😁

### Install

This module can be used directly in the browsers as well in Node environment

#### Browser
```html 

<!-- use the latest version -->
<script src="https://unpkg.com/@beforesemicolon/web-component/dist/web-component.min.js"></script>

<!-- use a specific version -->
<script src="https://unpkg.com/@beforesemicolon/web-component@0.0.2/dist/web-component.min.js"></script>

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

### Usage

```js
// app.js

class MyButton extends WebComponent {
  static observedAttributes = ['label', 'type', 'disabled'];
  
  get stylesheet() {
    return `
      <style>
        :host {
          display: inline-block;
        }
        
        .my-button {
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
        onclick="handleClick($event)"
        ${this.disabled ? 'disabled' : ''}
        >
        {label}
      </button>
    `;
  }
  
  handleClick(event) {
    this.dispatchEvent(new Event('click'));
  }
}

MyButton.register();
```

In your HTML you can simply use the tag normally.

```html
<my-button label="click me"></my-button>
```

### Documentation

- [WebComponent](https://github.com/beforesemicolon/web-component/blob/master/doc/WebComponent.md)
- [Configuration](https://github.com/beforesemicolon/web-component/blob/master/doc/configuration.md)
- [Template](https://github.com/beforesemicolon/web-component/blob/master/doc/template.md)
- [Events](https://github.com/beforesemicolon/web-component/blob/master/doc/events.md)
- [Attributes](https://github.com/beforesemicolon/web-component/blob/master/doc/attributes.md)
- [Properties](https://github.com/beforesemicolon/web-component/blob/master/doc/properties.md)
- [LiveCycles](https://github.com/beforesemicolon/web-component/blob/master/doc/livecycles.md)
- [Styling](https://github.com/beforesemicolon/web-component/blob/master/doc/stylesheet.md)
