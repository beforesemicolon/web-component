import { WebComponent } from './web-component.ts'
import * as MARKUP from '@beforesemicolon/markup'
import { css } from './css.ts'

declare global {
    interface Window {
        BFS: {
            MARKUP: typeof import('@beforesemicolon/markup')
            WebComponent: typeof WebComponent
            css: typeof css
        }
    }
}

if (window) {
    window.BFS = {
        ...(window.BFS || {}),
        MARKUP,
        WebComponent,
        css,
    }
}
