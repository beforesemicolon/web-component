import {evaluateStringInComponentContext} from './evaluate-string-in-component-context';

describe('bindData', () => {
	it('should return empty string if empty string executable', () => {
		expect(evaluateStringInComponentContext('', {} as any)).toEqual('')
	});

	it('should throw error if mentioned property in the executable string does not exist in the object', () => {
		expect(() => evaluateStringInComponentContext('str', {} as any)).toThrowError('str is not defined')
	});

	it('should eval string', () => {
		expect(evaluateStringInComponentContext('str.toUpperCase() + " test"', {str: 'simple'} as any, ['str'])).toEqual('SIMPLE test')
		expect(evaluateStringInComponentContext('(numb + 100).toFixed(2)', {numb: 23} as any, ['numb'])).toEqual('123.00')
		expect(evaluateStringInComponentContext('bool.valueOf()', {bool: new Boolean(null)} as any, ['bool'])).toEqual(false)
		expect(evaluateStringInComponentContext('arr.length', {arr: [2, 4, 6]} as any, ['arr'])).toEqual(3)
		expect(evaluateStringInComponentContext('obj.x - 50', {obj: {x: 100}} as any, ['obj'])).toEqual(50)
		expect(evaluateStringInComponentContext('set.has(2)', {set: new Set([2, 6])} as any, ['set'])).toEqual(true)
	});
});