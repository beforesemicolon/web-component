import {parseNodeDirective} from "./parse-node-directive";

describe('parseNodeDirective', () => {
	it('should set directive details on the node and remove the attribute ', () => {
		const div = document.createElement('div');
		div.innerHTML = `<div if="val > 100" attr.class="unique, true" attr.data-sample="cool, true"></div>`;
		const node: any = div.children[0];
		const directives = new Set();

		for (let x of [...node.attributes]) {
			directives.add(parseNodeDirective(node, x.name, x.value));
		}

		expect(directives).toEqual(new Set(["if", "attr"]));
		expect(node.outerHTML).toBe('<div></div>');
		expect(node.if).toEqual([
			{
				"prop": null,
				"value": "val > 100"
			}
		]);
		expect(node.attr).toEqual([
			{
				"prop": "class",
				"value": "unique, true"
			},
			{
				"prop": "data-sample",
				"value": "cool, true"
			}
		]);
	});
});