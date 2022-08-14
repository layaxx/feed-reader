// utils / xmlparser

import { hasProperty, isString } from 'bellajs'

import { XMLValidator, XMLParser } from 'fast-xml-parser'
import { getParserOptions } from '../config'

export const isRSS = (data = {}) => {
  return hasProperty(data, 'rss') && hasProperty(data.rss, 'channel')
}

export const isAtom = (data = {}) => {
  return hasProperty(data, 'feed') && hasProperty(data.feed, 'entry')
}

export const validate = (xml) => {
  return (!isString(xml) || !xml.length) ? false : XMLValidator.validate(xml) === true
}

export const xml2obj = (xml = '') => {
  const parser = new XMLParser(getParserOptions())
  const jsonObj = parser.parse(xml)
  return jsonObj
}
