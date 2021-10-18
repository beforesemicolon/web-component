export function getComponentNodeEventListener(component: WebComponent, name: string, value: string) {
	const match = value.trim().match(/^(?:(([a-z$_][a-z0-9$_]*)\s*\((.*)\))|\{(.*)\})$/i);

	if (match) {
		let [_, fnBody, fnName, fnArgs, executable] = match;

		if (executable) {
			const props = Object.getOwnPropertyNames(component);
			const fn = new Function(...['$event', ...props], executable);

			return (event: Event) => {
				fn.apply(component, [event, ...props.map(prop => component[prop])])
			};
		} else {
			const args = (fnArgs || '').split(',').map(arg => arg.trim());

			if (typeof component[fnName] === 'function') {
				return (event: Event) => {
					return (component[fnName] as any).apply(component, args.map(arg => arg === '$event' ? event : component[arg]))
				}
			} else {
				throw new Error(`${component.constructor.name}: "${fnName}" is not a function`);
			}
		}
	}

	throw new Error(`${component.constructor.name}: Invalid event handler for "${name}" => ${value}.`);

}