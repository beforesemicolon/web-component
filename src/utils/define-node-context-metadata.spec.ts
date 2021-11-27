import {defineNodeContextMetadata} from "./define-node-context-metadata";
import metadata from "../metadata";

describe('defineNodeContextMetadata', () => {
	const node = document.createElement('div');

	beforeEach(() => {
		metadata.delete(node);
	})

	it('should set node $context', () => {
		expect(metadata.has(node)).toBeFalsy();

		defineNodeContextMetadata(node);

		expect(metadata.has(node)).toBeTruthy();
		expect(metadata.get(node).$context).toEqual({})
		expect(typeof metadata.get(node).updateContext).toBe('function')
	});

	it('should return if already exists', () => {
		defineNodeContextMetadata(node);

		expect(metadata.has(node)).toBeTruthy();

		metadata.get(node).test = true;

		expect(metadata.get(node).test).toBe(true);

		defineNodeContextMetadata(node);

		expect(metadata.get(node).test).toBe(true);
	});

	it('should inherit context from parent node', () => {
		const parent = document.createElement('div');
		parent.appendChild(node);

		defineNodeContextMetadata(parent);
		defineNodeContextMetadata(node);

		metadata.get(parent).updateContext('parent', 'content');

		expect(metadata.get(node).$context).toEqual({parent: "content"});
	});
});
