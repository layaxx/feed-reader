// config.test
/* eslint-env jest */

import { hasProperty } from 'bellajs'

import {
  setRequestOptions,
  getRequestOptions,
  setReaderOptions,
  getReaderOptions,
  setParserOptions,
  getParserOptions
} from './config.js'

const defaultRequestOptions = getRequestOptions()
const defaultReaderOptions = getReaderOptions()

afterAll(() => {
  return setReaderOptions(defaultReaderOptions) && setRequestOptions(defaultRequestOptions)
})

describe('check methods from `config`', () => {
  test('Testing setRequestOptions/getRequestOptions methods', () => {
    setRequestOptions({
      headers: {
        authorization: 'bearer <token>'
      },
      timeout: 20,
      somethingElse: 1000
    })

    const { headers, timeout, somethingElse } = getRequestOptions()

    expect(hasProperty(headers, 'authorization')).toBeTruthy()
    expect(hasProperty(headers, 'user-agent')).toBeTruthy()
    expect(hasProperty(headers, 'accept-encoding')).toBeTruthy()
    expect(timeout).toEqual(20)
    expect(somethingElse).toEqual(1000)
  })
  test('Testing setReaderOptions/getReaderOptions methods', () => {
    setReaderOptions({
      descriptionMaxLen: 250,
      includeFullContent: true
    })

    const { descriptionMaxLen, includeFullContent } = getReaderOptions()

    expect(descriptionMaxLen).toEqual(250)
    expect(includeFullContent).toEqual(true)
  })

  test('Testing setParserOptions/getParserOptions methods', () => {
    setParserOptions({
      ignoreAttributes: true,
      stopNodes: ['feed.entry', 'other.path.to.tag'],
      removeNSPrefix: false,
      newAttribute: 'someValue'
    })

    const { ignoreAttributes, stopNodes, removeNSPrefix, newAttribute } = getParserOptions()

    expect(ignoreAttributes).toEqual(true)
    expect(stopNodes).toContain('feed.entry')
    expect(stopNodes).toContain('other.path.to.tag')
    expect(removeNSPrefix).toEqual(false)
    expect(newAttribute).toEqual('someValue')
  })
})
