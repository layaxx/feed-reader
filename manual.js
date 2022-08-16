import { xml2obj } from './src/utils/xmlparser.js'
import { readFileSync } from 'fs'
import { getAllMatches, getFirstMatch } from './src/utils/xmlutils.js'
import { getText } from './src/utils/normalizer.js'

const text = readFileSync('test.xml')
const xml = xml2obj(text)

const x = getAllMatches(getFirstMatch(getFirstMatch(xml, 'rss'), 'channel'), 'owner')

console.log(x, getText(x))
