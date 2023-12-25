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

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
if (window) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.BFS = {
        MARKUP: {
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
        },
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        ...(window.BFS || {}),
        WebComponent,
    }
}
