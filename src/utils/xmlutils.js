import { hasProperty } from 'bellajs'
import { XMLBuilder } from 'fast-xml-parser'
import { getParserOptions } from '../config.js'

const builder = new XMLBuilder(getParserOptions())
export const hasElementHelper = (element, expectedElement) => {
  if (Array.isArray(element)) {
    return element.some(object => hasProperty(object, expectedElement))
  }
  return hasProperty(element, expectedElement)
}

export const getFirstMatch = (element, child) => {
  if (!element || !child) {
    throw new Error('Failed to navigate with falsy input')
  }
  if (Array.isArray(element)) {
    const foundElement = element.find(object => hasProperty(object, child))
    return foundElement ? ((foundElement[child] && foundElement[child].length) ? foundElement[child] : foundElement) : undefined
  }
  return element[child]
}

export const getAllMatches = (element, child) => {
  if (!element || !child) {
    throw new Error('Failed to navigate with falsy input')
  }
  if (Array.isArray(element)) {
    return element.filter(object => hasProperty(object, child)).map(foundElement => (foundElement[child] && foundElement[child].length ? foundElement[child] : foundElement))
  }
  return element[child]
}

export const getKeys = (element) => {
  if (Array.isArray(element)) {
    return element.map(object => Object.keys(object)[0])
  } else {
    return Object.keys(element)
  }
}

export const buildXML = (object) => {
  try {
    return builder.build(object)
  } catch { return '' }
}
