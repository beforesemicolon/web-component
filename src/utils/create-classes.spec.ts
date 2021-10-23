import {createClasses} from './create-classes';

describe('createClasses', () => {
	it('should return a proxy handling classList', () => {
		const element = document.createElement('div');
		const onUpdate = jest.fn();

		const cls = createClasses(element as any, onUpdate);

		expect(cls.test).toBe(false);
		expect(element.className).toBe('');

		cls.test = true;

		expect(cls.test).toBe(true);
		expect(element.className).toBe('test');
		expect(onUpdate).toHaveBeenCalledWith("class", "", "test");

		onUpdate.mockClear();

		cls.test = false;

		expect(cls.test).toBe(false);
		expect(element.className).toBe('');
		expect(onUpdate).toHaveBeenCalledWith("class", "test", "");
	});
});