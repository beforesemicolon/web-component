import {
    state,
    HtmlTemplate,
    jsonParse,
    booleanAttributes,
    val,
    turnKebabToCamelCasing,
    html,
    Helper,
    jsonStringify,
} from '@beforesemicolon/markup'
import {
    ObjectInterface,
    StateSetters,
    State,
    PropsSetters,
    Props,
} from './types'

export type HTMLComponentElement<P extends ObjectInterface<P>> = P &
    WebComponent<P>

const replaceCssHost = (css: string, tagName: string) => {
    tagName = tagName.toLowerCase()

    return css.replace(
        /:(host-context|host)(?:\s*\(([^,{]*)\))?/gim,
        (_, h, s) => {
            if (h === 'host-context') {
                return `${(s || '').trim()} ${tagName}`
            }

            return `${tagName}${(s || '').trim()}`
        }
    )
}

const stringToSheet = (css: string) => {
    const sheet = new CSSStyleSheet()

    sheet.replaceSync(css)

    return sheet
}

interface WebComponentConfig {
    shadow?: boolean
    mode?: 'closed' | 'open'
    delegatesFocus?: boolean
}

const defaultConfig: WebComponentConfig = {
    shadow: true,
    mode: 'open',
    delegatesFocus: false,
}

const reservedPropNames =
    /^(config|stylesheet|props|initialState|state|mounted|refs|contentRoot|root|internals|render|setState|dispatch|updateStylesheet|connectedCallback|onMount|attributeChangedCallback|onUpdate|disconnectedCallback|onDestroy|adoptedCallback|onAdoption|onError|style|className|classList)$/

export abstract class WebComponent<
    P extends ObjectInterface<P> = Record<string, unknown>,
    S extends ObjectInterface<S> = Record<string, unknown>,
> extends HTMLElement {
    static observedAttributes: Array<string> = []
    static formAssociated = false
    #el: ShadowRoot | HTMLElement = this
    #props: Props<P> = {} as Props<P>
    #state: State<S> = {} as State<S>
    #propsSetters: PropsSetters<P> = {} as PropsSetters<P>
    #stateSetters: StateSetters<S> = {} as StateSetters<S>
    #mounted = false
    #temp: HtmlTemplate | null = null
    #propNames: Array<keyof P> = []
    #internals = this.attachInternals?.()
    #closestRoot: ShadowRoot | Document = document
    #initiated = false
    config: WebComponentConfig = defaultConfig
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

    get refs() {
        return this.#temp instanceof HtmlTemplate ? this.#temp.refs : {}
    }

    get contentRoot() {
        return this.#el
    }

    get root() {
        return this.#closestRoot
    }

    get internals() {
        return this.#internals
    }

    constructor() {
        super()

        // @ts-expect-error observedAttributes is part of constructor for web components
        this.#propNames = (this.constructor.observedAttributes ?? []).map(
            turnKebabToCamelCasing
        )

        this.#propNames.forEach((propName) => {
            if (reservedPropNames.test(propName as string)) {
                throw new Error(
                    `The "prop" name "${String(
                        propName
                    )}" is a reserved keyword for the WebComponent or HTMLElement and may break things.`
                )
            }

            const isBool = Boolean(
                // @ts-expect-error keyof P which is actually a string cant be used to key booleanAttributes
                booleanAttributes[propName]
            )
            const [getter, setter] = state<P[keyof P]>(
                (isBool
                    ? this.hasAttribute(propName as string)
                    : undefined) as P[keyof P]
            )

            this.#props[propName] = getter
            this.#propsSetters[propName] = setter
        })
    }

    render(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        data?: unknown
    ): HtmlTemplate | string | Node | Helper<() => unknown> | void {}

    setState(
        newStateOrCallback: Partial<S> | ((currentState: S) => Partial<S>) = {}
    ) {
        try {
            if (!this.#mounted) {
                throw new Error(
                    `Cannot update state while component is unmounted. Received "${jsonStringify(
                        newStateOrCallback
                    )}"`
                )
            }

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
            this.onError(e)
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
            this.onError(e)
        }
    }

    updateStylesheet(sheet: CSSStyleSheet | string | null) {
        const config = { ...defaultConfig, ...(this.config ?? {}) }
        try {
            if (sheet === null) {
                if (config.shadow && this.contentRoot instanceof ShadowRoot) {
                    this.contentRoot.adoptedStyleSheets = []
                } else {
                    document.adoptedStyleSheets = (
                        document.adoptedStyleSheets || []
                    ).filter((s) => s !== this.stylesheet)
                }
                return
            }

            const isShadowRoot =
                config.shadow && this.contentRoot instanceof ShadowRoot

            if (isShadowRoot) {
                if (typeof sheet === 'string' && sheet.trim().length) {
                    sheet = stringToSheet(sheet)
                }

                if (!(sheet instanceof CSSStyleSheet)) {
                    return
                }

                this.contentRoot.adoptedStyleSheets = [
                    ...(this.contentRoot.adoptedStyleSheets || []).filter(
                        (s) => s !== this.stylesheet
                    ),
                    sheet,
                ]
            } else {
                if (typeof sheet === 'string' && sheet.trim().length) {
                    sheet = stringToSheet(replaceCssHost(sheet, this.tagName))
                } else if (sheet instanceof CSSStyleSheet) {
                    sheet = stringToSheet(
                        replaceCssHost(
                            Array.from(
                                sheet.cssRules,
                                (rule) => rule.cssText
                            ).join(''),
                            this.tagName
                        )
                    )
                } else {
                    return
                }

                if (this.#closestRoot) {
                    this.#closestRoot.adoptedStyleSheets = [
                        ...(this.#closestRoot.adoptedStyleSheets || []).filter(
                            (s) => s !== this.stylesheet
                        ),
                        sheet,
                    ]
                }
            }

            this.stylesheet = sheet
        } catch (e) {
            this.onError(e)
        }
    }

    private connectedCallback() {
        const config = { ...defaultConfig, ...(this.config ?? {}) }
        try {
            // find the closest ancestor shadow root
            let parent = this.#el as ParentNode | null

            while (parent) {
                parent = parent?.parentNode

                if (parent instanceof ShadowRoot) {
                    this.#closestRoot = parent
                    break
                }
            }

            if (this.#initiated) {
                this.#renderContent()
            } else {
                if (config.shadow && !(this.#el instanceof ShadowRoot)) {
                    this.#el = this.attachShadow({
                        mode: config.mode ?? 'open',
                        delegatesFocus: config.delegatesFocus,
                    })
                }

                this.#propNames.forEach((propName: keyof P) => {
                    const desc = Object.getOwnPropertyDescriptor(this, propName)

                    this.#propsSetters[propName](
                        desc?.value ?? desc?.get?.() ?? ''
                    )

                    // eslint-disable-next-line @typescript-eslint/no-this-alias
                    const self = this

                    if (!desc || desc.configurable) {
                        Object.defineProperty(self, propName, {
                            get() {
                                return self.#props[propName]()
                            },
                            set(newVal) {
                                const oldVal = self.#props[propName]()
                                if (newVal !== oldVal) {
                                    self.#propsSetters[propName](newVal)
                                    if (self.mounted) {
                                        try {
                                            self.onUpdate(
                                                propName,
                                                newVal,
                                                oldVal
                                            )
                                        } catch (e) {
                                            self.onError(e)
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
                            val(this.initialState[name])
                        )

                        this.#state[name] = getter
                        this.#stateSetters[name] = setter
                    }
                )

                this.#renderContent()

                if (this.stylesheet) {
                    this.updateStylesheet(this.stylesheet)
                }
                this.#initiated = true
            }

            this.#mounted = true
            this.onMount()
        } catch (e) {
            this.onError(e)
        }
    }

    onMount() {}

    private attributeChangedCallback(
        name: keyof P,
        oldVal: P[keyof P] | null,
        newVal: P[keyof P]
    ) {
        try {
            newVal = jsonParse(newVal)
            name = turnKebabToCamelCasing(name as string) as keyof P

            const desc = Object.getOwnPropertyDescriptor(this, name)

            if (desc?.writable || desc?.set || desc?.configurable) {
                // @ts-expect-error property is set directly in the element when mounted
                this[name] = newVal
            }
        } catch (e) {
            this.onError(e)
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

    private disconnectedCallback() {
        try {
            if (this.#temp instanceof HtmlTemplate) {
                this.#temp.unmount()
            }
            this.#mounted = false
            this.onDestroy()
        } catch (e) {
            this.onError(e)
        }
    }

    onDestroy() {}

    private adoptedCallback() {
        try {
            this.onAdoption()
        } catch (e) {
            this.onError(e)
        }
    }

    onAdoption() {}

    onError(error: Error | unknown) {
        console.error(error)
    }

    #renderContent() {
        this.contentRoot.innerHTML = ''
        const content = this.render()

        if (content instanceof HtmlTemplate) {
            this.#temp = content.render(this.contentRoot)
        } else if (typeof content === 'function' || content instanceof Helper) {
            this.#temp = html`${content}`
        } else if (content instanceof Node) {
            this.contentRoot.appendChild(content)
        } else if (typeof content === 'string') {
            this.contentRoot.innerHTML = content
        }
    }
}
