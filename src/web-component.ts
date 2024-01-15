import {
    state,
    HtmlTemplate,
    jsonParse,
    booleanAttributes,
    val,
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
    #temp: HtmlTemplate | string | Element | void = ''
    #propNames: Array<keyof P> = []
    #internals = this.attachInternals?.()
    #closestRoot: ShadowRoot | Document = document
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

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        this.#propNames = this.constructor.observedAttributes ?? []

        this.#propNames.forEach((propName) => {
            const p = String(propName).toLowerCase()
            const isBool = Boolean(
                booleanAttributes[p as keyof typeof booleanAttributes]
            )
            const [getter, setter] = state<P[keyof P]>(
                (isBool ? this.hasAttribute(p) : undefined) as P[keyof P]
            )

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
                if (this.shadow && this.contentRoot instanceof ShadowRoot) {
                    this.contentRoot.adoptedStyleSheets = []
                } else {
                    document.adoptedStyleSheets = (
                        document.adoptedStyleSheets || []
                    ).filter((s) => s !== this.stylesheet)
                }
                return
            }

            const isShadowRoot =
                this.shadow && this.contentRoot instanceof ShadowRoot

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
            this.onError(e as Error)
        }
    }

    private connectedCallback() {
        requestAnimationFrame(() => {
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

                if (this.shadow && !(this.#el instanceof ShadowRoot)) {
                    this.#el = this.attachShadow({
                        mode: this.mode,
                        delegatesFocus: this.delegatesFocus,
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
                                            self.onError(e as Error)
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

                this.#temp = this.render()

                if (this.#temp instanceof HtmlTemplate) {
                    this.#temp?.render(this.contentRoot)
                } else if (typeof this.#temp === 'string') {
                    this.contentRoot.innerHTML = this.#temp
                } else if (this.#temp instanceof Node) {
                    this.contentRoot.appendChild(this.#temp)
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

    private attributeChangedCallback(
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

    private disconnectedCallback() {
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

    private adoptedCallback() {
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
    ) {
        console.error(error)
    }
}
