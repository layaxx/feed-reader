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
import { buildXML } from './xmlutils.js'

export const toISODateString = (dstr) => {
  try {
    return dstr ? (new Date(dstr)).toISOString() : ''
  } catch (err) {
    return ''
  }
}

export const buildDescription = (val) => {
  const { descriptionMaxLen } = getReaderOptions()
  const stripped = stripTags(String(val))
  return truncate(stripped, descriptionMaxLen).replace(/\n+/g, ' ')
}

export const getText = (val) => {
  if (Array.isArray(val)) {
    if (val.length === 1) return getText(val[0])
    if (val.length > 1) {
      const uniqueValues = [...new Set(val.map(value => getText(value)))]
        .filter(value => value !== '')
      return uniqueValues.join('')
    }
    return ''
  }
  let txt = val
  if (typeof val === 'string' || typeof val === 'number') {
    txt = val
  } else if (isObject(val)) {
    txt = (val._text || val['#text'] || val._cdata || val.$t || getText(buildXML([val])))
  }
  return txt ? decode(String(txt).trim()) : ''
}

export const getLink = (val = [], id = '') => {
  if (id && isValidUrl(id)) {
    return id
  }
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
  return isValidUrl(text) ? text : undefined
}

export const getPureUrl = (url, id = '') => {
  const link = getLink(url, id)
  return purifyUrl(link)
}
