export function getComponentNodeEventListener(component: WebComponent, name: string, value: string) {
	const match = value.trim().match(/^(?:(([a-z$_][a-z0-9$_]*)\s*\((.*)\))|\{(.*)\})$/i);

	if (match) {
		let [_, fnBody, fnName, fnArgs, executable] = match;

		if (executable) {
			executable = `{${executable}}`
				.replace(/(?<={|\s)(([a-z$])[a-z$_]+)(?=\[|\.|\s|})/ig, (_, m) => {
					return component.hasOwnProperty(m) ? `this.${m}` : m;
				})
				.slice(1, -1);
			const fn = new Function('$event', executable);

			return (event: Event) => fn.call(component, event);
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