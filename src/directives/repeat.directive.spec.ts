import {Repeat} from './repeat.directive';
import {WebComponent} from "../web-component";

describe('Repeat Directive', () => {
	class TestComp extends WebComponent {}
	TestComp.register();

	const dir = new Repeat(new TestComp());
	// @ts-ignore
	const setContextSpy = jest.spyOn(dir, 'setContext');
	let element: HTMLElement;

	beforeEach(() => {
		element = document.createElement('div');
		element.className = 'item-{$key}';
		element.innerHTML = 'item {$item}';
		element.setAttribute('if', 'true');
	})

	afterEach(() => {
		setContextSpy.mockClear();
	})

	afterAll(() => {
		// @ts-ignore
		setContextSpy.mockRestore();
	})

	it('should repeat element with numbers', () => {
		element.setAttribute('repeat', '3');
		const res = dir.render(3, {element, rawElementOuterHTML: element.outerHTML} as any);

		expect(res).toEqual(expect.any(Array));
		expect(res.length).toBe(3)
		expect(element.outerHTML).toBe('<div class="item-{$key}" if="true" repeat="3">item {$item}</div>')
		expect(res[0].outerHTML).toBe('<div class="item-{$key}">item {$item}</div>')
		expect(res[1].outerHTML).toBe('<div class="item-{$key}">item {$item}</div>')
		expect(res[2].outerHTML).toBe('<div class="item-{$key}">item {$item}</div>')
		expect(setContextSpy).toHaveBeenCalledTimes(6)
		expect(dir.getContext(res[0])).toEqual({$item: 1, $key: 0})
		expect(dir.getContext(res[1])).toEqual({$item: 2, $key: 1})
		expect(dir.getContext(res[2])).toEqual({$item: 3, $key: 2})
	});

	it('should repeat element with array', () => {
		element.setAttribute('repeat', '[2, 4, 6]');
		const res = dir.render([2, 4, 6], {element, rawElementOuterHTML: element.outerHTML} as any);

		expect(res).toEqual(expect.any(Array));
		expect(res.length).toBe(3)
		expect(element.outerHTML).toBe('<div class="item-{$key}" if="true" repeat="[2, 4, 6]">item {$item}</div>')
		expect(res[0].outerHTML).toBe('<div class="item-{$key}">item {$item}</div>')
		expect(res[1].outerHTML).toBe('<div class="item-{$key}">item {$item}</div>')
		expect(res[2].outerHTML).toBe('<div class="item-{$key}">item {$item}</div>')
		expect(setContextSpy).toHaveBeenCalledTimes(6)
		expect(dir.getContext(res[0])).toEqual({$item: 2, $key: "0"})
		expect(dir.getContext(res[1])).toEqual({$item: 4, $key: "1"})
		expect(dir.getContext(res[2])).toEqual({$item: 6, $key: "2"})
	});

	it('should repeat element with object', () => {
		element.setAttribute('repeat', '{a: 100, b: 200, c: 300}');
		const res = dir.render({a: 100, b: 200, c: 300}, {element, rawElementOuterHTML: element.outerHTML} as any);

		expect(res).toEqual(expect.any(Array));
		expect(res.length).toBe(3)
		expect(element.outerHTML).toBe('<div class="item-{$key}" if="true" repeat="{a: 100, b: 200, c: 300}">item {$item}</div>')
		expect(res[0].outerHTML).toBe('<div class="item-{$key}">item {$item}</div>')
		expect(res[1].outerHTML).toBe('<div class="item-{$key}">item {$item}</div>')
		expect(res[2].outerHTML).toBe('<div class="item-{$key}">item {$item}</div>')
		expect(setContextSpy).toHaveBeenCalledTimes(6)
		// @ts-ignore
		expect(dir.getContext(res[0])).toEqual({$item: 100, $key: "a"})
		// @ts-ignore
		expect(dir.getContext(res[1])).toEqual({$item: 200, $key: "b"})
		// @ts-ignore
		expect(dir.getContext(res[2])).toEqual({$item: 300, $key: "c"})
	});
});
