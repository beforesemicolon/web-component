const {JSDOM} = require('jsdom');
const dom = new JSDOM()
global.document = dom.window.document
global.window = dom.window
global.HTMLElement = dom.window.HTMLElement;
global.Element = dom.window.Element;
global.Node = dom.window.Node;
global.Comment = dom.window.Comment;
global.Text = dom.window.Text;
global.CSSStyleDeclaration = dom.window.CSSStyleDeclaration;
global.customElements = dom.window.customElements;
global.ShadowRoot = dom.window.ShadowRoot;
global.MouseEvent = dom.window.MouseEvent;
global.DocumentFragment = dom.window.DocumentFragment;
global.DocumentFragment = dom;
global.Event = dom.window.Event;
global.requestAnimationFrame = (callback) => {
  const id = Date.now();
  callback(id);
  
  return id;
};
global.cancelAnimationFrame = () => {};
global.Event = dom.window.Event;
