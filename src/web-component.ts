import { state, HtmlTemplate, jsonParse } from '@beforesemicolon/markup'
import {
    ObjectInterface,
    StateSetters,
    State,
    PropsSetters,
    Props,
} from './types'

export type HTMLComponentElement<P extends ObjectInterface<P>> = P &
    WebComponent<P>

export class WebComponent<
    P extends ObjectInterface<P> = Record<string, unknown>,
    S extends ObjectInterface<S> = Record<string, unknown>,
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
    __ROOT__: ShadowRoot | null = null

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
            this.__ROOT__ = this.#el
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
        try {
            const newState = (
                typeof newStateOrCallback === 'function'
                    ? newStateOrCallback(
                          (Object.keys(this.state) as Array<keyof S>).reduce(
                              (acc, key) => {
                                  acc[key] = this.state[key]()
                                  return acc
                              },
                              {} as S
                          )
                      )
                    : newStateOrCallback
            ) as S

            ;(Object.keys(newState) as Array<keyof S>).forEach((name) => {
                if (this.#stateSetters.hasOwnProperty(name)) {
                    this.#stateSetters[name](newState[name] as S[keyof S])
                }
            })
        } catch (e) {
            this.onError(e as Error)
        }
    }

    dispatch(name: string, detail: Record<string, unknown> = {}) {
        try {
            this.dispatchEvent(
                new CustomEvent(name, {
                    detail,
                })
            )
        } catch (e) {
            this.onError(e as Error)
        }
    }

    updateStylesheet(sheet: CSSStyleSheet | string | null) {
        try {
            if (sheet === null) {
                if (this.shadow === true && this.#el instanceof ShadowRoot) {
                    this.#el.adoptedStyleSheets = []
                } else {
                    document.adoptedStyleSheets = (
                        document.adoptedStyleSheets || []
                    ).filter((s) => s !== this.stylesheet)
                }
                return
            }

            if (typeof sheet === 'string' && sheet.trim().length) {
                const css = sheet
                sheet = new CSSStyleSheet()

                if (sheet.replaceSync) {
                    sheet.replaceSync(css)
                } else {
                    sheet.insertRule(css)
                }
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
        } catch (e) {
            this.onError(e as Error)
        }
    }

    connectedCallback() {
        requestAnimationFrame(() => {
            try {
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
                                if (newVal !== oldVal) {
                                    this.#propsSetters[propName](newVal)
                                    if (this.mounted) {
                                        try {
                                            this.onUpdate(
                                                propName,
                                                newVal,
                                                oldVal
                                            )
                                        } catch (e) {
                                            this.onError(e as Error)
                                        }
                                    }
                                }
                            },
                        })
                    }
                })
                ;(Object.keys(this.initialState) as Array<keyof S>).forEach(
                    (name) => {
                        const [getter, setter] = state<S[keyof S]>(
                            this.initialState[name]
                        )

                        this.#state[name] = getter
                        this.#stateSetters[name] = setter
                    }
                )

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
            } catch (e) {
                this.onError(e as Error)
            }
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

            const desc = Object.getOwnPropertyDescriptor(this, name)

            if (desc?.writable || desc?.set || desc?.configurable) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                this[name] = newVal
            }
        } catch (e) {
            this.onError(e as Error)
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
            try {
                if (this.#temp instanceof HtmlTemplate) {
                    this.#temp?.unmount()
                }
                this.#mounted = false
                this.onDestroy()
            } catch (e) {
                this.onError(e as Error)
            }
        })
    }

    onDestroy() {}

    adoptedCallback() {
        try {
            this.onAdoption()
        } catch (e) {
            this.onError(e as Error)
        }
    }

    onAdoption() {}

    onError(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        error: Error
    ) {}
}
