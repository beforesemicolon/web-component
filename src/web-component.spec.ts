import {WebComponent} from './web-component';
import {ShadowRootModeExtended} from "./enums/ShadowRootModeExtended.enum";
import {JSDOM} from "jsdom";

describe('WebComponent', () => {

	describe('constructor and configuration', () => {
		class AComp extends WebComponent {}

		AComp.register();

		beforeEach(() => {
			AComp.mode = ShadowRootModeExtended.OPEN;
			AComp.observedAttributes = [];
			AComp.delegatesFocus = false;
		})

		it('should define root according to mode', () => {
			AComp.mode = ShadowRootModeExtended.OPEN;
			let a = new AComp();

			expect(a.root).toBeInstanceOf(ShadowRoot);

			AComp.mode = ShadowRootModeExtended.CLOSED;
			a = new AComp();

			expect(a.root).toEqual(null);

			AComp.mode = ShadowRootModeExtended.NODE;
			a = new AComp();

			expect(a.root).toEqual(null);
		});

		it('should throw error if invalid observed attributes', () => {
			AComp.observedAttributes = [2] as any;

			expect(() => new AComp()).toThrowError('AComp: "observedAttributes" must be an array of attribute strings.')

			AComp.observedAttributes = {} as any;

			expect(() => new AComp()).toThrowError('AComp: "observedAttributes" must be an array of attribute strings.')
		});

		it('should throw error if invalid mode', () => {
			// @ts-ignore
			AComp.mode = '';

			expect(() => new AComp()).toThrowError('AComp: Invalid mode "". Must be one of ["open", "closed", "none"].')
		});

		it('should map observed attributes to properties', () => {
			AComp.observedAttributes = ['unique', 'is-valid'];

			const a = new AComp();

			expect((a as any).unique).toBe('');
			expect((a as any).isValid).toBe('');
		});

		it('should set tag name', () => {
			expect(AComp.tagName).toBe('a-comp')
		});
	});

	describe('registration', () => {
		it('should register with new tag name', () => {
			class BComp extends WebComponent {}

			expect(BComp.isRegistered).toBeFalsy();

			BComp.register('awesome-comp');

			expect(BComp.tagName).toBe('awesome-comp');
			expect(BComp.isRegistered).toBeTruthy();
		});

		it('should register all given components', () => {
			class CComp extends WebComponent {}
			class DComp extends WebComponent {}

			expect(CComp.isRegistered).toBeFalsy();
			expect(DComp.isRegistered).toBeFalsy();

			WebComponent.registerAll([CComp, DComp]);

			expect(CComp.isRegistered).toBeTruthy();
			expect(DComp.isRegistered).toBeTruthy();

		});

		it('should throw error if tag name is invalid', () => {
			class EComp extends WebComponent {}

			EComp.tagName = 'e';

			expect(() => EComp.register()).toThrowError('Name argument is not a valid custom element name.')
			expect(() => EComp.register('bad')).toThrowError('Name argument is not a valid custom element name.')
		});
	});

	describe('stylesheet', () => {
		it('should be empty if not set', () => {
			class ZComp extends WebComponent {}

			ZComp.register();

			const z = new ZComp();

			expect(z.stylesheet).toBe('')
		});

		it('should define style with CSS only', () => {
			class FComp extends WebComponent {
				get stylesheet() {
					return ':host {display: inline-block;}'
				}
			}

			FComp.register();

			const f = new FComp();

			document.body.appendChild(f);

			expect(f.root?.innerHTML).toBe('<style id="f-comp">:host {display: inline-block;}</style>')
		});

		it('should define style with CSS inside style tag', () => {
			class GComp extends WebComponent {
				get stylesheet() {
					return '<style>:host {display: inline-block;}</style>'
				}
			}

			GComp.register();

			const g = new GComp();

			document.body.appendChild(g);

			expect(g.root?.innerHTML).toBe('<style>:host {display: inline-block;}</style>')
		});

		it('should not set style if stylesheet is empty', () => {
			class HComp extends WebComponent {
				get stylesheet() {
					return '  '
				}
			}

			HComp.register();

			const h = new HComp();

			document.body.appendChild(h);

			expect(h.root?.innerHTML).toBe('')
		});

		it('should put style in the head tag if mode is none', () => {
			class IComp extends WebComponent {
				static mode = ShadowRootModeExtended.NODE;

				get stylesheet() {
					return ':host {display: inline-block;}'
				}
			}

			IComp.register();

			const i = new IComp();

			document.body.appendChild(i);

			expect(i.root?.innerHTML).toBeUndefined()
			expect(document.head.innerHTML).toBe('<style id="i-comp">i-comp {display: inline-block;}</style>')
		});
	});

	describe('template', () => {
		it('should not set content with empty template', () => {
			class JComp extends WebComponent {}

			JComp.register();

			const j = new JComp();

			document.body.appendChild(j);

			expect(j.root?.innerHTML).toBe('')
		});

		it('should set template in the shadow root if mode is not none', () => {
			class KComp extends WebComponent {
				get template() {
					return '<div>test</div>'
				}
			}

			KComp.register();

			const k = new KComp();

			document.body.appendChild(k);

			expect(k.root?.innerHTML).toBe('<div>test</div>')
		});

		it('should set template in the element if mode is none', () => {
			class LComp extends WebComponent {
				static mode = ShadowRootModeExtended.NODE;

				get template() {
					return '<div>test</div>'
				}
			}

			LComp.register();

			const l = new LComp();

			document.body.appendChild(l);

			expect(l.innerHTML).toBe('<div>test</div>')
		});
	});

	describe('liveCycles', () => {
		const mountFn = jest.fn();
		const destroyFn = jest.fn();
		const updateFn = jest.fn();
		const adoptionFn = jest.fn();

		class MComp extends WebComponent {
			static observedAttributes = ['sample', 'style', 'class', 'data-x'];
			numb = 12;

			onMount() {
				mountFn();
			}

			onDestroy() {
				destroyFn();
			}

			onUpdate(...args: string[]) {
				updateFn(...args)
			}

			onAdoption() {
				adoptionFn();
			}
		}

		MComp.register();
		const k = new MComp();

		beforeEach(() => {
			k.remove();
			mountFn.mockClear()
			destroyFn.mockClear()
			updateFn.mockClear()
			adoptionFn.mockClear()
		})

		it('should trigger onMount when added and onDestroy when removed from the DOM', () => {
			document.body.appendChild(k);

			expect(mountFn).toHaveBeenCalledTimes(1);

			k.remove();

			expect(destroyFn).toHaveBeenCalledTimes(1);
		});

		it('should trigger onAdoption when move to a different document', () => {
			const dom = new JSDOM();
			const doc2 = dom.window.document;

			document.body.appendChild(k);
			doc2.body.appendChild(k);

			expect(adoptionFn).toHaveBeenCalledTimes(1);
		});

		it('should trigger onUpdate when properties and observed attributes update only if mounted', () => {
			k.numb = 1000;
			// @ts-ignore
			k.sample = 'unique';
			k.setAttribute('sample', 'diff');

			expect(updateFn).toHaveBeenCalledTimes(0);

			document.body.appendChild(k);

			updateFn.mockClear(); // clear the call when appended to the DOM

			k.numb = 2000;
			// @ts-ignore
			k.sample = 'plain';
			k.setAttribute('sample', 'bold');

			expect(updateFn).toHaveBeenCalledTimes(3);
		});

		it('should trigger onUpdate when class gets updated through classes property or setAttribute', () => {
			document.body.appendChild(k);

			updateFn.mockClear(); // clear the call when appended to the DOM

			k.className = 'sample';
			k.classList.add('cls');
			k.setAttribute('class', 'cls elem');

			expect(updateFn).toHaveBeenCalledTimes(3);
		});

		it('should trigger onUpdate when style gets updated', () => {
			document.body.appendChild(k);

			updateFn.mockClear(); // clear the call when appended to the DOM

			k.setAttribute('style', 'display: none;');

			expect(updateFn).toHaveBeenCalledTimes(1);
		});

		it('should trigger onUpdate when data attributes gets updated', () => {
			document.body.appendChild(k);

			updateFn.mockClear(); // clear the call when appended to the DOM

			k.dataset.x = 'something'

			expect(updateFn).toHaveBeenCalledTimes(1);
		});
	});

	describe('update DOM', () => {
		let n: any;

		class NComp extends WebComponent {
			static observedAttributes = ['sample', 'style', 'class', 'data-x'];
			numb = 12;
			obj = {
				value: 300
			}

			get template() {
				return '{obj.value}<strong class="{this.className}" style="{this.style.cssText}" data-x="{this.dataset.x}">{numb} {sample}</strong>'
			}
		}

		NComp.register();

		beforeEach(() => {
			n?.remove();
			n = new NComp();
			document.body.appendChild(n);

			n.numb = 12;
			// @ts-ignore
			n.sample = '';
			n.obj.value = 300;
			n.className = '';
			n.setAttribute('style', '');
			n.dataset.x = '';
		})

		it('should render', () => {
			expect(n.root?.innerHTML).toBe('300<strong class="" style="" data-x="">12 </strong>')
		});

		it('should update DOM when properties update', () => {
			n.numb = 100;

			expect(n.root?.innerHTML).toBe('300<strong class="" style="" data-x="">100 </strong>')
		});

		it('should update DOM when observed attributes update', () => {
			// @ts-ignore
			n.sample = 'items';

			expect(n.root?.innerHTML).toBe('300<strong class="" style="" data-x="">12 items</strong>')
		});

		it('should update DOM when forceUpdate is called', () => {
			n.obj.value = 15;

			expect(n.root?.innerHTML).toBe('300<strong class="" style="" data-x="">12 </strong>')

			n.forceUpdate();

			expect(n.root?.innerHTML).toBe('15<strong class="" style="" data-x="">12 </strong>')
		});

		it('should update DOM when class gets updated', () => {
			n.className = 'my-items';
			n.classList.add('unique')

			expect(n.root?.innerHTML).toBe('300<strong class="my-items unique" style="" data-x="">12 </strong>')
		});

		it('should update DOM when style gets updated', (done) => {
			n.style.background = 'red';
			n.style.display = 'block';

			setTimeout(() => {
				expect(n.root?.innerHTML).toBe('300<strong class="" style="background: red; display: block;" data-x="">12 </strong>');
				done()
			})
		});

		it('should update DOM when data attributes gets updated', () => {
			n.dataset.x = 'test';

			expect(n.root?.innerHTML).toBe('300<strong class="" style="" data-x="test">12 </strong>');
		});
	})

	describe('data bind and event handling rendering', () => {
		it('should render attribute with multiple bindings', () => {
			class SampleA extends WebComponent {
				x = 'X';
				y = 'Y';

				get template() {
					return '<div class="{x} {y}"></div>'
				}
			}

			SampleA.register();
			const s = new SampleA();

			document.body.appendChild(s);

			expect(s.root?.innerHTML).toBe('<div class="X Y"></div>')
		});

		it('should render attribute with single binding', () => {
			class SampleB extends WebComponent {
				cls = 'items';

				get template() {
					return '<div class="{cls}"></div>'
				}
			}

			SampleB.register();
			const s = new SampleB();

			document.body.appendChild(s);

			expect(s.root?.innerHTML).toBe('<div class="items"></div>')
		});

		it('should render text with multiple bindings', () => {
			class SampleC extends WebComponent {
				x = 'X';
				y = 'Y';

				get template() {
					return '{x} {y}'
				}
			}

			SampleC.register();
			const s = new SampleC();

			document.body.appendChild(s);

			expect(s.root?.innerHTML).toBe('X Y')
		});

		it('should render text with single binding', () => {
			class SampleD extends WebComponent {
				val = 'some text';

				get template() {
					return '{val}'
				}
			}

			SampleD.register();
			const s = new SampleD();

			document.body.appendChild(s);

			expect(s.root?.innerHTML).toBe('some text')
		});

		it('should take object as attribute value', () => {
			class SampleE extends WebComponent {
				static observedAttributes = ['list']

				get template() {
					return '{list[1]}'
				}
			}

			SampleE.register();
			const s = new SampleE();

			document.body.appendChild(s);

			s.setAttribute('list', '["first", "second"]')

			expect(s.root?.innerHTML).toBe('second')
		});

		it('should attach event listener and remove the reference attribute', () => {
			const handler = jest.fn();

			class SampleF extends WebComponent {
				focused = false;

				get template() {
					return '<button ' +
						'onclick="handleClick($event, 12)" ' +
						'onfocus="{this.focused = true}" ' +
						'onblur="{this.focused = false}"></button>'
				}

				handleClick(event: Event, numb: number) {
					handler(event, numb);
				}
			}

			SampleF.register();
			const s = new SampleF();

			document.body.appendChild(s);

			s.root?.querySelector('button')?.click();

			expect(handler).toHaveBeenCalledWith(expect.any(Event), 12);

			s.root?.querySelector('button')?.focus();

			expect(s.focused).toBe(true);

			s.root?.querySelector('button')?.blur();

			expect(s.focused).toBe(false);

			expect(s.root?.innerHTML).toBe('<button></button>')
		});
	})

	describe('context', () => {
		class TargetComp extends WebComponent {
			get template() {
				return '{$context.title}'
			}
		}

		class AppComp extends WebComponent {
			get template() {
				return '<div><target-comp></target-comp></div>'
			}
		}

		WebComponent.registerAll([TargetComp, AppComp]);

		const app = new AppComp();

		beforeEach(() => {
			app?.remove();
			document.body.appendChild(app);
		})

		it('should update app context and be inherited', () => {
			const forceUpdateSpy = jest.spyOn(app, 'forceUpdate');

			expect(app.root?.innerHTML).toBe('<div><target-comp></target-comp></div>')
			expect(app.$context).toBeDefined()

			forceUpdateSpy.mockClear();

			app.updateContext({
				title: 'Text App'
			});

			expect(forceUpdateSpy).toHaveBeenCalled();
			expect(app.$context).toEqual({
				title: 'Text App'
			})

			const target = app.root?.querySelector('target-comp') as WebComponent;

			expect(target).toBeDefined();
			expect(target.$context).toEqual({
				title: "Text App"
			})
			expect(target?.root?.innerHTML).toBe('Text App');

			// should unsubscribe from context and not get updates
			target.remove();

			app.updateContext({
				title: 'Updated Text App'
			});

			expect(target?.root?.innerHTML).toBe('Text App');

			// should update the DOM to grab new context and data
			app.root?.appendChild(target);

			expect(target?.root?.innerHTML).toBe('Updated Text App');
		});
	});

	describe('directives', () => {
		describe('ref', () => {
			it('should set ref attribute', () => {
                class RefA extends WebComponent {
                    get template() {
                        return '<div ref="myRef"></div>'
                    }
                }

                RefA.register();
                const s = new RefA();

                document.body.appendChild(s);

                expect(s.root?.innerHTML).toBe('<div></div>')
                expect(s.$refs.myRef).toBeDefined()
            });

			it('should allow to be used in template', () => {
				class RefB extends WebComponent {
					get template() {
						return '<div ref="myRef">{$refs.myRef.nodeName}</div>{$refs.myRef.childNodes.length}'
					}
				}

				RefB.register();
				const s = new RefB();

				document.body.appendChild(s);

				expect(s.root?.innerHTML).toBe('<div>DIV</div>1')
				expect(s.$refs.myRef).toBeDefined()
			});

			it('should crashed if used before create in the template', (done) => {
				class RefC extends WebComponent {
					get template() {
						return '{$refs.myRef.nodeName}<div ref="myRef"></div>'
					}

					onError(error: ErrorEvent) {
						expect(error.message).toEqual('Cannot read property \'nodeName\' of undefined');
						done();
					}
				}

				RefC.register();
				const s = new RefC();

				document.body.appendChild(s);
			});
		});

		describe('should handle attr', () => {
			it('should handle class attribute', () => {
				class AttrA extends WebComponent {
					check1 = true;
					check2 = true;

					get template() {
						return '<div attr.class.test="check1" attr.class="sample, check2">'
					}
				}

				AttrA.register();
				const s = new AttrA();

				document.body.appendChild(s);

				expect(s.root?.innerHTML).toBe('<div class="test sample"></div>')

				s.check1 = false;

				expect(s.root?.innerHTML).toBe('<div class="sample"></div>')

				s.check1 = true;

				expect(s.root?.innerHTML).toBe('<div class="sample test"></div>')
			});

			it('should handle style attribute', () => {
				class AttrB extends WebComponent {
					check1 = true;
					check2 = true;

					get template() {
						return '<div attr.style="color: white, check1" attr.style.background-color="red, check2">'
					}
				}

				AttrB.register();
				const s = new AttrB();

				document.body.appendChild(s);

				expect(s.root?.innerHTML).toBe('<div style="color: white; background-color: red;"></div>');

				s.check1 = false;

				expect(s.root?.innerHTML).toBe('<div style="background-color: red;"></div>');

				s.check1 = true;

				expect(s.root?.innerHTML).toBe('<div style="background-color: red; color: white;"></div>');
			});

			it('should handle data attribute', () => {
				class AttrC extends WebComponent {
					check1 = true;
					check2 = true;

					get template() {
						return '<div attr.data.sample-test="good, check1" attr.data.dashed-sample="great, check2">'
					}
				}

				AttrC.register();
				const s = new AttrC();

				document.body.appendChild(s);

				expect(s.root?.innerHTML).toBe('<div data-sample-test="good" data-dashed-sample="great"></div>');

				s.check1 = false;

				expect(s.root?.innerHTML).toBe('<div data-dashed-sample="great"></div>');

				s.check1 = true;

				expect(s.root?.innerHTML).toBe('<div data-dashed-sample="great" data-sample-test="good"></div>');
			});

			it('should handle boolean attribute', () => {
				class AttrD extends WebComponent {
					check1 = true;
					check2 = true;

					get template() {
						return '<button attr.disabled="check1" attr.hidden="check2"></button>'
					}
				}

				AttrD.register();
				const s = new AttrD();

				document.body.appendChild(s);

				expect(s.root?.innerHTML).toBe('<button disabled="" hidden=""></button>');

				s.check1 = false;

				expect(s.root?.innerHTML).toBe('<button hidden=""></button>');

				s.check1 = true;

				expect(s.root?.innerHTML).toBe('<button hidden="" disabled=""></button>');
			});

			it('should handle other attributes', () => {
				class AttrE extends WebComponent {
					check1 = true;
					check2 = true;

					get template() {
						return '<button attr.autocomplete="check1" attr.autofocus="check2" attr.name="sample, check2"></button>'
					}
				}

				AttrE.register();
				const s = new AttrE();

				document.body.appendChild(s);

				expect(s.root?.innerHTML).toBe('<button autocomplete="true" autofocus="" name="sample"></button>');

				s.check2 = false;

				expect(s.root?.innerHTML).toBe('<button autocomplete="true"></button>');

				s.check2 = true;

				expect(s.root?.innerHTML).toBe('<button autocomplete="true" autofocus="" name="sample"></button>');
			});
		});

		describe('should handle if', () => {
			it('should render element if truthy', () => {
				class IfA extends WebComponent {
					check = true;

					get template() {
						return '<button if="check">click me</button>'
					}
				}

				IfA.register();
				const s = new IfA();

				document.body.appendChild(s);

				expect(s.root?.innerHTML).toBe('<button>click me</button>');

				s.check = false;

				expect(s.root?.innerHTML).toBe('<!--if: check-->');

				s.check = true;

				expect(s.root?.innerHTML).toBe('<button>click me</button>');
			});
		});

		describe('should handle repeat', () => {
			it('should repeat element based on number', () => {
				class RepeatA extends WebComponent {
					count: any = 3;

					get template() {
						return '<li repeat="count" class="item-{$key}">item {$item}</li>'
					}
				}

				RepeatA.register();
				const s = new RepeatA();

				document.body.appendChild(s);

				expect(s.root?.innerHTML).toBe('<!--repeat: count--><li class="item-0">item 1</li><li class="item-1">item 2</li><li class="item-2">item 3</li>');

				s.count = 1;

				expect(s.root?.innerHTML).toBe('<!--repeat: count--><li class="item-0">item 1</li>');

				s.count = Array.from({length: 3}, (_, i) => i+1);

				s.count = 1;

				expect(s.root?.innerHTML).toBe('<!--repeat: count--><li class="item-0">item 1</li>');

				s.count = Array.from({length: 3}, (_, i) => i+1);

				expect(s.root?.innerHTML).toBe('<!--repeat: count--><li class="item-0">item 1</li><li class="item-1">item 2</li><li class="item-2">item 3</li>');

				s.count = new Set([2, 4, 6]);

				expect(s.root?.innerHTML).toBe('<!--repeat: count--><li class="item-0">item 2</li><li class="item-1">item 4</li><li class="item-2">item 6</li>');

				s.count = new Map([['one', 1], ['two', 2], ['three', 3]]);

				expect(s.root?.innerHTML).toBe('<!--repeat: count--><li class="item-one">item 1</li><li class="item-two">item 2</li><li class="item-three">item 3</li>');

				s.count = {one: 100, two: 200, three: 300};

				expect(s.root?.innerHTML).toBe('<!--repeat: count--><li class="item-one">item 100</li><li class="item-two">item 200</li><li class="item-three">item 300</li>');

				s.count = 'two';

				expect(s.root?.innerHTML).toBe('<!--repeat: count--><li class="item-0">item t</li><li class="item-1">item w</li><li class="item-2">item o</li>');

				s.count = {
					*[Symbol.iterator]() {
						yield 500;
						yield 250;
						yield 50;
					}
				}

				expect(s.root?.innerHTML).toBe('<!--repeat: count--><li class="item-0">item 500</li><li class="item-1">item 250</li><li class="item-2">item 50</li>');

			});
		});

		describe('should allow mix of hashed attributes', () => {
			it('if and repeat', () => {
				class ComboA extends WebComponent {
					condition = false;
					count = 3;

					get template() {
						return '<li repeat="count" if="condition" class="item-{$key}">item {$item}</li>'
					}
				}

				ComboA.register();
				const s = new ComboA();

				document.body.appendChild(s);

				expect(s.root?.innerHTML).toBe('<!--if: condition-->');

				s.condition = true;

				expect(s.root?.innerHTML).toBe('<!--repeat: count--><li class="item-0">item 1</li><li class="item-1">item 2</li><li class="item-2">item 3</li>');

				s.condition = false;

				expect(s.root?.innerHTML).toBe('<!--if: condition-->');

				s.count = 2;

				expect(s.root?.innerHTML).toBe('<!--if: condition-->');

				s.condition = true;

				expect(s.root?.innerHTML).toBe('<!--repeat: count--><li class="item-0">item 1</li><li class="item-1">item 2</li>');
			});

			it('if and ref', () => {
				class ComboB extends WebComponent {
					condition = false;

					get template() {
						return '<li if="condition" class="item" ref="item">my item</li>'
					}
				}

				ComboB.register();
				const s = new ComboB();

				document.body.appendChild(s);

				const initItemRef = s.$refs.item;

				expect(s.root?.innerHTML).toBe('<!--if: condition-->');
				expect(initItemRef).toBeDefined();

				s.condition = true;

				expect(s.root?.innerHTML).toBe('<li class="item">my item</li>');
				expect(initItemRef === s.$refs.item).toBeTruthy();
			});

			it('if and attr', () => {
				class ComboC extends WebComponent {
					condition = false;

					get template() {
						return '<li if="condition" attr.class.item="condition" attr.id="unique, true">my item</li>'
					}
				}

				ComboC.register();
				const s = new ComboC();

				document.body.appendChild(s);

				expect(s.root?.innerHTML).toBe('<!--if: condition-->');

				s.condition = true;

				expect(s.root?.innerHTML).toBe('<li class="item" id="unique">my item</li>');
			});

			it('repeat and ref', () => {
				class ComboD extends WebComponent {
					count = 2;

					get template() {
						return '<li repeat="count" ref="sample">{$item}-{$key}</li>'
					}
				}

				ComboD.register();
				const s = new ComboD();

				document.body.appendChild(s);

				expect(s.root?.innerHTML).toBe('<!--repeat: count--><li>1-0</li><li>2-1</li>');
				expect(s.$refs.sample).toBeUndefined();
			});

			it('repeat and attr', () => {
				class ComboE extends WebComponent {
					count = 2;

					get template() {
						return '<li repeat="count" attr.data.test="sample, $key">{$item}-{$key}</li>'
					}
				}

				ComboE.register();
				const s = new ComboE();

				document.body.appendChild(s);

				expect(s.root?.innerHTML).toBe('<!--repeat: count--><li>1-0</li><li data-test="sample">2-1</li>');
			});

			it('attr and ref', () => {
				class ComboF extends WebComponent {
					get template() {
						return '<li ref="item" attr.data.test="sample, true">my item</li>'
					}
				}

				ComboF.register();
				const s = new ComboF();

				document.body.appendChild(s);

				expect(s.root?.innerHTML).toBe('<li data-test="sample">my item</li>');
				expect(s.$refs.item).toBeDefined();
			});
		});
	});
});
