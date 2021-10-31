## Directives
Directives are simply hashed attributes which are meant to help you do tedious things in HTML template that
often times requires you to do DOM manipulations to achieve.

There are only 4 directives and all of them do something specific on the element it is attached to. As of now
you cannot create custom directives.

One thing in common for all directives is that you don't need to use the curly braces to specify data or logic.
Their value are already understood to be information to be executed for a result.

### #if
The `#if` directive will simply add or remove a node element from the DOM.

One important thing to know about the `#if` directive is that the element is always the same instance and 
it simply puts or remove it from the DOM based of something being TRUTHY or FALSY.

```js
class InputField extends WebComponent {
  static observedAttributes = ['label', 'value', 'name', 'type', 'error-message'];
  
  get template() {
    return `
      <label class="input-field">
        <span class="field-label" #if="label">{label}</span>
        <input type="{type}" name="{name}" value="{value}"/>
        <span class="error-message" #if="errorMessage">{errorMessage}</span>
      </label>
    `
  }
}

InputField.register();
```

Above example is an input field that will only add the label and error span elements to the DOM once their values are
not FALSY.

### #repeat
The `#repeat` directive will repeat the DOM element based on a list-like object length or a specific number.

#### repeat based on number
You can specify how many times you want the element to be repeated by simply providing a number.

Below example will repeat the `.list-item` div 10 times.

```js
class FlatList extends WebComponent {
  get template() {
    return `
      <div class="list-item" #repeat="10">item</div>
    `
  }
}
```

#### repeat based of data
You can also provide list-like objects and object literal as value, and it will repeat the element based on number of
entries in the object. 

It supports the following objects:
- Set
- Map
- Array
- Object Literal

The below example will repeat the `.list-item` div based on the number of items in the `item` array.

```js
class FlatList extends WebComponent {
  items = [2, 4, 6];
  
  get template() {
    return `
      <div class="list-item" #repeat="items">item</div>
    `
  }
}
```

The following will also work just fine.

```js
class FlatList extends WebComponent {
  items = {
    'first': 200,
    'second': 800,
    'third': 400,
  };
  
  get template() {
    return `
      <div class="list-item" #repeat="items">item</div>
    `
  }
}
```

#### $item
It would make no sense to simply repeat elements without a way to reference the items in the list. For that reason,
`WebComponent` exposes a `$item` scoped property at the DOM element level which will contain the value of the item
for that element.

It is available whether you use a number or list-like objects.
```js
class FlatList extends WebComponent {
  get template() {
    return `
      <div class="list-item" #repeat="10">{$item}</div>
    `
  }
}
```

The `$item` will be available to be used on the element attributes and any child node.

```js
class FlatList extends WebComponent {
  items = [2, 4, 6];
  
  get template() {
    return `
      <div class="list-item" #repeat="items">{$item}</div>
    `
  }
}
```

#### $key
Similarly, you can read the key for the item you are iterating. When using number, Array and Set as value, the `$key` will
be an index, number starting from 0. For Map and Object literal, the key will be the key of the item.

```js
class FlatList extends WebComponent {
  get template() {
    return `
      <div class="list-item item-{$key}" #repeat="10">{$item}</div>
    `
  }
}
```

```js
class FlatList extends WebComponent {
  items = {
    'first': 200,
    'second': 800,
    'third': 400,
  };
  
  get template() {
    return `
      <div class="list-item {$key}" #repeat="items">{key} item: {$item}</div>
    `
  }
}
```

### #ref

### #attr

#### Recommended next: [LiveCycles](https://github.com/beforesemicolon/web-component/blob/master/doc/livecycles.md)