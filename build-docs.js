import { buildDocs } from '@beforesemicolon/builder'
import fs from 'fs'
import path from 'path'

const cleanAssets = () => {
    const assetsDir = path.join(process.cwd(), 'website/assets')
    const filesToDelete = [
        'markup-banner.jpg',
        'markup-essentials-training.jpg',
        'markup-favicon.jpg',
        'markup-favicon.png',
        'markup-logo-name.svg',
        'markup-logo-name@2x.png',
        'markup-logo.svg',
        'markup-logo@2x.png',
        'client-server.svg',
        'fast.svg',
        'independent.svg',
        'reactive.svg',
        'simple.svg',
        'small.svg',
    ]

    filesToDelete.forEach((file) => {
        const filePath = path.join(assetsDir, file)

        if (fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath)
                console.log(`Cleared default asset: ${file}`)
            } catch (err) {
                console.error(`Failed to delete default asset ${file}:`, err)
            }
        }
    })
}

const createSectionRedirects = () => {
    const redirects = {
        'documentation/fundamentals':
            '/documentation/fundamentals/creating-components',
        'documentation/props-and-state': '/documentation/props-and-state/props',
        'documentation/styling': '/documentation/styling/stylesheet',
        'documentation/events-and-lifecycle':
            '/documentation/events-and-lifecycle/events',
        'documentation/advanced': '/documentation/advanced/form-integration',
    }

    Object.entries(redirects).forEach(([from, to]) => {
        const indexFile = path.join(
            process.cwd(),
            'website',
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
}

const run = async () => {
    try {
        fs.rmSync(path.join(process.cwd(), 'website'), {
            recursive: true,
            force: true,
        })

        await buildDocs({
            template: 'fading-citrus',
            siteUrl: 'https://web-component.beforesemicolon.com',
            generatedFiles: {
                netlify: true,
            },
        })
        // Wait for the unawaited async writeFile calls in builder's forEach to finish
        await new Promise((resolve) => setTimeout(resolve, 1000))
        createSectionRedirects()
        cleanAssets()
        console.log('Documentation built successfully.')
    } catch (error) {
        console.error('Failed to build documentation:', error)
        process.exit(1)
    }
}

run()
