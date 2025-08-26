import { buildModules } from '@beforesemicolon/builder'

buildModules()
    .then(() => console.log('build module complete'))
    .catch(console.error)
