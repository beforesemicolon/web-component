import {defineNodeContextMetadata} from "./define-node-context-metadata";
import {$} from "../metadata";
import {WebComponent} from "../web-component";

describe('defineNodeContextMetadata', () => {
	class TestComp extends WebComponent {}
	TestComp.register();

	const node = document.createElement('div');

	beforeEach(() => {
		$.delete(node);
	})

	it('should set node $context', () => {
		expect($.has(node)).toBeFalsy();

		defineNodeContextMetadata(node);

		expect($.has(node)).toBeTruthy();
		expect($.get(node).$context).toEqual({})
		expect(typeof $.get(node).updateContext).toBe('function')
	});

	it('should return if already exists', () => {
		defineNodeContextMetadata(node);

		expect($.has(node)).toBeTruthy();

		$.get(node).test = true;

		expect($.get(node).test).toBe(true);

		defineNodeContextMetadata(node);

		expect($.get(node).test).toBe(true);
	});

	it('should inherit context from parent node', () => {
		const parent = document.createElement('div');
		parent.appendChild(node);

		defineNodeContextMetadata(parent);
		defineNodeContextMetadata(node);

		$.get(parent).updateContext({
			parent: 'content'
		});

		expect($.get(node).$context).toEqual({parent: "content"});
	});
});
