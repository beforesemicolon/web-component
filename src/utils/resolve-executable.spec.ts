import {resolveExecutable} from './resolve-executable';
import {WebComponent} from "../web-component";

describe('resolveExecutable', () => {
	class ResolveApp extends WebComponent {}

	ResolveApp.register()

	const app = new ResolveApp();

	it('should resolve executable when data is simple string', () => {
		expect(resolveExecutable(app, {sample: 'test'}, {
			match: '{sample}',
			executable: 'sample'
		} as Executable, 'some {sample} content')).toEqual('some test content')
	});

	it('should resolve executable when data is object', () => {
		expect(resolveExecutable(app, {sample: {cool: 'data'}}, {
			match: '{sample}',
			executable: 'sample'
		} as Executable, 'some {sample} content')).toEqual('some {"cool":"data"} content')
	});
});
