import { buildModules, buildBrowser } from '@beforesemicolon/builder'
import { writeFile } from 'node:fs/promises'

await Promise.all([
    buildBrowser({
        esbuildOptions: {
            keepNames: false,
            sourcemap: false,
        },
    }),
    buildModules({
        esbuildOptions: {
            keepNames: false,
        },
    }),
])

await writeFile(
    new URL('./dist/cjs/package.json', import.meta.url),
    `${JSON.stringify({ type: 'commonjs' }, null, 4)}\n`
)
