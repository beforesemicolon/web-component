import { buildDocs } from '@beforesemicolon/site-builder'
import fs from 'fs'
import path from 'path'

const createSectionRedirects = (locales) => {
    const redirects = {
        'documentation/fundamentals':
            '/documentation/fundamentals/creating-components',
        'documentation/props-and-state': '/documentation/props-and-state/props',
        'documentation/styling': '/documentation/styling/stylesheet',
        'documentation/events-and-lifecycle':
            '/documentation/events-and-lifecycle/events',
        'documentation/advanced': '/documentation/advanced/form-integration',
    }

    locales.forEach((locale) => {
        Object.entries(redirects).forEach(([from, to]) => {
            const indexFile = path.join(
                process.cwd(),
                'website',
                locale,
                from,
                'index.html'
            )

            fs.mkdirSync(path.dirname(indexFile), { recursive: true })
            fs.writeFileSync(
                indexFile,
                `<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=${to}"><link rel="canonical" href="${to}"><script>location.replace(${JSON.stringify(
                    to
                )})</script>`
            )
        })
    })
}

const run = async () => {
    try {
        const result = await buildDocs()
        createSectionRedirects(result.locales)
        console.log('Documentation built successfully.')
    } catch (error) {
        console.error('Failed to build documentation:', error)
        process.exit(1)
    }
}

run()
