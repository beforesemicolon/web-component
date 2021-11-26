import {evaluateStringInComponentContext} from "./evaluate-string-in-component-context";

export function execString(component: WebComponent, executable: string, nodeData: ObjectLiteral) {
	try {
		if (!executable.trim()) {
			return;
		}

		const {$item, $key} = nodeData;
		const keys = component.$properties.slice();
		const ctx = component.$context;

		Object.getOwnPropertyNames(ctx).forEach(n => {
			keys.push(n);
		})

		const values = keys.map((key: string) => {
			switch (key) {
				case '$context':
					return ctx;
				case '$item':
					return $item;
				case '$key':
					return $key;
			}

			// @ts-ignore
			return component[key] ?? ctx[key];
		});

		return evaluateStringInComponentContext(executable, component, keys, values);
	} catch (e) {
		component.onError(e as Error)
	}
}
