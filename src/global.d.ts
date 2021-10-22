export declare global {
	export type onUpdateCallback = (property: string, oldValue: unknown, newValue: unknown) => void;

	export type propertyCallback = (property: string) => void;

	export interface booleanAttributes {
		[key: string]: {
			value: boolean;
			name: string;
		}
	}

	export interface track {
		node: HTMLElement | Node | WebComponent;
		property: string;
		isAttribute: boolean;
		value: string;
		match: string;
		executable: string;
		from: number;
		to: number;
	}

	export interface WebComponentConstructor {
		name: string;
		tagName: string;
		mode: string;
		observedAttributes: string;
		delegatesFocus: boolean;
	}

	export type ShadowRootModeExtended = "open" | "closed" | "none";

	export class WebComponent extends HTMLElement {
		static tagName: string;
		static mode: ShadowRootModeExtended;
		static observedAttributes: Array<string>;
		static delegatesFocus: boolean;
		static register: (tagName?: string) => void
		static registerAll: (components: Array<WebComponentConstructor>) => void

		root: HTMLElement | ShadowRoot | null;
		mounted: boolean;
		template: string;
		stylesheet: string;
		classes: WindowProxy;

		onMount: () => void;
		onDestroy: () => void;
		onAdoption: () => void;
		onUpdate: (name: string, oldValue: string, newValue: string) => void;

		[key: string]: any;
	}

	export interface WebComponentConstructor {
		new (): WebComponent;

		tagName: string;
		mode: ShadowRootModeExtended;
		observedAttributes: Array<string>;
		delegatesFocus: boolean;
		register: (tagName?: string) =>  void
		registerAll: (components: Array<WebComponentConstructor>) => void
	}
}