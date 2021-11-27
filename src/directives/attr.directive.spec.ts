import {Attr} from './attr.directive';

describe('Attr Directive', () => {
	const dir = new Attr();

	it('should parse value', () => {
		expect(dir.parseValue('item, true', 'id')).toBe('["id", "", true, "item"]');
		expect(dir.parseValue('true', 'class.item')).toBe('["class", "item", true, ""]');
		expect(dir.parseValue('true', 'disabled')).toBe('["disabled", "", true, ""]');
		expect(dir.parseValue('test, true', 'data.sample-item')).toBe('["data", "sample-item", true, "test"]');
		expect(dir.parseValue('test, true', null)).toBe('["", "", true, "test"]');
	});

	describe('should change node attribute based on flag', () => {
		let node: HTMLElement;

		beforeEach(() => {
			node = document.createElement('div');
		})

		it('style', () => {
			expect(dir.render(['style', '', true, 'color: blue; text-align: center'], node).outerHTML)
				.toBe('<div style="color: blue; text-align: center;"></div>');

			// remove
			expect(dir.render(['style', '', false, 'color: blue; text-align: center'], node).outerHTML)
				.toBe('<div style=""></div>');
		});

		it('style property', () => {
			expect(dir.render(['style', 'color', true, 'red'], node).outerHTML)
				.toBe('<div style="color: red;"></div>');
			expect(dir.render(['style', 'text-align', true, 'center'], node).outerHTML)
				.toBe('<div style="color: red; text-align: center;"></div>');

			// remove
			expect(dir.render(['style', 'color', false, 'red'], node).outerHTML)
				.toBe('<div style="text-align: center;"></div>');
			expect(dir.render(['style', 'text-align', false, 'center'], node).outerHTML)
				.toBe('<div style=""></div>');
		});

		it('data', () => {
			expect(dir.render(['data', '', true, 'sample'], node).outerHTML)
				.toBe('<div></div>');

			// remove
			expect(dir.render(['data', '', false, 'sample'], node).outerHTML)
				.toBe('<div></div>');
		});

		it('data property', () => {
			expect(dir.render(['data', 'test-example', true, 'sample'], node).outerHTML)
				.toBe('<div data-test-example="sample"></div>');

			// remove
			expect(dir.render(['data', 'test-example', false, 'sample'], node).outerHTML)
				.toBe('<div></div>');
		});

		it('class', () => {
			expect(dir.render(['class', '', true, 'sample'], node).outerHTML)
				.toBe('<div class="sample"></div>');

			// remove
			expect(dir.render(['class', '', false, 'sample'], node).outerHTML)
				.toBe('<div class=""></div>');
		});

		it('class property', () => {
			expect(dir.render(['class', 'sample', true, 'ignored'], node).outerHTML)
				.toBe('<div class="sample"></div>');
			expect(dir.render(['class', 'test', true, ''], node).outerHTML)
				.toBe('<div class="sample test"></div>');

			// remove
			expect(dir.render(['class', 'sample', false, 'ignored'], node).outerHTML)
				.toBe('<div class="test"></div>');
			expect(dir.render(['class', 'test', false, ''], node).outerHTML)
				.toBe('<div class=""></div>');
		});

		it('boolean attribute', () => {
			expect(dir.render(['disabled', '', true, 'ignored'], node).outerHTML)
				.toBe('<div disabled=""></div>');
			expect(dir.render(['hidden', '', true, 'ignored'], node).outerHTML)
				.toBe('<div disabled="" hidden=""></div>');

			// remove
			expect(dir.render(['disabled', '', false, 'ignored'], node).outerHTML)
				.toBe('<div hidden=""></div>');
			expect(dir.render(['hidden', '', false, 'ignored'], node).outerHTML)
				.toBe('<div></div>');
		});

		it('value attribute', () => {
			expect(dir.render(['name', '', true, 'box'], node).outerHTML)
				.toBe('<div name="box"></div>');
			expect(dir.render(['custom', '', true, 'true'], node).outerHTML)
				.toBe('<div name="box" custom="true"></div>');

			// remove
			expect(dir.render(['name', '', false, 'box'], node).outerHTML)
				.toBe('<div custom="true"></div>');
			expect(dir.render(['custom', '', false, 'true'], node).outerHTML)
				.toBe('<div></div>');
		});
	});

});
