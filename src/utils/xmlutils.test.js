// xmlutils.test
/* eslint-env jest */

import { buildXML, getAllMatches, getFirstMatch, getKeys } from './xmlutils.js'

describe('test `xmlutils` methods', () => {
  test('test buildXML()', () => {
    expect(buildXML(null)).toEqual('')
    expect(buildXML({})).toEqual('')
    expect(buildXML({ some: { invalid: 'xml' } })).toEqual('')

    expect(buildXML([
      { '?xml': [{ '#text': '' }], ':@': { '@_version': '1.0', '@_encoding': 'utf-8' } }
    ])).toEqual('<?xml version="1.0" encoding="utf-8"?>')

    expect(buildXML([
      { p: [{ '#text': 'The Brazilian crypto lending...' }, { p: [{ '#text': 'All 22, 000 customers of BlueBenx suddenly...' }] }] },
      { ul: [{ li: [{ a: [{ '#text': '"BlueBenx fires employees, halts funds withdrawal citing $32M hack"' }], ':@': { '@_href': 'https://cointelegraph.com/news/bluebenx-fires-employees-halts-funds-withdrawal-citing-32m-hack' } }, { '#text': ',' }, { i: [{ '#text': 'Cointelegraph' }] }] }] }
    ])).toEqual('<p>The Brazilian crypto lending...<p>All 22, 000 customers of BlueBenx suddenly...</p></p><ul><li><a href="https://cointelegraph.com/news/bluebenx-fires-employees-halts-funds-withdrawal-citing-32m-hack">&quot;BlueBenx fires employees, halts funds withdrawal citing $32M hack&quot;</a>,<i>Cointelegraph</i></li></ul>')
  })

  test('test getKeys()', () => {
    const keys = 3
    expect(getKeys({ some: 'object', with: 'different', keys })).toEqual(expect.arrayContaining(['some', 'with', 'keys']))
    expect(getKeys({ '?xml': [{ '#text': '' }], ':@': { '@_version': '1.0', '@_encoding': 'utf-8' } })).toEqual(expect.arrayContaining(['?xml']))
    expect(getKeys([{ '?xml': [{ '#text': '' }], ':@': { '@_version': '1.0', '@_encoding': 'utf-8' } }])).toEqual(expect.arrayContaining(['?xml']))
    expect(getKeys([{ keys }, { objects: 'with 1 key' }, { objects: 'duplicate' }, { also: 'with', multiple: 'keys ignored' }])).toEqual(expect.arrayContaining(['keys', 'objects', 'objects', 'also']))
  })

  test('test getFirstMatch()', () => {
    expect(getFirstMatch({ otherValue: 'ignored', feed: 'expected' }, 'feed')).toEqual('expected')
    expect(getFirstMatch([{ otherValue: 'ignored', feed: 'expected' }], 'feed')).toEqual('expected')
    expect(getFirstMatch([{ feed: 'expected' }, { feed: 'ignored' }], 'feed')).toEqual('expected')
    expect(getFirstMatch([{ notFeed: 'ignored' }, { alsoNotFeed: 'ignored' }], 'feed')).toBeUndefined()
    expect(getFirstMatch([{ feed: [], someAttribute: 'included' }, { alsoNotFeed: 'ignored' }], 'feed')).toMatchObject({ feed: [], someAttribute: 'included' })
    expect(() => getFirstMatch(undefined, 'feed')).toThrow()
    expect(() => getFirstMatch({ feed: 'ignored' }, undefined)).toThrow()
    expect(() => getFirstMatch(undefined, undefined)).toThrow()
  })

  test('test getAllMatches()', () => {
    expect(getAllMatches({ otherValue: 'ignored', feed: 'expected' }, 'feed')).toEqual('expected')
    expect(getAllMatches([{ otherValue: 'ignored', feed: 'expected' }], 'feed')).toEqual(['expected'])
    expect(getAllMatches([{ feed: 'expected' }, { feed: 'alsoExpected' }], 'feed')).toEqual(expect.arrayContaining(['expected', 'alsoExpected']))
    expect(getAllMatches([{ notFeed: 'ignored' }, { alsoNotFeed: 'ignored' }], 'feed')).toEqual([])
    expect(getAllMatches([{ feed: [], someAttribute: 'included' }, { alsoNotFeed: 'ignored' }], 'feed')).toEqual([{ feed: [], someAttribute: 'included' }])
    expect(() => getAllMatches(undefined, 'feed')).toThrow()
    expect(() => getAllMatches({ feed: 'ignored' }, undefined)).toThrow()
    expect(() => getAllMatches(undefined, undefined)).toThrow()
  })
})
