export function turnCamelToKebabCasing(str: string): string {
    return str
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2') // lower/number followed by upper
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2') // acronym followed by capitalized word
        .toLowerCase()
}
