import { StateGetter, StateSetter } from '@beforesemicolon/markup'

export interface ObjectLiteral<P> {
    [key: string]: P[keyof P]
}

export type Props<P> = {
    [K in keyof P]: StateGetter<P[K]>
}

export type PropsSetters<P> = {
    [K in keyof P]: StateSetter<P[K]>
}

export type State<S> = {
    [K in keyof S]: StateGetter<S[K]>
}

export type StateSetters<S> = {
    [K in keyof S]: StateSetter<S[K]>
}
