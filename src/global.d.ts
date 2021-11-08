import {ShadowRootModeExtended} from './enums/ShadowRootModeExtended.enum';

export declare global {
	export type onUpdateCallback = (property: string, oldValue: unknown, newValue: unknown) => void;

	export interface booleanAttributes {
		[key: string]: {
			value: boolean;
			name: string;
		}
	}

	export type EventListenerCallback = (event: Event) => void;

	export type EventHandlerTrack = {
		eventName: string;
		attribute: Attr;
		fn?: EventListenerCallback;
	};

	export interface NodeTrack {
		node: HTMLElement | Node | WebComponent;
		attributes: Array<{
			name: string;
			value: string;
			executables: Array<Executable>;
		}>;
		directives: Array<Directive>;
		eventHandlers: Array<EventHandlerTrack>;
		property: null | {
			name: string;
			value: string;
			executables: Array<Executable>;
		};
	}

	export type Directive = 'attr' | 'ref' | 'repeat' | 'if';

	export interface DirectiveValue {
		value: string;
		prop: string;
		placeholderNode?: Comment;
	}

	export type ObjectLiteral = {[key: string]: any};

	export type ObserverCallback = (ctx: ObjectLiteral) => void;

	export type Refs = {[key: string]: HTMLElement};

	export type Executable = {
		from: number;
		to: number;
		match: string;
		executable: string;
	}

	export class WebComponent extends HTMLElement {
		static tagName: string;
		static mode: ShadowRootModeExtended;
		static observedAttributes: Array<string>;
		static delegatesFocus: boolean;
		static register: (tagName?: string) => void;
		static isRegistered: boolean;
		static initialContext: ObjectLiteral;
		static registerAll: (components: Array<WebComponentConstructor>) => void;

		root: HTMLElement | ShadowRoot | null;
		mounted: boolean;
		template: string;
		stylesheet: string;

		$context: ObjectLiteral;
		$refs: Refs;

		updateContext: (ctx: ObjectLiteral) => void;

		onMount: () => void;
		onDestroy: () => void;
		onAdoption: () => void;
		onUpdate: (name: string, oldValue: string, newValue: string) => void;
		onError: (error: ErrorEvent) => void;
		forceUpdate: () => void;

		[key: string]: any;
	}

	export interface WebComponentConstructor {
		new (): WebComponent;

		tagName: string;
		mode: ShadowRootModeExtended;
		observedAttributes: Array<string>;
		delegatesFocus: boolean;
		register: (tagName?: string) =>  void;
		registerAll: (components: Array<WebComponentConstructor>) => void;
		isRegistered: boolean;
		initialContext: ObjectLiteral;
	}
}