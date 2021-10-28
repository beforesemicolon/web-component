## Stylesheet
The stylesheet is a way to define the style for the component.

```js
class SubmitButton extends WebComponent {
  static observedAttributes = ['label'];
  
  get stylesheet() {
    return `
      <style>
        :host {
          display: inline-block;
        }
        
        button {
          background: blue;
          color: #222;
        }
      </style>
    `;
  }
  
  get template() {
    return '<button type="submit">{label}</button>'
  }
}
```

You don't need to place the CSS inside the style tag when defining the `stylesheet` property. `WebComponent` will
automatically place it inside the `style` tag for you whether inside the shadow root or the head tag.

### mode none
If the mode of the component is set to none, the style is then place inside the `head` tag in the document and any 
reference of `:host` will be replaced with the name of the tag.

The above example style will look like the following the head tag.

```html
<head>
	<style id="submit-button">
		submit-button {
			display: inline-block;
		}

		button {
			background: blue;
			color: #222;
		}
	</style>
</head>
```

#### Recommended next: [Template](https://github.com/beforesemicolon/web-component/blob/master/doc/template.md)