// utils / xmlparser

import { isString } from 'bellajs'

import { XMLValidator, XMLParser } from 'fast-xml-parser'
import { getParserOptions } from '../config.js'
import { hasElementHelper, getFirstMatch } from './xmlutils.js'

export const isRSS = (data = {}) => {
  return hasElementHelper(data, 'rss') &&
    hasElementHelper(getFirstMatch(data, 'rss'), 'channel')
}

export const isAtom = (data = {}) => {
  return hasElementHelper(data, 'feed') &&
    hasElementHelper(getFirstMatch(data, 'feed'), 'entry')
}

export const validate = (xml) => {
  return isString(xml) && Boolean(xml.length) && XMLValidator.validate(xml) === true
}

export const xml2obj = (xml = '') => {
  const parser = new XMLParser(getParserOptions())
  const jsonObj = parser.parse(xml)
  return jsonObj
}
