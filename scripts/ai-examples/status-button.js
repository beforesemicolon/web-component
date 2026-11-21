class StatusButton extends WebComponent {
    static observedAttributes = ['message']
    message = 'Ready'
    initialState = { count: 0 }

    onMount() {
        const reset = () => this.setState({ count: 0 })
        window.addEventListener('reset-status', reset)
        return () => {
            window.removeEventListener('reset-status', reset)
            this.dispatch('status-cleanup')
        }
    }

    confirm = () => {
        const count = this.state.count() + 1
        this.setState({ count })
        this.dispatch('status-confirm', {
            message: this.props.message(),
            count,
        })
    }

    render() {
        return html`
            <button type="button" onclick="${this.confirm}">
                <slot>Confirm status</slot>
            </button>
            <output>${this.props.message}: ${this.state.count}</output>
        `
    }
}
customElements.define('status-button', StatusButton)
