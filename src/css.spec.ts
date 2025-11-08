import {css} from './css.ts';
import { state } from "@beforesemicolon/markup";

describe('css', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.clearAllMocks();
  });
  
  afterEach(() => {
    jest.useRealTimers()
  })
  
  it('should render static', () => {
    const cssStyle = css`color: blue;`;
    
    expect(cssStyle.toString()).toBe('color: blue;')
  })
  
  it('should render injected static value', () => {
    const color = 'blue'
    const cssStyle = css`color: ${color};`;
    jest.advanceTimersToNextTimer()
    
    expect(cssStyle.toString()).toBe('color: blue;')
  })
  
  it('should render injected dynamic value', () => {
    const color = () => 'blue'
    const cssStyle = css`color: ${color};`;
    jest.advanceTimersToNextTimer()
    
    expect(cssStyle.toString()).toBe('color: blue;')
  })
  
  it('should render injected state value', () => {
    const updateMock = jest.fn()
    const [color, setColor] = state('blue');
    const cssStyle = css`color: ${color};`;
    cssStyle.onUpdate(updateMock)
    
    jest.advanceTimersToNextTimer()
    
    expect(cssStyle.toString()).toBe('color: blue;')
    
    setColor('red');
    jest.advanceTimersToNextTimer()
    
    expect(updateMock).toHaveBeenLastCalledWith('color: red;')
  })
})
