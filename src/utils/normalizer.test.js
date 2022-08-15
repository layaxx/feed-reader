// normalizer.test
/* eslint-env jest */

import { getLink, getText, toISODateString } from './normalizer.js'

describe('test `normalizer` methods', () => {
  test('test toISODateString()', () => {
    expect(toISODateString('Thu, 28 Jul 2022 08:59:58 GMT')).toEqual('2022-07-28T08:59:58.000Z')
    expect(toISODateString('2022-07-28T02:43:00.000000000Z')).toEqual('2022-07-28T02:43:00.000Z')
    expect(toISODateString('')).toEqual('')
    expect(toISODateString('Thi, 280 Jul 2022 108:79:68 XMT')).toEqual('')
  })

  describe('test getText()', () => {
    test('return string for string input', () => {
      expect(getText('text')).toEqual('text')
    })

    test('test getText() with Object', () => {
      expect(getText({ _text: 'expected' })).toEqual('expected')
      expect(getText({ '#text': 'expected' })).toEqual('expected')
      expect(getText({ _cdata: 'expected' })).toEqual('expected')
      expect(getText({ $t: 'expected' })).toEqual('expected')
      expect(getText({ someOtherValue: 'unexpected' })).toEqual('')
    })

    test('test getText() with Array', () => {
      expect(getText([])).toEqual('')
      expect(getText([{ '#text': 'expected' }])).toEqual('expected')
      expect(getText([{ _cdata: 'expected' }, { _cdata: 'expected' }])).toEqual('expected')
      expect(getText([{ _cdata: 'exp' }, { _cdata: 'ect' }, 'ed'])).toEqual('expected')
    })
  })

  describe('test getLink()', () => {
    test('return id iff valid', () => {
      expect(getLink('https://example.com', 'not a valid-link.eu')).toEqual('https://example.com')
      expect(getLink('https://also-valid-link.com', 'http://valid-link.eu')).toEqual('http://valid-link.eu')
    })

    test('test getLink() with object', () => {
      expect(getLink({ href: 'http://valid-link.eu' })).toEqual('http://valid-link.eu')
      expect(getLink({ '@_href': 'http://valid-link.eu' })).toEqual('http://valid-link.eu')
      expect(getLink({ _attributes: { href: 'http://valid-link.eu' } })).toEqual('http://valid-link.eu')
      expect(getLink({ ':@': { '@_href': 'http://valid-link.eu' } })).toEqual('http://valid-link.eu')
      expect(getLink([{ ':@': { '@_href': 'http://valid-link.eu' } }])).toEqual('http://valid-link.eu')
      expect(getLink([{ '#text': 'https://astralcodexten.substack.com' }])).toEqual('https://astralcodexten.substack.com')
    })

    test('test getLink() with array', () => {
      expect(getLink(['https://valid-link.com'])).toEqual('https://valid-link.com')
      expect(getLink(['https://also-valid-link.com', 'http://valid-link.eu'])).toEqual('https://also-valid-link.com')
    })
  })
})
