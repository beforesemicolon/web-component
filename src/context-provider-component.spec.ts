import {ContextProviderComponent} from "./context-provider-component";
import {WebComponent} from "./web-component";
import {ShadowRootModeExtended} from "./enums/ShadowRootModeExtended.enum";

describe('ContextProviderComponent', () => {
	describe('slot', () => {
		it('should render plain slot content with shadow root', () => {
			class SlotC extends ContextProviderComponent {
				static mode = ShadowRootModeExtended.OPEN;
			}

			SlotC.register();

			document.body.innerHTML = '<slot-c><p>one</p><p>two</p></slot-c>';

			const s = document.body.children[0] as WebComponent;

			expect(s.root?.innerHTML).toBe('<!--slotted []--><p>one</p><p>two</p>');
		});

		it('should render plain slot content WITHOUT shadow root', () => {
			class SlotD extends ContextProviderComponent {}

			SlotD.register();

			document.body.innerHTML = '<slot-d><p>one</p><p>two</p></slot-d>';

			const s = document.body.children[0] as WebComponent;

			expect(s.innerHTML).toBe('<!--slotted []--><p>one</p><p>two</p>');
		});

		it('should render named slot content with shadow root', () => {
			class SlotE extends ContextProviderComponent {
				static mode = ShadowRootModeExtended.OPEN;

				get template() {
					return '<slot name="content"></slot>'
				}
			}

			SlotE.register();

			document.body.innerHTML = '<slot-e><p>one</p><p>two</p></slot-e>';

			let s = document.body.children[0] as WebComponent;

			expect(s.root?.innerHTML).toBe('<!--slotted [content]-->');

			document.body.innerHTML = '<slot-e><p slot="content">one</p><p>two</p></slot-e>';

			s = document.body.children[0] as WebComponent;

			expect(s.root?.innerHTML).toBe('<!--slotted [content]--><p slot="content">one</p>');
		});

		it('should render named slot content WITHOUT shadow root', () => {
			class SlotF extends ContextProviderComponent {
				static mode = ShadowRootModeExtended.NONE;

				get template() {
					return '<slot name="content"></slot>'
				}
			}

			SlotF.register();

			document.body.innerHTML = '<slot-f><p>one</p><p>two</p></slot-f>';

			let s = document.body.children[0] as WebComponent;

			expect(s.innerHTML).toBe('<!--slotted [content]-->');

			document.body.innerHTML = '<slot-f><p slot="content">one</p><p>two</p></slot-f>';

			s = document.body.children[0] as WebComponent;

			expect(s.innerHTML).toBe('<!--slotted [content]--><p slot="content">one</p>');
		});
	})
});