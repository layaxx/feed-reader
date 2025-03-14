// parseRssFeed.js

// specs: https://www.rssboard.org/rss-specification

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

  const standardKeys = new Set(['title', 'link', 'description', 'pubDate', 'guid', 'content', 'encoded'])

  const
    title = getText(getFirstMatch(item, 'title'))
  const link = getFirstMatch(item, 'link')
  const description = getText(getFirstMatch(item, 'description'))
  const pubDate = getText(getFirstMatch(item, 'pubDate'))
  const guid = getText(getFirstMatch(item, 'guid'))
  const content = getText(getFirstMatch(item, 'content'))
  const encoded = getText(getFirstMatch(item, 'encoded'))

  const published = convertPubDateToISO ? toISODateString(pubDate) : pubDate

  const entry = {
    title: getText(title),
    link: getPureUrl(link, guid),
    published,
    description: buildDescription(description || encoded || content),
    guid
  }
  if (includeFullContent) {
    entry.content = (encoded || content || description)
    keys.filter(key => !standardKeys.has(key))
      .forEach(key => { entry[key] = getText(getAllMatches(item, key)) })
  }

  return entry
}

const parseRss = (data) => {
  const channel = getFirstMatch(getFirstMatch(data, 'rss'), 'channel')
  const keys = [...new Set(getKeys(channel))]

  const standardKeys = new Set(['title', 'link', 'description', 'generator', 'language', 'lastBuildDate', 'item'])

  const lastBuildDate = getText(getFirstMatch(channel, 'lastBuildDate'))
  const items = getAllMatches(channel, 'item')

  const {
    includeFullContent,
    convertPubDateToISO
  } = getReaderOptions()

  const feed = {
    title: getText(getFirstMatch(channel, 'title')),
    link: getPureUrl(getFirstMatch(channel, 'link')),
    description: getText(getFirstMatch(channel, 'description')),
    language: getText(getFirstMatch(channel, 'language')),
    generator: getText(getFirstMatch(channel, 'generator')),
    published: toISODateString(lastBuildDate),
    entries: items.map((item) => {
      return transform(item, includeFullContent, convertPubDateToISO)
    })
  }
  if (includeFullContent) {
    keys.filter(key => !standardKeys.has(key))
      .forEach(key => { feed[key] = getText(getAllMatches(channel, key)) })
  }
  return feed
}

export default (data) => {
  return parseRss(data)
}
