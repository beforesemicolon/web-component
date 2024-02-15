import { css } from "./css";

global.CSSStyleSheet = class extends CSSStyleSheet {
	replaceSync(text: string) {
		(text.match(/[^{]+{[^}]+}/g) ?? [])
			.forEach(rule => {
				this.insertRule(rule)
			})
	}
}

import {WebComponent} from './web-component';
import { element, html } from "@beforesemicolon/markup";

class CompOne extends WebComponent {
}

customElements.define('comp-one', CompOne)

const mountMock = jest.fn();
const updateMock = jest.fn();
const destroyMock = jest.fn();
const adoptMock = jest.fn();
const errorMock = jest.fn(console.error);
class CompTwo extends WebComponent<{sample: string, sampleVal: string}> {
	static observedAttributes = ['sample', 'sample-val'];
	sample = '';
	sampleVal = '';
	
	onMount() {
		mountMock();
	}
	
	onUpdate(name: never, newValue: null, oldValue: null) {
		updateMock(name, newValue, oldValue);
	}
	
	onDestroy() {
		destroyMock();
	}
	
	onAdoption() {
		adoptMock();
	}
	
	onError(error: Error) {
		errorMock(error);
	}
}

customElements.define('comp-two', CompTwo)

class CompThree extends WebComponent<{label: string}, {count: number}> {
	static observedAttributes = ['label'];
	label = '+';
	initialState = {
		count: 0
	}
	stylesheet = css`
		button {
			color: blue;
		}
	`
	
	countUp(e: Event) {
		e.stopPropagation();
		e.preventDefault();
		
		this.setState(({count}) => ({count: count + 1}))
		this.dispatch('click')
	}
	
	render() {
		return html`
			<p>${this.state.count}</p>
			<button type="button" onclick="${this.countUp.bind(this)}">
				${this.props.label}
			</button>
		`;
	};
}

customElements.define('comp-three', CompThree)

class CompFour extends WebComponent {
	config = {
		shadow: false
	}
	stylesheet = css`
		:host {
			display: inline-block;
		}
		button {
			color: blue;
		}
	`
}

customElements.define('comp-four', CompFour)

describe('WebComponent', () => {
	beforeEach(() => {
		// @ts-ignore
		jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => cb());
		jest.clearAllMocks();
		document.body.innerHTML = '';
	});
	
	afterEach(() => {
		// @ts-ignore
		window.requestAnimationFrame.mockRestore();
	});
	
	it('should create', () => {
		const one = new CompOne();
		
		document.body.append(one);
		
		expect(document.body.innerHTML).toBe('<comp-one></comp-one>')
		expect(one.shadowRoot).toBeDefined()
		expect(one.config.shadow).toBe(true)
		expect(one.config.mode).toBe('open')
		expect(one.shadowRoot?.mode).toBe('open')
		expect(one.config.delegatesFocus).toBe(false)
	});
	
	describe('should handle lifecycles', () => {
		const two = new CompTwo();
		
		it("onMount", () => {
			expect(two.mounted).toBe(false);
			
			document.body.append(two);
			
			expect(document.body.innerHTML).toBe('<comp-two></comp-two>')
			expect(mountMock).toHaveBeenCalled()
			expect(two.mounted).toBe(true);
		});
		
		it("onUpdate", () => {
			document.body.append(two);
			
			expect(two.props.sample()).toBe('');
			expect(two.sample).toBe('');
			
			two.setAttribute('sample', 'works')
			expect(document.body.innerHTML).toBe('<comp-two sample="works"></comp-two>')
			expect(updateMock).toHaveBeenCalled()
			expect(two.props.sample()).toBe('works');
			expect(two.sample).toBe('works');

			updateMock.mockClear()

			two.sample = 'works again';

			expect(document.body.innerHTML).toBe('<comp-two sample="works"></comp-two>')
			expect(updateMock).toHaveBeenCalled()
			expect(two.props.sample()).toBe('works again');
			expect(two.sample).toBe('works again');
		});
		
		it("onDestroy", () => {
			document.body.append(two);
			
			expect(two.mounted).toBe(true);
			
			two.remove();
			
			expect(document.body.innerHTML).toBe('')
			expect(destroyMock).toHaveBeenCalled()
			expect(two.mounted).toBe(false);
		});
		
		it("onAdoption", () => {
			const iframe = document.createElement('iframe');
			
			document.body.append(iframe);
			document.body.append(two);
			expect(document.body.innerHTML).toBe('<iframe></iframe><comp-two sample="works"></comp-two>')
			expect(mountMock).toHaveBeenCalled()
			
			mountMock.mockClear();
			
			iframe.contentDocument?.body.appendChild(two)
			
			expect(destroyMock).toHaveBeenCalled()
			expect(mountMock).toHaveBeenCalled()
			expect(adoptMock).toHaveBeenCalled()
		});
		
		it("onError", () => {
			mountMock.mockImplementation(() => {
				throw new Error('failed')
			})
			
			document.body.append(two);
			
			expect(mountMock).toHaveBeenCalled()
			expect(errorMock).toHaveBeenCalled()
		});
	})
	
	describe('should handle props', () => {
		const two = new CompTwo();
		
		beforeEach(() => {
			document.body.append(two)
		})
		
		it("has default prop value", () => {
			expect(two.sample).toBe('')
			expect(two.props.sample()).toBe('')
			expect(two.sampleVal).toBe('')
			expect(two.props.sampleVal()).toBe('')
		});
		
		it("updates via property", () => {
			two.sample = 'works';
			two.sampleVal = 'works too';
			
			expect(two.sample).toBe('works')
			expect(two.props.sample()).toBe('works')
			expect(updateMock).toHaveBeenCalledWith('sample', 'works', '')
			
			expect(two.sampleVal).toBe('works too')
			expect(two.props.sampleVal()).toBe('works too')
			expect(updateMock).toHaveBeenCalledWith('sampleVal', 'works too', '')
		});
		
		it("updates via setAttribute", () => {
			two.setAttribute('sample', 'works fine')
			
			expect(two.sample).toBe('works fine')
			expect(two.props.sample()).toBe('works fine')
			expect(updateMock).toHaveBeenCalledWith('sample', 'works fine', 'works')
		});
	})
	
	describe("should handle template", () => {
		const three = new CompThree();
		
		beforeEach(() => {
			document.body.append(three)
		})
		
		it("should render", () => {
			expect(three.state.count()).toEqual(0)
			
			expect(document.body.innerHTML).toBe('<comp-three></comp-three>')
			expect(three.contentRoot.innerHTML).toBe('<p>0</p>\n' +
				'\t\t\t<button type="button">+</button>')
		});
		
		it("when prop updates", () => {
			three.label = 'count up';
			
			expect(three.contentRoot.innerHTML).toBe('<p>0</p>\n' +
				'\t\t\t<button type="button">count up</button>')
		});
		
		it("if string rendered", () => {
			class StringComp extends WebComponent<{ }, {}> {
				render() {
					return 'Hello World'
				}
			}
			
			customElements.define('string-comp', StringComp);
			
			const el = new StringComp();
			
			document.body.appendChild(el);
			
			expect(el.contentRoot.innerHTML).toBe('Hello World')
		});
		
		it("if DOM elements rendered", () => {
			class ElComp extends WebComponent<{ }, {}> {
				render() {
					return element('p', {
						textContent: 'Hello World'
					})
				}
			}
			
			customElements.define('el-comp', ElComp);
			
			const el = new ElComp();
			
			document.body.appendChild(el);
			
			expect(el.contentRoot?.innerHTML).toBe('<p>Hello World</p>')
		});
	});
	
	it("should dispatch event", () => {
		const three = new CompThree();
		document.body.append(three)
		
		const clickMock = jest.fn();
		
		three.addEventListener('click', clickMock)
		
		three.click();
		three.contentRoot.querySelector('button')?.click();
		
		expect(clickMock).toHaveBeenCalledWith(expect.any(CustomEvent))
		expect(clickMock).toHaveBeenCalledWith(expect.any(Event))
	});
	
	describe('should handle style', () => {
		const four = new CompFour();
		
		beforeEach(() => {
			document.body.append(four)
		})
		
		it('with no shadow', () => {
			expect(four.config.shadow).toBe(false)
			expect(four.contentRoot).toEqual(four)
		})
		
		it("render style", () => {
			expect(document?.adoptedStyleSheets).toHaveLength(1)
			expect(document?.adoptedStyleSheets[0].cssRules).toHaveLength(2)
			expect(document?.adoptedStyleSheets[0].cssRules[0].cssText).toBe('comp-four {display: inline-block;}')
			expect(document?.adoptedStyleSheets[0].cssRules[1].cssText).toBe('button {color: blue;}')
		});
		
		it("update style", () => {
			const sheet = four.stylesheet;
			
			four.updateStylesheet('button {color: red}');
			
			expect(document?.adoptedStyleSheets[0]).not.toEqual(sheet)
		});
		
		it("remove style", () => {
			four.updateStylesheet(null);
			
			expect(document?.adoptedStyleSheets).toHaveLength(0)
		});
	})
	
	it("should handle state", () => {
		const three = new CompThree();
		
		document.body.append(three)
		
		expect(three.state.count()).toEqual(0)
		
		expect(document.body.innerHTML).toBe('<comp-three></comp-three>')
		expect(three.contentRoot.innerHTML).toBe('<p>0</p>\n' +
			'\t\t\t<button type="button">+</button>')
		
		three.setState({
			count: 10
		})
		
		expect(three.contentRoot.innerHTML).toBe('<p>10</p>\n' +
			'\t\t\t<button type="button">+</button>')
	});
});
