import {
    WebComponent,
    html,
    is,
    pick,
    repeat,
    when,
} from '@beforesemicolon/web-component'

class StatusPicker extends WebComponent {
    static observedAttributes = ['heading', 'items', 'disabled']
    heading = 'Choose a status'
    items = []
    disabled = false
    initialState = { query: '' }

    visibleItems = () => {
        const query = this.state.query().trim().toLowerCase()
        // Filtering creates a view; it must not mutate the public collection.
        return this.props
            .items()
            .filter(({ label }) => label.toLowerCase().includes(query))
    }

    onMount() {
        const reset = () => this.setState({ query: '' })
        window.addEventListener('reset-status-picker', reset)
        return () => window.removeEventListener('reset-status-picker', reset)
    }

    search = (event) => {
        this.setState({ query: event.currentTarget.value })
    }

    clear = () => {
        this.setState({ query: '' })
        this.refs.filter?.[0]?.focus()
    }

    select = ({ id, label }) => {
        if (!this.props.disabled())
            this.dispatch('status-select', { id, label })
    }

    render() {
        return html`
            <fieldset disabled="${this.props.disabled}">
                <legend>${this.props.heading}</legend>
                <slot></slot>
                <label>
                    Filter statuses
                    <input
                        ref="filter"
                        type="search"
                        value="${this.state.query}"
                        oninput="${this.search}"
                    />
                </label>
                <button
                    type="button"
                    disabled="${is(this.state.query, '')}"
                    onclick="${this.clear}"
                >
                    Clear filter
                </button>
                <ul>
                    ${repeat(
                        this.visibleItems,
                        (item) => html`
                            <li>
                                <button
                                    type="button"
                                    onclick="${() => this.select(item)}"
                                >
                                    ${item.label}
                                </button>
                            </li>
                        `,
                        { key: (item) => item.id }
                    )}
                </ul>
                ${when(is(pick(this.visibleItems, 'length'), 0), html`<p>No matching statuses.</p>`)}
            </fieldset>
        `
    }
}

customElements.define('status-picker', StatusPicker)

const picker = document.querySelector('status-picker')
picker.items = [
    { id: 'draft', label: 'Draft' },
    { id: 'ready', label: 'Ready' },
    { id: 'archived', label: 'Archived' },
]
picker.addEventListener('status-select', ({ detail }) => {
    document.querySelector('#selected-status').textContent = detail.label
})
