import {Repeat} from './repeat.directive';

describe('Repeat Directive', () => {
	const dir = new Repeat();
	// @ts-ignore
	const setContextSpy = jest.spyOn(dir, 'setContext');
	let node: HTMLElement;

	beforeEach(() => {
		node = document.createElement('div');
		node.className = 'item-{$key}';
		node.innerHTML = 'item {$item}';
		node.setAttribute('if', 'true');
	})

	afterEach(() => {
		setContextSpy.mockClear();
	})

	afterAll(() => {
		// @ts-ignore
		setContextSpy.mockRestore();
	})

	it('should repeat node with numbers', () => {
		node.setAttribute('repeat', '3');
		const res = dir.render(3, node, node.outerHTML);

		expect(res.nodeName).toBe('#document-fragment')
		expect(res.childNodes.length).toBe(3)
		expect(node.outerHTML).toBe('<div class="item-{$key}" if="true" repeat="3">item {$item}</div>')
		expect(res.children[0].outerHTML).toBe('<div class="item-{$key}">item {$item}</div>')
		expect(res.children[1].outerHTML).toBe('<div class="item-{$key}">item {$item}</div>')
		expect(res.children[2].outerHTML).toBe('<div class="item-{$key}">item {$item}</div>')
		expect(setContextSpy).toHaveBeenCalledTimes(6)
		// @ts-ignore
		expect(dir.getContext(res.children[0])).toEqual({$item: 1, $key: 0})
		// @ts-ignore
		expect(dir.getContext(res.children[1])).toEqual({$item: 2, $key: 1})
		// @ts-ignore
		expect(dir.getContext(res.children[2])).toEqual({$item: 3, $key: 2})
	});

	it('should repeat node with array', () => {
		node.setAttribute('repeat', '[2, 4, 6]');
		const res = dir.render([2, 4, 6], node, node.outerHTML);

		expect(res.nodeName).toBe('#document-fragment')
		expect(res.childNodes.length).toBe(3)
		expect(node.outerHTML).toBe('<div class="item-{$key}" if="true" repeat="[2, 4, 6]">item {$item}</div>')
		expect(res.children[0].outerHTML).toBe('<div class="item-{$key}">item {$item}</div>')
		expect(res.children[1].outerHTML).toBe('<div class="item-{$key}">item {$item}</div>')
		expect(res.children[2].outerHTML).toBe('<div class="item-{$key}">item {$item}</div>')
		expect(setContextSpy).toHaveBeenCalledTimes(6)
		// @ts-ignore
		expect(dir.getContext(res.children[0])).toEqual({$item: 2, $key: "0"})
		// @ts-ignore
		expect(dir.getContext(res.children[1])).toEqual({$item: 4, $key: "1"})
		// @ts-ignore
		expect(dir.getContext(res.children[2])).toEqual({$item: 6, $key: "2"})
	});

	it('should repeat node with object', () => {
		node.setAttribute('repeat', '{a: 100, b: 200, c: 300}');
		const res = dir.render({a: 100, b: 200, c: 300}, node, node.outerHTML);

		expect(res.nodeName).toBe('#document-fragment')
		expect(res.childNodes.length).toBe(3)
		expect(node.outerHTML).toBe('<div class="item-{$key}" if="true" repeat="{a: 100, b: 200, c: 300}">item {$item}</div>')
		expect(res.children[0].outerHTML).toBe('<div class="item-{$key}">item {$item}</div>')
		expect(res.children[1].outerHTML).toBe('<div class="item-{$key}">item {$item}</div>')
		expect(res.children[2].outerHTML).toBe('<div class="item-{$key}">item {$item}</div>')
		expect(setContextSpy).toHaveBeenCalledTimes(6)
		// @ts-ignore
		expect(dir.getContext(res.children[0])).toEqual({$item: 100, $key: "a"})
		// @ts-ignore
		expect(dir.getContext(res.children[1])).toEqual({$item: 200, $key: "b"})
		// @ts-ignore
		expect(dir.getContext(res.children[2])).toEqual({$item: 300, $key: "c"})
	});
});
