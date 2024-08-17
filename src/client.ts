import { WebComponent } from './web-component'
import * as MARKUP from '@beforesemicolon/markup'

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
        MARKUP,
        WebComponent,
    }
}
