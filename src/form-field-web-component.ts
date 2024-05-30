import { WebComponent } from './web-component'
import { ObjectInterface } from './types'

export abstract class FormFieldWebComponent<
    P extends ObjectInterface<P> = Record<string, unknown>,
    S extends ObjectInterface<S> = Record<string, unknown>,
> extends WebComponent<P, S> {
    static formAssociated = true

    // The following properties and methods aren't strictly required,
    // but browser-level form controls provide them. Providing them helps
    // ensure consistency with browser-provided controls.
    // https://web.dev/articles/more-capable-form-controls#defining_a_form-associated_custom_element
    get form() {
        return this.internals?.form
    }
    get name() {
        return this.getAttribute('name')
    }
    get type() {
        return this.localName
    }
    get validity() {
        return this.internals?.validity
    }
    get validationMessage() {
        return this.internals?.validationMessage
    }
    get willValidate() {
        return this.internals?.willValidate
    }

    checkValidity() {
        return this.internals?.checkValidity()
    }
    reportValidity() {
        return this.internals?.reportValidity()
    }
    setFormValue(
        value: File | string | FormData | null,
        state?: File | string | FormData | null
    ) {
        return this.internals?.setFormValue(value, state)
    }
}
