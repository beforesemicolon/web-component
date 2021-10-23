import {WebComponent} from './web-component';

describe('WebComponent', () => {
	describe('should throw', () => {
		it('if invalid mode', () => {
			class MyCoolButton extends WebComponent {
				// @ts-ignore
				static mode: ShadowRootModeExtended = '';
			}

			MyCoolButton.register();

			expect(() => new MyCoolButton()).toThrowError('MyCoolButton: Invalid mode "". Must be one of ["open", "closed", "none"].')
		});

		it('if invalid observed attributes', () => {
			class MyOtherButton extends WebComponent {
				// @ts-ignore
				static observedAttributes: Array<string> = [3];
			}

			MyOtherButton.register();

			expect(() => new MyOtherButton()).toThrowError('MyOtherButton: "observedAttributes" must be an array of attribute strings.')
		});
	});

	describe('Empty Component', () => {
		class MyEmptyButton extends WebComponent {}

		it('should have default static configs', () => {
			expect(MyEmptyButton.tagName).toBe('');
			expect(MyEmptyButton.mode).toBe('open');
			expect(MyEmptyButton.delegatesFocus).toBe(false);
			expect(MyEmptyButton.observedAttributes).toEqual([]);
		});

		it('should register', () => {
			expect(MyEmptyButton.isRegistered).toBeFalsy();
			expect(MyEmptyButton.tagName).toBe('');

			MyEmptyButton.register();

			expect(MyEmptyButton.isRegistered).toBeTruthy();
			expect(MyEmptyButton.tagName).toBe('my-empty-button');
		});

		it('should register with custom name', () => {
			class MySuperButton extends WebComponent {}

			expect(MySuperButton.isRegistered).toBeFalsy();
			expect(MySuperButton.tagName).toBe('');

			MySuperButton.register('my-super-button');

			expect(MySuperButton.isRegistered).toBeTruthy();
			expect(MySuperButton.tagName).toBe('my-super-button');
		});

		it('should register all components', () => {
			class TestA extends WebComponent {}
			class TestB extends WebComponent {}

			expect(TestA.isRegistered).toBeFalsy();
			expect(TestB.isRegistered).toBeFalsy();

			WebComponent.registerAll([TestA, TestB]);

			expect(TestA.isRegistered).toBeTruthy();
			expect(TestB.isRegistered).toBeTruthy();
		});

		it('should have default info after registration', () => {
			MyEmptyButton.register();

			const btn = new MyEmptyButton();

			expect(btn.template).toBe('');
			expect(btn.stylesheet).toBe('');
		});

		it('should say it is mounted if added to the DOM', () => {
			MyEmptyButton.register();

			const btn = new MyEmptyButton();

			expect(btn.mounted).toEqual(false);

			document.body.appendChild(btn);

			expect(btn.mounted).toEqual(true);

			btn.remove();

			expect(btn.mounted).toEqual(false);
		});
	});

	it('should call onUpdate on property and attribute changes only after element is mounted', () => {
		const onUpdateMock = jest.fn();

		class MyButton extends WebComponent {
			static observedAttributes = ['type'];
			label = '';

			onUpdate(...args: string[]) {
				onUpdateMock(...args)
			}
		}

		MyButton.register();

		const btn = new MyButton();

		btn.label = 'click';
		btn.setAttribute('type', 'submit');

		expect(btn.label).toBe('click');
		// @ts-ignore
		expect(btn.type).toBe('submit');
		expect(onUpdateMock).not.toHaveBeenCalled();

		onUpdateMock.mockClear();

		document.body.appendChild(btn);

		btn.label = 'click me';
		btn.setAttribute('type', 'button');

		expect(onUpdateMock).toHaveBeenCalledWith("label", "click", "click me");
		expect(onUpdateMock).toHaveBeenCalledWith("type", "submit", "button");
	});
});