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

	it('should inherit context from parent node and update on changes', () => {
		const parent = document.createElement('div');
		parent.appendChild(node);

		defineNodeContextMetadata(parent);
		defineNodeContextMetadata(node);
		
		expect($.get(node).$context).toEqual({});
		
		$.get(node).subscribe((parentCtx: any) => {
			expect(parentCtx).toEqual({parent: "content"});
			expect($.get(node).$context).toEqual({parent: "content"});
		})

		$.get(parent).updateContext({
			parent: 'content'
		});
	});
	
	it('should unsubscribe and subscribe when remove and attached to element',  () => {
		const parent = document.createElement('div');
		
		defineNodeContextMetadata(parent);
		defineNodeContextMetadata(node);
		
		const nSubSpy = jest.spyOn($.get(node), 'subscribe');
		const pSubSpy = jest.spyOn($.get(parent), 'subscribe');
		
		expect($.get(node).$context).toEqual({});
		expect(nSubSpy).not.toHaveBeenCalled();
		
		$.get(parent).updateContext({
			parent: 'content'
		});
		
		parent.appendChild(node);
		
		expect($.get(node).$context).toEqual({parent: "content"});
		expect(pSubSpy).toHaveBeenCalledWith(expect.any(Function));
		
		parent.removeChild(node);

		expect($.get(node).$context).toEqual({});

		nSubSpy.mockClear();
		
		// try new parent node
		const newParent = document.createElement('div');
		
		defineNodeContextMetadata(newParent);
		
		const npSubSpy = jest.spyOn($.get(newParent), 'subscribe');

		$.get(newParent).updateContext({
			parent: 'new content'
		});

		newParent.appendChild(node);

		expect($.get(node).$context).toEqual({parent: "new content"});
		expect(npSubSpy).toHaveBeenCalledWith(expect.any(Function));
		
		let subSpy = jest.fn();

		$.get(node).subscribe((parentCtx: any) => {
			subSpy();
			expect(parentCtx).toEqual({parent: "updated content"});
			expect($.get(node).$context).toEqual({parent: "updated content"});
		})

		$.get(newParent).updateContext({
			parent: 'updated content'
		});

		expect(subSpy).toHaveBeenCalled();

		subSpy.mockClear();

		$.get(node).unsubscribe();

		$.get(newParent).updateContext({
			parent: 'newly updated content'
		});

		expect(subSpy).not.toHaveBeenCalled()
		expect($.get(node).$context).toEqual({parent: "newly updated content"});
		expect(npSubSpy).toHaveBeenCalledWith(expect.any(Function)); // node resubscribes on $context read
		
		jest.clearAllMocks();
	});
	
	
});
