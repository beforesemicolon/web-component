export function turnCamelToKebabCasing(name: string) {
	return name
		.match(/(?:[a-zA-Z]|[A-Z]+)[a-z]*/g)
		?.map(p => p.toLowerCase())
		.join('-');
}