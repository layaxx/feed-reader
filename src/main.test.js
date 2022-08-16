// main.test
/* eslint-env jest */

import { readFileSync } from 'fs'
import nock from 'nock'
import { hasProperty } from 'bellajs'

import { read, getReaderOptions, setReaderOptions, parseString } from './main.js'

const feedAttrs = 'title link description generator language published entries'.split(' ')
const entryAttrs = 'title link description published'.split(' ')

const defaultReaderOptions = getReaderOptions()

const parseUrl = (url) => {
  const re = new URL(url)
  return {
    baseUrl: `${re.protocol}//${re.host}`,
    path: re.pathname
  }
}

afterEach(() => {
  setReaderOptions(defaultReaderOptions)
})

describe('test read() function with common issues', () => {
  test('read feed from a non-string link', () => {
    expect(read([])).rejects.toThrow(new Error('Input param must be a valid URL'))
  })

  test('read feed from a 404 link', () => {
    const url = 'https://somewhere.xyz/alpha/beta'
    const { baseUrl, path } = parseUrl(url)
    nock(baseUrl).get(path).reply(404)
    expect(read(url)).rejects.toThrow(new Error('AxiosError: Request failed with status code 404'))
  })

  test('read feed from empty xml', () => {
    const url = 'https://empty-source.elsewhere/rss'
    const { baseUrl, path } = parseUrl(url)
    nock(baseUrl).get(path).reply(200, '', {
      'Content-Type': 'application/xml'
    })
    expect(read(url)).rejects.toThrow(new Error(`Failed to load content from "${url}"`))
  })

  test('read feed from invalid xml', async () => {
    const url = 'https://averybad-source.elsewhere/rss'
    const xml = '<?xml version="1.0" encoding="UTF-8><noop><oops></ooops>'
    const { baseUrl, path } = parseUrl(url)
    nock(baseUrl).get(path).reply(200, xml, {
      'Content-Type': 'application/xml'
    })
    expect(read(url)).rejects.toThrow(new Error('The XML document is not well-formed'))
  })
})

describe('test read() standard feed', () => {
  test('read rss feed from Google', async () => {
    const url = 'https://some-news-page.tld/rss'
    const xml = readFileSync('test-data/rss-feed-standard-realworld.xml', 'utf8')
    const { baseUrl, path } = parseUrl(url)
    nock(baseUrl).get(path).reply(200, xml, {
      'Content-Type': 'application/xml'
    })
    const result = await read(url)
    feedAttrs.forEach((k) => {
      expect(hasProperty(result, k)).toBe(true)
    })
    entryAttrs.forEach((k) => {
      expect(hasProperty(result.entries[0], k)).toBe(true)
    })
  })

  test('read atom feed from Google', async () => {
    const url = 'https://some-news-page.tld/atom'
    const xml = readFileSync('test-data/atom-feed-standard-realworld.xml', 'utf8')
    const { baseUrl, path } = parseUrl(url)
    nock(baseUrl).get(path).reply(200, xml, {
      'Content-Type': 'application/xml'
    })
    const result = await read(url)
    feedAttrs.forEach((k) => {
      expect(hasProperty(result, k)).toBe(true)
    })
    entryAttrs.forEach((k) => {
      expect(hasProperty(result.entries[0], k)).toBe(true)
    })
  })

  test('read atom feed which contains multi links', async () => {
    const url = 'https://some-news-page.tld/atom/multilinks'
    const xml = readFileSync('test-data/atom-multilinks.xml', 'utf8')
    const { baseUrl, path } = parseUrl(url)
    nock(baseUrl).get(path).reply(200, xml, {
      'Content-Type': 'application/xml'
    })
    const result = await read(url)
    feedAttrs.forEach((k) => {
      expect(hasProperty(result, k)).toBe(true)
    })
    entryAttrs.forEach((k) => {
      expect(hasProperty(result.entries[0], k)).toBe(true)
    })
  })

  test('read json feed from Micro.blog', async () => {
    const url = 'https://some-news-page.tld/json'
    const json = readFileSync('test-data/json-feed-standard-realworld.json', 'utf8')
    const { baseUrl, path } = parseUrl(url)
    nock(baseUrl).get(path).reply(200, json, {
      'Content-Type': 'application/json'
    })
    const result = await read(url)
    feedAttrs.forEach((k) => {
      expect(hasProperty(result, k)).toBe(true)
    })
    entryAttrs.forEach((k) => {
      expect(hasProperty(result.entries[0], k)).toBe(true)
    })
  })
})

describe('test read() standard feed full content', () => {
  beforeEach(() => setReaderOptions({ includeFullContent: true }))
  const newEntryAttrs = [...entryAttrs, 'content']

  test('read rss feed from Google', async () => {
    const url = 'https://some-news-page.tld/rss'
    const xml = readFileSync('test-data/rss-feed-standard-realworld.xml', 'utf8')
    const { baseUrl, path } = parseUrl(url)
    nock(baseUrl).get(path).reply(200, xml, {
      'Content-Type': 'application/xml'
    })
    const result = await read(url)
    feedAttrs.forEach((k) => {
      expect(hasProperty(result, k)).toBe(true)
    })
    newEntryAttrs.forEach((k) => {
      expect(hasProperty(result.entries[0], k)).toBe(true)
    })
    expect(result.entries[0].content).toBeTruthy()
  })

  test('read atom feed', async () => {
    const url = 'https://some-news-page.tld/atom'
    const xml = readFileSync('test-data/atom-feed-standard.xml', 'utf8')
    const { baseUrl, path } = parseUrl(url)
    nock(baseUrl).get(path).reply(200, xml, {
      'Content-Type': 'application/xml'
    })
    const result = await read(url)
    feedAttrs.forEach((k) => {
      expect(hasProperty(result, k)).toBe(true)
    })
    newEntryAttrs.forEach((k) => {
      expect(hasProperty(result.entries[0], k)).toBe(true)
    })
    expect(result.entries[0].content).toBeTruthy()
  })

  test('read atom feed from Google', async () => {
    const url = 'https://some-news-page.tld/atom'
    const xml = readFileSync('test-data/atom-feed-standard-realworld.xml', 'utf8')
    const { baseUrl, path } = parseUrl(url)
    nock(baseUrl).get(path).reply(200, xml, {
      'Content-Type': 'application/xml'
    })
    const result = await read(url)
    feedAttrs.forEach((k) => {
      expect(hasProperty(result, k)).toBe(true)
    })
    newEntryAttrs.forEach((k) => {
      expect(hasProperty(result.entries[0], k)).toBe(true)
    })
    expect(result.entries[0].content).toBeTruthy()
  })

  test('read json feed from Micro.blog', async () => {
    const url = 'https://some-news-page.tld/json'
    const json = readFileSync('test-data/json-feed-standard-realworld.json', 'utf8')
    const { baseUrl, path } = parseUrl(url)
    nock(baseUrl).get(path).reply(200, json, {
      'Content-Type': 'application/json'
    })
    const result = await read(url)
    feedAttrs.forEach((k) => {
      expect(hasProperty(result, k)).toBe(true)
    })
    newEntryAttrs.forEach((k) => {
      expect(hasProperty(result.entries[0], k)).toBe(true)
    })
    expect(result.entries[0].content).toBeTruthy()
  })
})

describe('additional real world tests', () => {
  describe('Atom feed', () => {
    const url = 'test-data/atom-realworld.xml'

    test('only standard values', () => {
      const xml = readFileSync(url, 'utf8')
      const result = parseString(xml)

      const expectedKeys = ['id', 'title', 'link', 'description', 'generator', 'language', 'published', 'entries']
      expect(Object.keys(result)).toEqual(expect.arrayContaining(expectedKeys))
      expect(Object.keys(result).length).toBe(expectedKeys.length)

      expect(result.id).toEqual('https://web3isgoinggreat.com/feed.xml')
      expect(result.title).toEqual('Web3 is going just great')
      expect(result.link).toEqual('https://web3isgoinggreat.com/feed.xml')
      expect(result.description).toEqual('')
      expect(result.generator).toEqual('')
      expect(result.language).toEqual('')
      expect(result.published).toEqual('2022-08-14T15:06:36.316Z')
      expect(result.entries.length).toBe(2)

      result.entries.forEach(entry => {
        const expectedEntryKeys = ['title', 'link', 'published', 'description']
        expect(Object.keys(entry)).toEqual(expect.arrayContaining(expectedEntryKeys))
        expect(Object.keys(entry).length).toBe(expectedEntryKeys.length)
      })

      expect(result.entries[0].title).toEqual('Brazilian crypto lender BlueBenx halts customer withdrawals and lays off employees after $32 million "hack"')
      expect(result.entries[0].link).toEqual('https://web3isgoinggreat.com/single/brazilian-crypto-lender-bluebenx-halts-customer-withdrawals-and-lays-off-employees-after-32-million-hack')
      expect(result.entries[0].published).toEqual('2022-08-14T15:03:00.230Z')
      expect(result.entries[0].description).toBeTruthy()
      expect(result.entries[0].description.length).toBe(211)

      expect(result.entries[1].title).toEqual('Misconfiguration in the Acala stablecoin project allows attacker to steal 1.2 billion aUSD')
      expect(result.entries[1].link).toEqual('https://web3isgoinggreat.com/single/misconfiguration-in-the-acala-stablecoin-project-allows-attacker-to-steal-1-2-billion-ausd')
      expect(result.entries[1].published).toEqual('2022-08-14T15:06:19.264Z')
      expect(result.entries[1].description).toBeTruthy()
      expect(result.entries[1].description.length).toBe(210)
    })

    test('all values', () => {
      setReaderOptions({ includeFullContent: true })

      const xml = readFileSync(url, 'utf8')
      const result = parseString(xml)

      const expectedKeys = [
        'id', 'title',
        'link', 'description',
        'generator', 'language',
        'published', 'entries',
        'author', 'icon',
        'cover', 'accentColor',
        'category', 'rights'
      ]
      expect(Object.keys(result)).toEqual(expect.arrayContaining(expectedKeys))
      expect(Object.keys(result).length).toBe(expectedKeys.length)

      expect(result).toMatchObject({
        author: {
          email: 'molly.white5@gmail.com',
          name: 'Molly White',
          uri: 'https://www.mollywhite.net'
        },
        icon: 'https://web3isgoinggreat.com/favicon-32x32.png',
        cover: 'https://storage.googleapis.com/primary-web3/entryImages/monkey-og.png',
        accentColor: '5948a4',
        category: 'technology',
        rights: 'CC-BY-SA 3.0'
      })

      result.entries.forEach(entry => {
        const expectedEntryKeys = ['title', 'link', 'published', 'description', 'content']
        expect(Object.keys(entry)).toEqual(expect.arrayContaining(expectedEntryKeys))
        expect(Object.keys(entry).length).toBe(expectedEntryKeys.length)
      })
    })
  })

  describe('RSS feed', () => {
    const url = 'test-data/rss-realworld.xml'

    test('only standard values', () => {
      const xml = readFileSync(url, 'utf8')
      const result = parseString(xml)

      const expectedKeys = ['title', 'link', 'description', 'generator', 'language', 'published', 'entries']
      expect(Object.keys(result)).toEqual(expect.arrayContaining(expectedKeys))
      expect(Object.keys(result).length).toBe(expectedKeys.length)

      expect(result.title).toEqual('Fefes Blog')
      expect(result.link).toEqual('https://blog.fefe.de/')
      expect(result.description).toEqual('Verschwörungen und Obskures aus aller Welt')
      expect(result.generator).toEqual('')
      expect(result.language).toEqual('de')
      expect(result.published).toEqual('')
      expect(result.entries.length).toBe(1)

      result.entries.forEach(entry => {
        const expectedEntryKeys = ['title', 'link', 'published', 'description', 'guid']
        expect(Object.keys(entry)).toEqual(expect.arrayContaining(expectedEntryKeys))
        expect(Object.keys(entry).length).toBe(expectedEntryKeys.length)
      })

      expect(result.entries[0].title).toEqual('Hier ist ausnahmsweise mal eine Packung gute Laune: ...')
      expect(result.entries[0].link).toEqual('https://blog.fefe.de/?ts=9c08eaef')
      expect(result.entries[0].published).toEqual('')
      expect(result.entries[0].description).toBeTruthy()
      expect(result.entries[0].description.length).toBe(209)
    })

    test('all values', () => {
      setReaderOptions({ includeFullContent: true })

      const xml = readFileSync(url, 'utf8')
      const result = parseString(xml)

      const expectedKeys = ['title', 'link', 'description', 'generator', 'language', 'published', 'entries']
      expect(Object.keys(result)).toEqual(expect.arrayContaining(expectedKeys))
      expect(Object.keys(result).length).toBe(expectedKeys.length)

      result.entries.forEach(entry => {
        const expectedEntryKeys = ['title', 'link', 'published', 'description', 'guid', 'content']
        expect(Object.keys(entry)).toEqual(expect.arrayContaining(expectedEntryKeys))
        expect(Object.keys(entry).length).toBe(expectedEntryKeys.length)
      })
    })
  })

  describe('Substack feed', () => {
    const url = 'test-data/substack.xml'

    test('only standard values', () => {
      const xml = readFileSync(url, 'utf8')
      const result = parseString(xml)

      const expectedKeys = ['title', 'link', 'description', 'language', 'generator', 'published', 'entries']
      expect(Object.keys(result)).toEqual(expect.arrayContaining(expectedKeys))
      expect(Object.keys(result).length).toBe(expectedKeys.length)

      expect(result.title).toEqual('Astral Codex Ten')
      expect(result.link).toEqual('https://astralcodexten.substack.com/')
      expect(result.description).toEqual('P(A|B) = [P(A)*P(B|A)]/P(B), all the rest is commentary.')
      expect(result.generator).toEqual('Substack')
      expect(result.language).toEqual('en')
      expect(result.published).toEqual('2022-08-15T16:06:34.000Z')
      expect(result.entries.length).toBe(2)

      result.entries.forEach(entry => {
        const expectedEntryKeys = ['title', 'link', 'published', 'description', 'guid']
        expect(Object.keys(entry)).toEqual(expect.arrayContaining(expectedEntryKeys))
        expect(Object.keys(entry).length).toBe(expectedEntryKeys.length)
      })

      expect(result.entries[0].title).toEqual('Open Thread 237')
      expect(result.entries[0].link).toEqual('https://astralcodexten.substack.com/p/open-thread-237')
      expect(result.entries[0].published).toEqual('2022-08-14T22:35:35.000Z')
      expect(result.entries[0].description).toBeTruthy()
      expect(result.entries[0].description.length).toBe(210)

      expect(result.entries[1].title).toEqual('Your Book Review: God Emperor Of Dune')
      expect(result.entries[1].link).toEqual('https://astralcodexten.substack.com/p/your-book-review-god-emperor-of-dune')
      expect(result.entries[1].published).toEqual('2022-08-13T00:15:22.000Z')
      expect(result.entries[1].description).toBeTruthy()
      expect(result.entries[1].description.length).toBe(9)
    })

    test('all values', () => {
      setReaderOptions({ includeFullContent: true })

      const xml = readFileSync(url, 'utf8')
      const result = parseString(xml)

      const expectedKeys = [
        'title', 'link',
        'description', 'language',
        'generator', 'published',
        'entries', 'image',
        'copyright', 'webMaster',
        'owner', 'author',
        'email'
      ]

      expect(Object.keys(result)).toEqual(expect.arrayContaining(expectedKeys))
      expect(Object.keys(result).length).toBe(expectedKeys.length)

      expect(result).toMatchObject({
        image: {
          link: 'https://astralcodexten.substack.com',
          title: 'Astral Codex Ten',
          url: 'https://substackcdn.com/image/fetch/w_256,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2F430241cb-ade5-4316-b1c9-6e3fe6e63e5e_256x256.png'
        },
        copyright: 'Scott Alexander',
        webMaster: 'astralcodexten@substack.com',
        owner:
          [
            {
              email: 'astralcodexten@substack.com',
              name: 'Scott Alexander'
            },
            'astralcodexten@substack.com'
          ],
        author: 'Scott Alexander',
        email: 'astralcodexten@substack.com'
      })

      result.entries.forEach(entry => {
        const expectedEntryKeys = [
          'title',
          'link',
          'published',
          'description',
          'guid',
          'content',
          'creator',
          'enclosure'
        ]
        expect(Object.keys(entry)).toEqual(expect.arrayContaining(expectedEntryKeys))
        expect(Object.keys(entry).length).toBe(expectedEntryKeys.length)
      })
    })
  })
})
