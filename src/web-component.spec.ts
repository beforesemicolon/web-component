import {WebComponent} from './web-component';
import { element, html } from "@beforesemicolon/markup";

class CompOne extends WebComponent {}

customElements.define('comp-one', CompOne)

const mountMock = jest.fn();
const updateMock = jest.fn();
const destroyMock = jest.fn();
const adoptMock = jest.fn();
class CompTwo extends WebComponent<{sample: string}> {
	static observedAttributes = ['sample'];
	sample = '';
	
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
}

customElements.define('comp-two', CompTwo)

class CompThree extends WebComponent<{label: string}, {count: number}> {
	static observedAttributes = ['label'];
	label = '+';
	initialState = {
		count: 0
	}
	stylesheet = `
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
	shadow = false;
	stylesheet = `
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
		expect(one.shadow).toBe(true)
		expect(one.mode).toBe('open')
		expect(one.shadowRoot?.mode).toBe('open')
		expect(one.delegatesFocus).toBe(false)
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
			
			document.body.append(two, iframe);
			
			expect(document.body.innerHTML).toBe('<comp-two sample="works"></comp-two><iframe></iframe>')
			expect(mountMock).toHaveBeenCalled()
			
			mountMock.mockClear();
			
			iframe.contentDocument?.body.appendChild(two)
			
			expect(destroyMock).toHaveBeenCalled()
			expect(mountMock).toHaveBeenCalled()
			expect(adoptMock).toHaveBeenCalled()
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
		});
		
		it("updates via property", () => {
			two.sample = 'works';
			
			expect(two.sample).toBe('works')
			expect(two.props.sample()).toBe('works')
			expect(updateMock).toHaveBeenCalledWith('sample', 'works', '')
		});
		
		it("updates via setAttribute", () => {
			two.setAttribute('sample', 'works fine')
			
			expect(two.sample).toBe('works fine')
			expect(two.props.sample()).toBe('works fine')
			expect(updateMock).toHaveBeenCalledWith('sample', 'works fine', '')
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
			expect(three.shadowRoot?.innerHTML).toBe('<p>0</p>\n' +
				'\t\t\t<button type="button">+</button>')
		});
		
		it("when prop updates", () => {
			three.label = 'count up';
			
			expect(three.shadowRoot?.innerHTML).toBe('<p>0</p>\n' +
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
			
			expect(el.shadowRoot?.innerHTML).toBe('Hello World')
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
			
			expect(el.shadowRoot?.innerHTML).toBe('<p>Hello World</p>')
		});
	});
	
	it("should dispatch event", () => {
		const three = new CompThree();
		document.body.append(three)
		
		const clickMock = jest.fn();
		
		three.addEventListener('click', clickMock)
		
		three.click();
		three.shadowRoot?.querySelector('button')?.click();
		
		expect(clickMock).toHaveBeenCalledWith(expect.any(CustomEvent))
		expect(clickMock).toHaveBeenCalledWith(expect.any(Event))
	});
	
	describe('should handle style', () => {
		const four = new CompFour();
		
		beforeEach(() => {
			document.body.append(four)
		})
		
		it("render style", () => {
			expect(document?.adoptedStyleSheets).toHaveLength(1)
		});
		
		it("update style", () => {
			const sheet = four.stylesheet;
			
			four.updateStylesheet('button {color: red}');
			
			expect(document?.adoptedStyleSheets[0]).not.toEqual(sheet)
		});
		
		it("ignore update style", () => {
			const sheet = four.stylesheet;
			
			// @ts-ignore
			four.updateStylesheet(null);
			
			expect(document?.adoptedStyleSheets[0]).toEqual(sheet)
		});
	})
	
	it("should handle state", () => {
		const three = new CompThree();
		
		document.body.append(three)
		
		expect(three.state.count()).toEqual(0)
		
		expect(document.body.innerHTML).toBe('<comp-three></comp-three>')
		expect(three.shadowRoot?.innerHTML).toBe('<p>0</p>\n' +
			'\t\t\t<button type="button">+</button>')
		
		three.setState({
			count: 10
		})
		
		expect(three.shadowRoot?.innerHTML).toBe('<p>10</p>\n' +
			'\t\t\t<button type="button">+</button>')
	});
});
