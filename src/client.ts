import {WebComponent} from './web-component';
import {ContextProviderComponent} from './context-provider-component';

// @ts-ignore
if (window) {
	// @ts-ignore
	window.WebComponent = WebComponent;
	// @ts-ignore
	window.ContextProviderComponent = ContextProviderComponent;
}
