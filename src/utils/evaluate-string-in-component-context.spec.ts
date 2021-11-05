import {evaluateStringInComponentContext} from './evaluate-string-in-component-context';

describe('bindData', () => {
	it('should return empty string if empty string executable', () => {
		expect(evaluateStringInComponentContext('', {} as any)).toEqual('')
	});

	it('should throw error if mentioned property in the executable string does not exist in the object', () => {
		expect(() => evaluateStringInComponentContext('str', {} as any)).toThrowError('str is not defined')
	});

	it('should eval string', () => {
		const src: any = {
			str: 'simple',
			numb: 23,
			bool: new Boolean(null),
			arr: [2, 4, 6],
			obj: {x: 100},
			set: new Set([2, 6])
		};

		expect(evaluateStringInComponentContext('str.toUpperCase() + " test"', src)).toEqual('SIMPLE test')
		expect(evaluateStringInComponentContext('(numb + 100).toFixed(2)', src)).toEqual('123.00')
		expect(evaluateStringInComponentContext('bool.valueOf()', src)).toEqual(false)
		expect(evaluateStringInComponentContext('arr.length', src)).toEqual(3)
		expect(evaluateStringInComponentContext('obj.x - 50', src)).toEqual(50)
		expect(evaluateStringInComponentContext('set.has(2)', src)).toEqual(true)
	});
});