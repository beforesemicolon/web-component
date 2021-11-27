import {If} from './if.directive';

describe('If Directive', () => {
	const dir = new If();

	it('should return null if falsy', () => {
		expect(dir.render(false, {mock: 'node'} as any)).toEqual(null)
	});

	it('should return node if truthy', () => {
		expect(dir.render(true, {mock: 'node'} as any)).toEqual({mock: 'node'})
	});
});
