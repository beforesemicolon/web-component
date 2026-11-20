import { readFile } from 'node:fs/promises'
import { generateReference } from './generate-ai-reference.mjs'

const markupName = '@beforesemicolon/markup'
const markup = JSON.parse(
    await readFile('node_modules/@beforesemicolon/markup/package.json', 'utf8')
)
const components = '/documentation/fundamentals/creating-components'
const componentExamples = {
    WebComponent: {
        summary:
            'Build and register a native custom element with reactive props and state.',
        keywords: [
            'custom element',
            'component',
            'attribute',
            'slot',
            'cleanup',
            'event',
            'register',
        ],
        docs: components,
        fixture: 'status-button',
        notes: [
            'Register a hyphenated tag with customElements.define. The Web Component class does not register it.',
            'Declare lowercase observed attributes and default camelCase instance fields. Read prop values with this.props.key() in logic and pass this.props.key as a reactive getter in a template.',
            'Use initialState for reactive internal values and setState only while mounted. Bind a class arrow field directly as a native control event handler.',
            'Use a default slot for one customizable area. If the component has multiple independent areas, name the additional slots.',
            'Dispatch one documented event with complete event.detail. This helper dispatches at the host and does not set bubbles or composed; listen directly unless you explicitly need and implement another propagation contract.',
            'Start a subscription or listener in onMount and return its cleanup. onMount runs on each connection and cleanup runs on removal. Do not call another component instance’s lifecycle, state, or dispatch internals.',
        ],
    },
    css: {
        summary: 'Define a component stylesheet with a tagged template.',
        docs: '/documentation/styling/css-utility',
        keywords: ['css', 'style', 'shadow DOM', 'stylesheet'],
        names: ['css'],
        body: "const stylesheet = css\x60:host { display: block }\x60\nconsole.assert(stylesheet.toString().includes('display: block'))",
        notes: [
            'Define :host styles in the component stylesheet. The default open shadow root isolates internal styles from global application styles.',
        ],
    },
    CSSStyle: {
        summary: 'Inspect a stylesheet produced by the css factory.',
        docs: '/documentation/styling/css-utility',
        keywords: ['css', 'stylesheet'],
        names: ['CSSStyle', 'css'],
        body: 'const stylesheet = css\x60:host { display: block }\x60\nconsole.assert(stylesheet instanceof CSSStyle)',
        notes: [
            'Use css to construct stylesheets. The CSSStyle class has a named npm export, but the classic bundle only exposes the css factory.',
        ],
    },
}

const markupExamples = {
    html: {
        body: 'html\x60<p>Hello</p>\x60.render(document.body)',
        summary: 'Create a reactive HTML template.',
        keywords: ['render', 'template'],
    },
    state: {
        body: 'const [count, setCount] = state(0)\nsetCount(1)\nconsole.assert(count() === 1)',
        summary: 'Create a reactive state getter and setter.',
        keywords: ['signal', 'state'],
    },
    effect: {
        body: "const [title] = state('Ready')\nconst stop = effect(() => { document.title = title() })\nwindow.addEventListener('pagehide', stop, { once: true })",
        names: ['effect', 'state'],
        summary: 'Run a side effect and get its disposer.',
        keywords: ['side effect', 'cleanup', 'reactive'],
    },
    repeat: {
        body: "console.assert(repeat(['a', 'b'], (name) => name)().length === 2)",
        summary: 'Map a reactive iterable into stable rendered items.',
    },
    when: {
        body: "console.assert(when(true, 'shown', 'hidden')() === 'shown')",
        summary: 'Choose a conditional template value.',
    },
    pick: {
        body: "console.assert(pick({ item: { name: 'Pear' } }, 'item.name')() === 'Pear')",
        summary: 'Read a nested value through a reactive getter.',
    },
    is: {
        body: "console.assert(is('yes', 'yes')())",
        summary:
            'Check equality, truthiness, a regular expression, or a predicate.',
    },
    isNot: {
        body: "console.assert(isNot('no', 'yes')())",
        summary: 'Negate the is comparison.',
    },
    and: {
        body: 'console.assert(and(true, true)())',
        summary: 'Check whether all the inputs are truthy.',
    },
    or: {
        body: 'console.assert(or(false, true)())',
        summary: 'Check whether any of the inputs is truthy.',
    },
    oneOf: {
        body: "console.assert(oneOf('red', ['red', 'green'])())",
        summary: 'Check whether a value occurs in a list.',
    },
    val: {
        body: 'console.assert(val(() => 7) === 7)',
        summary: 'Evaluate a helper getter once.',
    },
    element: {
        body: "document.body.append(element('p', { textContent: 'Ready' }))",
        summary: 'Construct a detached native or registered custom element.',
    },
    HtmlTemplate: {
        body: 'const template = html\x60<p>Ready</p>\x60\nconsole.assert(template instanceof HtmlTemplate)\ntemplate.render(document.body)',
        names: ['HtmlTemplate', 'html'],
        summary: 'Represent a mountable reactive template.',
    },
    unsafeHTML: {
        body: "unsafeHTML('<strong>Trusted literal</strong>').render(document.body)",
        summary: 'Parse trusted raw HTML without sanitizing it.',
    },
    suspense: {
        body: "html\x60\${suspense(async () => 'Loaded')}\x60.render(document.body)",
        names: ['suspense', 'html'],
        summary: 'Handle a promise with loading and error templates.',
    },
    visible: {
        body: 'visible(() => html\x60<p>Visible</p>\x60).render(document.body)',
        names: ['visible', 'html'],
        summary: 'Reveal content on intersection with the viewport.',
    },
    DynamicValueType: {
        body: 'console.log(DynamicValueType.Directive)',
        summary: 'Identify the runtime kind of a dynamic binding.',
    },
}

function forwarded(name, { typeOnly, ownerFile }) {
    if (!ownerFile.includes('/node_modules/@beforesemicolon/markup/')) return
    const local = markupExamples[name]
    if (!local && !typeOnly) return
    return {
        summary:
            local?.summary ??
            `Markup TypeScript type ${name}, available as a named re-export.`,
        body: local?.body ?? `export type { ${name} }`,
        names: local?.names,
        keywords: local?.keywords,
        reexportOf: {
            package: markupName,
            version: markup.version,
            id: `markup/${name}`,
        },
    }
}

const types = {
    ObjectInterface: 'Type the keys and values of a props or state object.',
    Props: 'Type reactive getter properties declared as observed attributes.',
    PropsSetters: 'Type setter functions for declared reactive props.',
    State: 'Type reactive getters for component internal state.',
    StateSetters: 'Type setter functions for component internal state.',
    HTMLComponentElement:
        'Type an external instance using its declared props and the WebComponent base.',
}
const typeGuidance = Object.fromEntries(
    Object.entries(types).map(([name, summary]) => [
        name,
        {
            summary,
            docs: '/documentation/fundamentals/typescript',
            body: `export type { ${name} }`,
        },
    ])
)

await generateReference({
    slug: 'web-component',
    documentation: 'https://web-component.beforesemicolon.com',
    browserRoots: { MARKUP: 'namespace', WebComponent: 'value', css: 'value' },
    browserAbsent: ['CSSStyle'],
    guidance: { ...componentExamples, ...typeGuidance },
    reexportGuidance: forwarded,
    examples: {
        'status-button': {
            title: 'Register a reusable status button',
            names: ['WebComponent', 'html'],
            markup: '<status-button message="Ready">Confirm status</status-button>',
            body: await readFile(
                new URL('./ai-examples/status-button.js', import.meta.url),
                'utf8'
            ),
        },
    },
})
