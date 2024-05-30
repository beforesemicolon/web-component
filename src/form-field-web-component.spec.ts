import {FormFieldWebComponent} from "./form-field-web-component";

describe('FormFieldWebComponent', () => {
	it('should work', () => {
		class MyField extends FormFieldWebComponent<{value: string}> {
			static observedAttributes = ['value']
			value = ''
		}

		customElements.define('my-field', MyField)

		document.body.innerHTML = `
			<form>
				<my-field value="sample"></my-field>
			</form>
		`;

		const field = document.body.querySelector('my-field') as MyField;

		expect(field.value).toBe('sample')
		expect(field.props.value()).toBe('sample')
	});
})