// normalizer

import {
  isString,
  isObject,
  isArray,
  hasProperty,
  stripTags,
  truncate
} from 'bellajs'
import { decode } from 'html-entities'

import { isValid as isValidUrl, purify as purifyUrl } from './linker.js'
import { getReaderOptions } from '../config.js'
import { buildXML, getKeys, hasElementHelper } from './xmlutils.js'
import { XMLParser } from 'fast-xml-parser'

export const toISODateString = (dstr) => {
  try {
    return dstr ? new Date(dstr).toISOString() : ''
  } catch (err) {
    return ''
  }
}

export const buildDescription = (val) => {
  const { descriptionMaxLen } = getReaderOptions()
  const stripped = stripTags(String(val))
  return truncate(stripped, descriptionMaxLen).replace(/\n+/g, ' ')
}

const htmlTags = new Set([
  'div',
  'p',
  'a',
  'body',
  'img',
  'svg',
  'main',
  'article',
  'section'
])

const isHTML = (array) => {
  return array.some((value) => htmlTags.has(value))
}

const hasText = (object) => {
  return (
    hasElementHelper(object, '_text') ||
    hasElementHelper(object, '#text') ||
    hasElementHelper(object, '_cdata') ||
    hasElementHelper(object, '$t') ||
    typeof object === 'string'
  )
}

export const getText = (val) => {
  if (Array.isArray(val)) {
    if (val.length === 0) return ''
    if (isHTML(getKeys(val))) {
      return buildXML(val)
    } else {
      if (val.length === 1) return getText(val[0])
      if (val.length > 1 && val.every((entry) => hasText(entry))) {
        const uniqueValues = [
          ...new Set(val.map((value) => getText(value)))
        ].filter((value) => value !== '')
        return uniqueValues.join('')
      }
      if (val.length > 1 && val.some((entry) => hasText(entry))) {
        const uniqueValues = [
          ...new Set(val.map((value) => getText(value)))
        ].filter((value) => value !== '')
        return uniqueValues.length === 1 ? uniqueValues[0] : uniqueValues
      }
      return parseAgain(val)
    }
  }
  let txt = val
  if (typeof val === 'string' || typeof val === 'number') {
    txt = val
  } else if (isObject(val)) {
    txt =
      val._text ||
      val['#text'] ||
      val._cdata ||
      val.$t ||
      (val[':@'] &&
        Object.keys(val[':@']).length === 1 &&
        val[':@'][Object.keys(val[':@'])[0]])
  }
  return txt ? decode(String(txt).trim()) : ''
}

const parseAgain = (value) => {
  const xml = buildXML(value)
  return new XMLParser({ ignoreAttributes: false }).parse(xml)
}

export const getLink = (val = [], id = '') => {
  const getEntryLink = (links) => {
    const items = links.map((item) => {
      return getLink(item)
    })
    return items.length > 0 ? items[0] : null
  }
  if (isString(val)) {
    return getText(val)
  }
  if (isObject(val) && hasProperty(val, 'href')) {
    return getText(val.href)
  }
  if (isObject(val) && hasProperty(val, '@_href')) {
    return getText(val['@_href'])
  }
  if (isObject(val) && hasProperty(val, '_attributes')) {
    return getText(val._attributes.href)
  }
  if (isObject(val) && hasProperty(val, ':@')) {
    return getLink(val[':@'], id)
  }
  if (isArray(val)) {
    return getEntryLink(val)
  }

  const text = getText(val)
  if (isValidUrl(text)) return text
  if (id && isValidUrl(id)) {
    return id
  }
  return ''
}

export const getPureUrl = (url, id = '') => {
  const link = getLink(url, id)
  return purifyUrl(link)
}
