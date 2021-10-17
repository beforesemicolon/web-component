export function createClasses(element: HTMLElement) {
	return new Proxy(Object.create(null), {
		get(_, name: string) {
			return element.classList.contains(name);
		},
		set(_, name: string, value: boolean) {
			if (value) {
				element.classList.add(name)
			} else {
				element.classList.remove(name)
			}

			return true;
		}
	});
}