## Attributes
Any attribute placed on the component tag are HTML attributes but in `WebComponent` the attributes referred to are the
ones you decide to observe for changes.

### Defining attributes
These are called `observedAttributes` and must be declared as an array of string attributes exactly how they
would look like when placed on the HTML tag.

```js
class SubmitButton extends WebComponent {
  static observedAttributes = ['label'];
  
  get template() {
    return '<button type="submit">{label}</button>'
  }
}
```

In other libraries like React, these are referred to as **props**. Attributes that you get notified when they change.

### Accessing attribute
`WebComponent` will automatically map the attributes to properties in the class.

If the attribute is in kebab case they will be changed into camel case.

```js
class StatusIndicator extends WebComponent {
  static observedAttributes = ['current-status'];
  
  get template() {
    return '<div class="curr-status">{currentStatus}</button>'
  }
}
```

Since attributes are mapped to be properties, they also work like [properties](https://github.com/beforesemicolon/web-component/blob/master/doc/properties.md).

They will also update the DOM if changed.

```js
const indicator = new StatusIndicator();

indicator.currentStatus = 'Pending';

document.body.appendChild(indicator)
```

### Attributes vs Properties
Attributes end up working just like properties because they are changed to be properties. On top of that,
they have the advantage of triggering changes when they are set or changed on the HTML tag.

You should prefer attributes whenever you are expecting data to be set directly on the tag. 

`WebComponents` allows you to receive simple to complex data via attributes.

```js
<flat-list list="[2, 4, 6, 90]"></flat-list>

// when inside another component template you can refer to the property
// using the curly braces
<flat-list list="{items}"></flat-list>
```

#### Recommended next => [LiveCycles](https://github.com/beforesemicolon/web-component/blob/master/doc/livecycles.md)
