import { state, HtmlTemplate, jsonParse } from '@beforesemicolon/markup'
import {
    ObjectLiteral,
    StateSetters,
    State,
    PropsSetters,
    Props,
} from './types'

export class WebComponent<
    P extends ObjectLiteral<P>,
    S extends ObjectLiteral<S>,
> extends HTMLElement {
    #el: ShadowRoot | HTMLElement = this
    #props: Props<P> = {} as Props<P>
    #state: State<S> = {} as State<S>
    #propsSetters: PropsSetters<P> = {} as PropsSetters<P>
    #stateSetters: StateSetters<S> = {} as StateSetters<S>
    #mounted = false
    #temp: HtmlTemplate | string | Element | void = ''
    #propNames: Array<keyof P> = []
    shadow = true
    mode: ShadowRootMode = 'open'
    delegatesFocus = false
    stylesheet: CSSStyleSheet | string | null = null
    initialState: S = {} as S

    get props(): Props<P> {
        return this.#props
    }

    get state(): State<S> {
        return this.#state
    }

    get mounted() {
        return this.#mounted
    }

    constructor() {
        super()

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        this.#propNames = this.constructor.observedAttributes ?? []

        if (this.shadow) {
            this.#el = this.attachShadow({
                mode: this.mode,
                delegatesFocus: this.delegatesFocus,
            })
        }

        this.#propNames.forEach((propName) => {
            const [getter, setter] = state<P[keyof P]>('' as P[keyof P])

            this.#props[propName] = getter
            this.#propsSetters[propName] = setter
        })
    }

    render(): HtmlTemplate | string | Element | void {}

    setState(
        newStateOrCallback: Partial<S> | ((currentState: S) => Partial<S>) = {}
    ) {
        const newState =
            typeof newStateOrCallback === 'function'
                ? newStateOrCallback(
                      Object.keys(this.state).reduce((acc, key: keyof S) => {
                          acc[key] = this.state[key]()
                          return acc
                      }, {} as S)
                  )
                : newStateOrCallback

        Object.keys(newState).forEach((name: keyof S) => {
            if (this.#stateSetters.hasOwnProperty(name)) {
                this.#stateSetters[name](newState[name] as S[keyof S])
            }
        })
    }

    dispatch(name: string, detail: Record<string, unknown> = {}) {
        this.dispatchEvent(
            new CustomEvent(name, {
                detail,
            })
        )
    }

    updateStylesheet(sheet: CSSStyleSheet | string) {
        if (typeof sheet === 'string') {
            const css = sheet
            sheet = new CSSStyleSheet()
            sheet.insertRule(css)
        }

        if (!(sheet instanceof CSSStyleSheet)) {
            return
        }

        if (this.shadow === true && this.#el instanceof ShadowRoot) {
            this.#el.adoptedStyleSheets = [sheet]
        } else {
            document.adoptedStyleSheets = [
                ...(document.adoptedStyleSheets || []).filter(
                    (s) => s !== this.stylesheet
                ),
                sheet,
            ]
        }

        this.stylesheet = sheet
    }

    connectedCallback() {
        requestAnimationFrame(() => {
            this.#propNames.forEach((propName: keyof P) => {
                const desc = Object.getOwnPropertyDescriptor(this, propName)

                this.#propsSetters[propName](desc?.value ?? '')

                if (!desc || desc.configurable) {
                    Object.defineProperty(this, propName, {
                        get() {
                            return this.#props[propName]()
                        },
                        set(newVal) {
                            const oldVal = this.#props[propName]()
                            this.#propsSetters[propName](newVal)
                            if (this.mounted) {
                                this.onUpdate(propName, newVal, oldVal)
                            }
                        },
                    })
                }
            })

            Object.keys(this.initialState).forEach((name: keyof S) => {
                const [getter, setter] = state<S[keyof S]>(
                    this.initialState[name]
                )

                this.#state[name] = getter
                this.#stateSetters[name] = setter
            })

            this.#temp = this.render()

            if (this.#temp instanceof HtmlTemplate) {
                this.#temp?.render(this.#el)
            } else if (typeof this.#temp === 'string') {
                this.#el.innerHTML = this.#temp
            } else if (this.#temp instanceof Element) {
                this.#el.appendChild(this.#temp)
            }

            if (this.stylesheet) {
                this.updateStylesheet(this.stylesheet)
            }

            this.#mounted = true
            this.onMount()
        })
    }

    onMount() {}

    attributeChangedCallback(
        name: keyof P,
        oldVal: P[keyof P] | null,
        newVal: P[keyof P]
    ) {
        try {
            newVal = jsonParse(newVal)
        } catch (e) {
            // empty
        }

        const desc = Object.getOwnPropertyDescriptor(this, name)

        if (desc?.writable || desc?.set || desc?.configurable) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            this[name] = newVal
        }
    }

    onUpdate(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        name: keyof P,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        newValue: P[keyof P] | null,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        oldValue: P[keyof P] | null
    ) {}

    disconnectedCallback() {
        requestAnimationFrame(() => {
            if (this.#temp instanceof HtmlTemplate) {
                this.#temp?.unmount()
            }
            this.#mounted = false
            this.onDestroy()
        })
    }

    onDestroy() {}

    adoptedCallback() {
        this.onAdoption()
    }

    onAdoption() {}
}
