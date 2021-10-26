import {ShadowRootModeExtended} from './enums/ShadowRootModeExtended.enum';

export declare global {
	export type onUpdateCallback = (property: string, oldValue: unknown, newValue: unknown) => void;

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
		executables: Array<{
			match: string;
			executable: string;
			from: number;
			to: number;
		}>
	}

	export type ObjectLiteral = {[key: string]: unknown};

	export class WebComponent extends HTMLElement {
		static tagName: string;
		static mode: ShadowRootModeExtended;
		static observedAttributes: Array<string>;
		static delegatesFocus: boolean;
		static register: (tagName?: string) => void
		static isRegistered: boolean
		static registerAll: (components: Array<WebComponentConstructor>) => void

		root: HTMLElement | ShadowRoot | null;
		mounted: boolean;
		template: string;
		stylesheet: string;
		context: ObjectLiteral;

		setContext: (key: string | ObjectLiteral, value: unknown) => void;

		onMount: () => void;
		onDestroy: () => void;
		onAdoption: () => void;
		onUpdate: (name: string, oldValue: string, newValue: string) => void;
		forceUpdate: () => void;

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
		isRegistered: boolean
	}
}