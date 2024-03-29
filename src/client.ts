import { WebComponent } from './web-component'
import {
    html,
    state,
    and,
    effect,
    Helper,
    helper,
    is,
    isNot,
    oneOf,
    or,
    pick,
    when,
    element,
    repeat,
    suspense,
    val,
} from '@beforesemicolon/markup'

declare global {
    interface Window {
        BFS: {
            MARKUP: typeof import('@beforesemicolon/markup')
            WebComponent: typeof WebComponent
        }
    }
}

if (window) {
    window.BFS = {
        ...(window.BFS || {}),
        MARKUP: {
            ...(window.BFS?.MARKUP || {}),
            html,
            state,
            // helpers
            and,
            effect,
            Helper,
            helper,
            is,
            isNot,
            oneOf,
            or,
            pick,
            repeat,
            when,
            // utils
            element,
            suspense,
            val,
        } as typeof import('@beforesemicolon/markup'),
        WebComponent,
    }
}
