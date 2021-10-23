import {evaluateStringInComponentContext} from './evaluate-string-in-component-context';

describe('bindData', () => {
	it('should return empty string if empty string executable', () => {
		expect(evaluateStringInComponentContext('', {} as any)).toEqual('')
	});

	it('should throw error if mentioned property in the executable string does not exist in the object', () => {
		expect(() => evaluateStringInComponentContext('str', {} as any)).toThrowError('str is not defined')
	});

	it('should eval string', () => {
		expect(evaluateStringInComponentContext('str.toUpperCase() + " test"', {str: 'simple'} as any)).toEqual('SIMPLE test')
		expect(evaluateStringInComponentContext('(numb + 100).toFixed(2)', {numb: 23} as any)).toEqual('123.00')
		expect(evaluateStringInComponentContext('bool.valueOf()', {bool: new Boolean(null)} as any)).toEqual(false)
		expect(evaluateStringInComponentContext('arr.length', {arr: [2, 4, 6]} as any)).toEqual(3)
		expect(evaluateStringInComponentContext('obj.x - 50', {obj: {x: 100}} as any)).toEqual(50)
		expect(evaluateStringInComponentContext('set.has(2)', {set: new Set([2, 6])} as any)).toEqual(true)
	});
});