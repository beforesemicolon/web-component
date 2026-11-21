import { WebComponent, html, when } from '@beforesemicolon/web-component'

class ContactRequest extends WebComponent {
    static observedAttributes = [
        'heading',
        'email-label',
        'submit-label',
        'pending-label',
        'busy',
    ]
    heading = 'Request contact'
    emailLabel = 'Email address'
    submitLabel = 'Send request'
    pendingLabel = 'Sending request…'
    busy = false

    submit = (event) => {
        event.preventDefault()
        if (this.props.busy()) return
        const email = String(
            new FormData(event.currentTarget).get('email')
        ).trim()
        this.dispatch('contact-request', { email })
    }

    focusEmail() {
        this.refs.email?.[0]?.focus()
    }

    render() {
        return html`
            <form onsubmit="${this.submit}">
                <fieldset disabled="${this.props.busy}">
                    <legend>${this.props.heading}</legend>
                    <slot name="help"></slot>
                    <label>
                        ${this.props.emailLabel}
                        <input
                            ref="email"
                            type="email"
                            name="email"
                            autocomplete="email"
                            required
                        />
                    </label>
                    <button type="submit">${this.props.submitLabel}</button>
                </fieldset>
                <p role="status">
                    ${when(this.props.busy, this.props.pendingLabel)}
                </p>
            </form>
        `
    }
}

customElements.define('contact-request', ContactRequest)

const contact = document.querySelector('contact-request')
const feedback = document.querySelector('#contact-feedback')
// The parent owns submission. This demo acknowledges locally and sends nothing.
contact.addEventListener('contact-request', ({ detail }) => {
    feedback.textContent = 'Example accepted: ' + detail.email
})

// Change public copy without replacing the element or touching its input.
document.querySelector('#alternate-copy').addEventListener('click', () => {
    contact.lang = 'pt'
    contact.heading = 'Pedir contacto'
    contact.emailLabel = 'Endereço de e-mail'
    contact.submitLabel = 'Enviar pedido'
    contact.pendingLabel = 'A enviar pedido…'
    contact.querySelector('[slot="help"]').textContent =
        'Usaremos o seu e-mail para responder.'
    contact.focusEmail()
})
