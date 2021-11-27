import {Ref} from "./ref.directive";

describe('Ref Directive', () => {
	const dir = new Ref();

	it('should parse value', () => {
		expect(dir.parseValue('sample')).toBe('"sample"')
	});

	it('should return node if name is valid', () => {
		// @ts-ignore
		const setRefSPy = jest.spyOn(dir, 'setRef');

		expect(dir.render('span', {} as Node)).toEqual({});
		expect(setRefSPy).toHaveBeenCalledWith('span', {});

		setRefSPy.mockRestore();
	});

	it('should throw error if name is invalid', () => {
		expect(() => dir.render('^span', {} as Node)).toThrowError('Invalid "ref" property name "^span"');
		expect(() => dir.render('span-name', {} as Node)).toThrowError('Invalid "ref" property name "span-name"');
	});
});
