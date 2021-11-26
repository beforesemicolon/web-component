import {JSDOM} from 'jsdom';

const dom = new JSDOM()
global.HTMLElement = dom.window.HTMLElement;
(global as any).window = dom.window;
(global as any).customElements = dom.window.customElements;

export {WebComponent} from './web-component';
export {ContextProviderComponent} from './context-provider-component';
