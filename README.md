# Web Component
A web component framework that simplifies how web components are created on the client with 
automatic properties and attribute watch, template data binding and auto update on render and more.

------- `Web Component As It Should Have Been` -------

#### ⚠️ This is in Beta!!

This module already includes all the MVP features it needs to be used, but 
it is still lacking robust test coverage to be recommended for production

### Install

```html 

<!-- use the latest version -->
<script src="https://unpkg.com/@beforesemicolon/web-component/dist/web-component.min.js"></script>

<!-- use a specific version -->
<script src="https://unpkg.com/@beforesemicolon/web-component@0.0.2/dist/web-component.min.js"></script>

<!-- link you app script after -->
<script src"app.js"></script>
```

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

```html
<my-button label="click me"></my-button>
```

### The Motivation

Web Components are super powerful, but they do not solve all the needs when it comes to build components.
Often times it is very manual and requires a lot of painful manual work to get things to work.

Other libraries like Lit and Stencil try to deal with this issue by reinventing the way you work with these APIs
rather than extend it to something that is much easier to deal with. They pretty much end up looking much like
other frameworks like React, Vue and Angular that compiles to WebComponents which they already do.

BFS Web Component takes a different stab at this by enhancing and trying to "fix" these APIs into something
that simply deals with the pain points and still allow you to work with Web Component with almost no additional
things to learn.

Web Component is a simply syntactic sugar to turn Web Components APIs into what they could be if all the gaps were dealt with by:

- Handling attributes and properties mapping of the component;
- Adding data binding to the template string to inject data;
- Doing all the DOM manipulation and change on properties and attribute changes;
- Provide same or familiar Web Component API for a very small learning curve
- Not needing to compile anything to native Web Components;
- Covering Web Components Best Practices in its core implementation;
- Keeping it simple. It is just Javascript as you know it;

You can learn more in finer details by reading **[this article]()** on this motivation and what drives this project.

### Documentation

- [WebComponent](https://github.com/beforesemicolon/web-component/blob/master/doc/WebComponent.md)
- [Configuration](https://github.com/beforesemicolon/web-component/blob/master/doc/configuration.md)
- [Template](https://github.com/beforesemicolon/web-component/blob/master/doc/template.md)
- [Styling](https://github.com/beforesemicolon/web-component/blob/master/doc/stylesheet.md)
- [LiveCycles](https://github.com/beforesemicolon/web-component/blob/master/doc/livecycles.md)
- [Attributes](https://github.com/beforesemicolon/web-component/blob/master/doc/attributes.md)
- [Properties](https://github.com/beforesemicolon/web-component/blob/master/doc/properties.md)
