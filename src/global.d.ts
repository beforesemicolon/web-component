export declare global {
	export type onUpdateCallback = (property: string, oldValue: unknown, newValue: unknown) => void;

	export type propertyCallback = (property: string) => void;

	export interface booleanAttributes {
		[key: string]: {
			value: boolean;
			name: string;
		}
	}

	export class WebComponent {
		static mode: string;
		static tagName: string;
		static delegatesFocus: boolean;
		[key: string]: unknown;

		static register: (tagName:? string) =>  void

		onMount: () => void;
		onDestroy: () => void;
		onAdoption: () => void;
		onUpdate: (name: string, oldValue: string, newValue: string) => void;
	}
}