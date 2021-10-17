export function turnCamelToKebabCasing(name: string): string {
	return name
		.match(/(?:[a-zA-Z]|[A-Z]+)[a-z]*/g)
		?.map(p => p.toLowerCase())
		.join('-') ?? name;
}