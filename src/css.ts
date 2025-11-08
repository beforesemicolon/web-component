import { effect } from '@beforesemicolon/markup'

export class CSSStyle {
    #updateSub: (newCss: string) => void = () => {}
    #parts: TemplateStringsArray | string[] = []
    #values: string[] = []

    constructor(parts: TemplateStringsArray | string[], values: unknown[]) {
        this.#parts = parts
        if (values.length) {
            values.forEach((value, i) => {
                if (typeof value === 'function') {
                    effect(() => {
                        this.#values[i] = value()
                        this.#updateSub?.(this.toString())
                    })
                } else {
                    this.#values[i] = String(value)
                }
            })
        }
    }

    onUpdate(cb: (newCss: string) => void) {
        this.#updateSub = cb
    }

    toString() {
        return this.#parts.map((p, i) => p + (this.#values[i] ?? '')).join('')
    }
}

export const css = (strings: TemplateStringsArray, ...values: unknown[]) => {
    return new CSSStyle(strings, values)
}
