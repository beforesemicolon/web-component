import {WebComponent} from './web-component';
import {Directive} from './directive';
import {ContextProviderComponent} from './context-provider-component';

// @ts-ignore
if (window) {
	// @ts-ignore
	window.WebComponent = WebComponent;
	// @ts-ignore
	window.ContextProviderComponent = ContextProviderComponent;
	// @ts-ignore
	window.Directive = Directive;
}
