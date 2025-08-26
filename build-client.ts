import { buildBrowser } from '@beforesemicolon/builder'

buildBrowser()
    .then(() => console.log('build client complete'))
    .catch(console.error)
