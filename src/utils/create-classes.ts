export function createClasses(element: HTMLElement, onUpdate: onUpdateCallback) {
	return new Proxy(Object.create(null), {
		get(_, name: string) {
			return element.classList.contains(name);
		},
		set(_, name: string, value: boolean) {
			const oldValue = element.className;

			if (value) {
				element.classList.add(name)
			} else {
				element.classList.remove(name);
			}

			const newValue = element.className;

			if (oldValue !== newValue) {
				onUpdate('class', oldValue, newValue);
			}

			return true;
		}
	});
}