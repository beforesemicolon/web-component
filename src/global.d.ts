import {ShadowRootModeExtended} from './enums/ShadowRootModeExtended.enum';
import {directiveRegistry} from "./directives/registry";

export declare global {
	export type onUpdateCallback = (property: string, oldValue: unknown, newValue: unknown) => void;
	
	export interface renderOptions {
		customSlot?: boolean;
		customSlotChildNodes?: Array<Node>;
	}

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

	export class NodeTrack {
		node: HTMLElement | Node | WebComponent;
		attributes: Array<{
			name: string;
			value: string;
			executables: Array<Executable>;
		}>;
		directives: Array<DirectiveValue>;
		eventHandlers: Array<EventHandlerTrack>;
		property: null | {
			name: string;
			value: string;
			executables: Array<Executable>;
		};

		update: () => void;
		empty: boolean;
		$context: ObjectLiteral;
	}
	
	export interface directiveRenderOptions {
		element: HTMLElement,
		rawElementOuterHTML: string,
		anchorNode: Text | Comment | HTMLElement | Array<HTMLElement> | null
	}

	export interface DirectiveValue {
		name: string;
		value: string;
		prop: string | null;
		handler?: Directive;
	}

	export class Directive {
		static register: () => void;

		parseValue: (value: string, prop: string | null) => string;
		render: (val: any, options: directiveRenderOptions) => Pick<directiveRenderOptions, 'anchorNode'>;
		setContext: (node: Node, key: string, value: any) => void;
		getContext(node: Node) {}

		[key: string | Directive]: any;
	}

	export type ObjectLiteral = {[key: string]: any};

	export type ObserverCallback = (ctx: ObjectLiteral) => void;

	export type Refs = {[key: string]: Node};

	export type Executable = {
		from: number;
		to: number;
		match: string;
		executable: string;
	}
	
	export interface WebComponentMetadata {
		root: WebComponent | ShadowRoot;
		trackers: Map;
		mounted: boolean;
		parsed: boolean;
		context: object;
		contextSource: WebComponent | null;
		contextSubscribers: Array<(ctx: object) => void>;
		unsubscribeCtx: (ctx: object) => void;
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

		readonly root: HTMLElement | ShadowRoot | null;
		readonly mounted: boolean;
		readonly template: string;
		readonly templateId: string;
		readonly stylesheet: string;
		readonly customSlot: boolean;

		readonly $context: ObjectLiteral;
		readonly $refs: Refs;
		readonly $properties: Array<string>;

		updateContext: (ctx: ObjectLiteral) => void;

		onMount: () => void;
		onDestroy: () => void;
		onAdoption: () => void;
		onUpdate: (name: string, oldValue: string, newValue: string) => void;
		onError: (error: any) => void;
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
