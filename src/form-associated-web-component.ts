import { WebComponent } from './web-component'
import { ObjectInterface } from './types'

export abstract class FormAssociatedWebComponent<
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

    formAssociatedCallback(form: HTMLFormElement) {
        this.onFormAssociation(form)
    }

    #updateFormValueAndValidity() {
        const [newValue, errorMessage] = this.onValidateValue()

        if (errorMessage) {
            this.internals.setValidity({ customError: true }, errorMessage)
        } else {
            this.internals.setValidity({})
        }

        this.setFormValue(newValue)
    }

    onMount() {
        this.#updateFormValueAndValidity()
        return super.onMount()
    }

    onUpdate(
        name: keyof P,
        newValue: P[keyof P] | null,
        oldValue: P[keyof P] | null
    ) {
        this.#updateFormValueAndValidity()
        super.onUpdate(name, newValue, oldValue)
    }

    /**
     * must return a [newValue, errorMessage]
     */
    onValidateValue(): [File | string | FormData | null, string | null] {
        return ['', null]
    }

    onFormAssociation(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        form: HTMLFormElement
    ) {}

    formDisabledCallback(disabled: boolean) {
        this.onFormDisabled(disabled)
    }

    onFormDisabled(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        disabled: boolean
    ) {}

    formResetCallback() {
        this.onFormReset()
    }

    onFormReset() {}

    formStateRestore(state: string, mode: 'autocomplete' | 'restore') {
        if (mode == 'restore') {
            // expects a state parameter in the form 'controlMode/value'
            const [controlMode, value] = state.split('/')

            this.onFormStateRestore({
                controlMode,
                value,
                state,
                mode,
            })
        } else {
            this.onFormStateRestore({
                value: state,
                state,
                mode,
            })
        }
    }

    onFormStateRestore(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        data: {
            state: string
            mode: 'autocomplete' | 'restore'
            value?: string
            controlMode?: string
        } = {
            state: '',
            mode: 'autocomplete',
        }
    ) {}
}
