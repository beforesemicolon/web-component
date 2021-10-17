export function setupComponentPropertiesForAutoUpdate(
	component: WebComponent,
	trackers: {[key: string]: []},
	onUpdate: onUpdateCallback
) {
	for (let property of Object.getOwnPropertyNames(component)) {
		if (!trackers[property]) {
			let value = component[property];

			trackers[property] = [];

			delete component[property];

			Object.defineProperty(component, property, {
				get() {
					return value;
				},
				set(newValue) {
					const oldValue = value;
					value = newValue;

					if (newValue !== oldValue) {
						onUpdate(property, oldValue, newValue);
					}
				}
			})
		}
	}
}