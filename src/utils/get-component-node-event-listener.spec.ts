import {getComponentNodeEventListener} from './get-component-node-event-listener';
import {WebComponent} from "../web-component";

describe('getComponentNodeEventListener', () => {
	class Button {
		onClick() {}

		sampler = [];

		clicked = () => {}
	}
	const btn = new Button();

	it('should get listener if function exists', () => {
		btn.onClick = jest.fn();
		btn.clicked = jest.fn();

		let handler = getComponentNodeEventListener(btn as any, 'click', 'clicked("sample", 300)');

		expect(handler.toString()).toEqual('(event) => func.call(component, event)')

		handler({type: 'click'} as any);

		expect(btn.clicked).toHaveBeenCalledWith("sample", 300);

		// @ts-ignore
		btn.onClick.mockClear();

		handler = getComponentNodeEventListener(btn as any, 'click', 'onClick($event, 12, [23, 45])');

		expect(handler.toString()).toEqual('(event) => func.call(component, event)')

		handler({type: 'click'} as any);

		expect(btn.onClick).toHaveBeenCalledWith({"type": "click"}, 12, [23, 45]);

		jest.resetAllMocks();
	});

	it('should throw error if function does not exist or is not a function', () => {
		expect(() => getComponentNodeEventListener(btn as any, 'click', 'onTest()'))
			.toThrowError('Button: "onTest" is not a function')
		expect(() => getComponentNodeEventListener(btn as any, 'click', 'sampler()'))
			.toThrowError('Button: "sampler" is not a function')
	});

	it('should throw error it handler is not supported', () => {
		expect(() => getComponentNodeEventListener(btn as any, 'click', 'onClick'))
			.toThrowError('Button: Invalid event handler for "click" >>> "onClick".')
	});

	it('should get listener with executables', () => {

	});
});