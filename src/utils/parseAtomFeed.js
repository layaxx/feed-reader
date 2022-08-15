// parseAtomFeed.js

// specs: https://datatracker.ietf.org/doc/html/rfc5023
// refer: https://validator.w3.org/feed/docs/atom.html

import {
  getText,
  toISODateString,
  buildDescription,
  getPureUrl
} from './normalizer.js'

import { getReaderOptions } from '../config.js'
import { getAllMatches, getFirstMatch, getKeys } from './xmlutils.js'

const transform = (item, includeFullContent, convertPubDateToISO) => {
  const keys = [...new Set(getKeys(item))]

  const standardKeys = new Set(['id', 'title', 'updated', 'published', 'link', 'summary', 'content', 'encoded'])

  const
    title = getText(getFirstMatch(item, 'title'))
  const link = getFirstMatch(item, 'link')
  const summary = getText(getFirstMatch(item, 'summary'))
  const updated = getText(getFirstMatch(item, 'updated'))
  const published = getText(getFirstMatch(item, 'published'))
  const id = getText(getFirstMatch(item, 'id'))
  const content = getText(getFirstMatch(item, 'content'))
  const encoded = getText(getFirstMatch(item, 'encoded'))

  const pubDate = updated || published
  const entry = {
    title,
    link: getPureUrl(link, id),
    published: convertPubDateToISO ? toISODateString(pubDate) : pubDate,
    description: buildDescription(encoded || content || summary)
  }
  if (includeFullContent) {
    entry.content = (encoded || content || summary)
    keys.filter(key => !standardKeys.has(key))
      .forEach(key => { entry[key] = getText(getAllMatches(item, key)) })
  }
  return entry
}

const parseAtom = (data) => {
  const feed = getFirstMatch(data, 'feed')
  const keys = [...new Set(getKeys(feed))]

  const standardKeys = new Set(['id', 'title', 'link', 'subtitle', 'generator', 'language', 'updated', 'entry'])

  const lastBuildDate = getText(getFirstMatch(feed, 'updated'))
  const items = getAllMatches(feed, 'entry')

  const {
    includeFullContent,
    convertPubDateToISO
  } = getReaderOptions()

  const parsedFeed = {
    id: getText(getFirstMatch(feed, 'id')),
    title: getText(getFirstMatch(feed, 'title')),
    link: getPureUrl(getFirstMatch(feed, 'link')),
    description: getText(getFirstMatch(feed, 'subtitle')),
    generator: getText(getFirstMatch(feed, 'generator')),
    language: getText(getFirstMatch(feed, 'language')),
    published: toISODateString(lastBuildDate),
    entries: items.map((item) => {
      return transform(item, includeFullContent, convertPubDateToISO)
    })
  }

  if (includeFullContent) {
    keys.filter(key => !standardKeys.has(key))
      .forEach(key => { parsedFeed[key] = getText(getAllMatches(feed, key)) })
  }

  return parsedFeed
}

export default (data) => {
  return parseAtom(data)
}
