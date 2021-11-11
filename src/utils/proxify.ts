export function proxify(name: string, object: any, change: (name: string, o: any) => void = () => {}): any {
	if (!object || object.__proxy__ || typeof object === 'number' || typeof object === 'string' || typeof object === 'boolean' || typeof object === 'function') {
		return object;
	}

	const proxy = new Proxy(object, {
		get(obj, n: string) {
			if (n == '__proxy__') {
				return true;
			}

			const res = Reflect.get(obj, n);

			if(typeof res === 'function') {
				return (...args: any[]) => {
					const r = res.apply(obj, args);

					// todo: change this to actually check if the array changed in size or items
					if(Array.isArray(obj) && /push|pop|splice|shift|unshift|reverse|sort|fill|copyWithin/.test(n)) {
						change(name, obj);
					}

					return r;
				}
			}

			return res;
		},
		set(obj, n: string, value) {
			if (value && typeof value == 'object') {
				value = proxify(n, value, change);
			}

			const res = Reflect.set(obj, n, value);

			change(name, obj);

			return res;
		}
	});

	for (const prop in object) {
		if (object.hasOwnProperty(prop) && object[prop] && typeof object[prop] === 'object') {
			object[prop] = proxify(name, object[prop], change);
		}
	}

	return proxy;
}
