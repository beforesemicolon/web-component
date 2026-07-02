export function jsonParse<T>(value: T): T {
    if (value && typeof value === 'string') {
        try {
            return value === 'undefined'
                ? (undefined as unknown as T)
                : JSON.parse(value.replace(/['`]/g, '"'))
        } catch (e) {
            /* empty */
        }
    }

    return value
}
