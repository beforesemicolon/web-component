export const css = (strings: TemplateStringsArray, ...values: unknown[]) => {
    return strings.length && values.length
        ? strings
              .reduce((acc, str, i) => acc + str + (values[i] || ''), '')
              .trim()
        : strings[0]
}
