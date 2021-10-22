export function turnCamelToKebabCasing(name: string): string {
	return name
		.match(/(?:[A-Z]+(?=[A-Z][a-z])|[a-zA-Z]|[A-Z])[a-z]*/g)
		?.map(p => p.toLowerCase())
		.join('-') ?? name;
}
