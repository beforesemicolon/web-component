export function getStyleString(stylesheet: string, tagName: string, hasShadowRoot: boolean) {
	stylesheet = stylesheet.trim().replace(/\s{2,}/g, ' ');

	let style = stylesheet.startsWith('<style')
		? stylesheet
		: `<style id="${tagName}">${stylesheet}</style>`

	if (!hasShadowRoot) {
		style = style.replace(/(:host)((\s*\(.*\)|))?/g, (_, h, s) => {
			if (s) {
				return tagName + s.slice(1, -1);
			}
			return tagName;
		})
	}

	return style;
}