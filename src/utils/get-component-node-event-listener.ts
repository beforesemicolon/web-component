export function getComponentNodeEventListener(component: WebComponent, name: string, value: string) {
	const match = value.trim().match(/^(?:((?:this\.)?([a-z$_][a-z0-9$_]*)\s*\((.*)\))|\{(.*)\})$/i);

	if (match) {
		let [_, fn, fnName, fnArgs, executable] = match;

		if (executable) {
			const props = Object.getOwnPropertyNames(component);
			const fn = new Function('$event', ...props, executable);

			return (event: Event) => {
				fn.call(component, event, ...props.map(prop => component[prop]))
			};
		} else {
			fn = fn.replace(/^this\./, '');
			const func = new Function('$event', `return this.${fn}`);

			if (typeof component[fnName] === 'function') {
				return (event: Event) => {
					return func.call(component, event)
				}
			} else {
				throw new Error(`${component.constructor.name}: "${fnName}" is not a function`);
			}
		}
	}

	throw new Error(`${component.constructor.name}: Invalid event handler for "${name}" >>> "${value}".`);

}