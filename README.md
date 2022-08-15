# feed-reader

To read & normalize RSS/ATOM/JSON feed data.

[![NPM](https://badge.fury.io/js/feed-reader.svg)](https://badge.fury.io/js/feed-reader)
![CI test](https://github.com/ndaidong/feed-reader/workflows/ci-test/badge.svg)
[![Coverage Status](https://img.shields.io/coveralls/github/ndaidong/feed-reader)](https://coveralls.io/github/ndaidong/feed-reader?branch=main)
![CodeQL](https://github.com/ndaidong/feed-reader/workflows/CodeQL/badge.svg)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Demo

- [Give it a try!](https://demos.pwshub.com/feed-reader)
- [Example FaaS](https://extractor.pwshub.com/feed/parse?url=https://news.google.com/rss&apikey=demo-TEyRycuuMCiGBiBocbLGSpagfj7gOF8AMyAWfEgP)

### Usage

```js
import { read } from 'feed-reader'

// with CommonJS environments
// const { read } = require('./dist/cjs/feed-reader.js')

const url = 'https://news.google.com/rss'

read(url).then((feed) => {
  console.log(feed)
}).catch((err) => {
  console.log(err)
})
```

## APIs

- [.read(String url)](#readstring-url)
- [Configuration methods](#configuration-methods)

### `read(String url)`

Load and extract feed data from given RSS/ATOM/JSON source. Return a Promise object.

Example:

```js
import {
  read
} from 'feed-reader'

const getFeedData = async (url) => {
  try {
    console.log(`Get feed data from ${url}`)
    const result = await read(url)
    // result may be feed data or null
    console.log(result)
    return result
  } catch (err) {
    console.trace(err)
  }
}

getFeedData('https://news.google.com/rss')
getFeedData('https://news.google.com/atom')
getFeedData('https://adactio.com/journal/feed.json')
```

Feed data object returned by `read()` method should look like below:

```json
{
  "title": "Top stories - Google News",
  "link": "https://news.google.com/atom?hl=en-US&gl=US&ceid=US%3Aen",
  "description": "Google News",
  "generator": "NFE/5.0",
  "language": "",
  "published": "2021-12-23T15:01:12.000Z",
  "entries": [
    {
      "title": "Lone suspect in Waukesha parade crash to appear in court today, as Wisconsin reels from tragedy that left 5 dead and dozens more injured - CNN",
      "link": "https://news.google.com/__i/rss/rd/articles/CBMiTmh0dHBzOi8vd3d3LmNubi5jb20vMjAyMS8xMS8yMy91cy93YXVrZXNoYS1jYXItcGFyYWRlLWNyb3dkLXR1ZXNkYXkvaW5kZXguaHRtbNIBUmh0dHBzOi8vYW1wLmNubi5jb20vY25uLzIwMjEvMTEvMjMvdXMvd2F1a2VzaGEtY2FyLXBhcmFkZS1jcm93ZC10dWVzZGF5L2luZGV4Lmh0bWw?oc=5",
      "description": "Lone suspect in Waukesha parade crash to appear in court today, as Wisconsin reels from tragedy that left 5 dead and dozens more injured &nbsp;&nbsp; CNN Waukesha Christmas parade attack: 5 dead, 48 injured, Darrell Brooks named as...",
      "published": "2021-12-21T22:30:00.000Z"
    },
    // ...
  ]
}
```

### `parseString(String string)`

Extract feed data from given XML string, which may have been locally generated or previously fetched. Synchronously returns the parsed Feed. This method is internally used by the `read` method.

Example:

```js
import {
  parseString
} from 'feed-reader'

const xml = `<?xml version="1.0" encoding="utf-8" ?>
<feed xmlns="http://www.w3.org/2005/Atom" xmlns:webfeeds="http://webfeeds.org/rss/1.0">
  <id>https://web3isgoinggreat.com/feed.xml</id>
  <title type="html">Web3 is going just great</title>
  <author>
    <name>Molly White</name>
    <email>molly.white5@gmail.com</email>
    <uri>https://www.mollywhite.net</uri>
  </author>
  <link rel="self" href="https://web3isgoinggreat.com/feed.xml" />
  <link rel="alternate" href="https://web3isgoinggreat.com" />
  <rights type="html">CC-BY-SA 3.0</rights>
  <updated>2022-08-14T15:06:36.316Z</updated>
  <entry>
    <title type="html">Brazilian crypto lender BlueBenx halts customer withdrawals and lays off employees after $32 million &#34;hack&#34;</title>
    <published>2022-08-14T14:59:53.897Z</published>
    <updated>2022-08-14T15:03:00.230Z</updated>
    <link href="https://web3isgoinggreat.com/single/brazilian-crypto-lender-bluebenx-halts-customer-withdrawals-and-lays-off-employees-after-32-million-hack"/> 
    <id>https://web3isgoinggreat.com/single/brazilian-crypto-lender-bluebenx-halts-customer-withdrawals-and-lays-off-employees-after-32-million-hack</id>
    <content type="xhtml">
      <div xmlns="http://www.w3.org/1999/xhtml">
        <img
          src="https://storage.googleapis.com/primary-web3/entryImages/logos/resized/bluebenx_300.webp" ...
        />
        <p>The Brazilian crypto lending platform BlueBenx suddenly shut its doors after announcing they had suffered an "extremely aggressive" hack of 160 million BRL (US$32 million). [...] 
        </p>
      </div>
    </content>
  </entry>  
</feed>`
const parsedFeed = parseString(xml)

console.log(parsedFeed)
```

Feed data object returned by `parseString()` method should (also) look like this:

```json
{
  "title": "Web3 is going just great",
  "link": "https://web3isgoinggreat.com/feed.xml",
  "description": "",
  "language": "",
  "generator": "",
  "published": "2022-08-14T15:06:36.316Z",
  "entries": [
    {
      "title": "Brazilian crypto lender BlueBenx halts customer withdrawals and lays off employees after $32 million \"hack\"",
      "link": "https://web3isgoinggreat.com/single/brazilian-crypto-lender-bluebenx-halts-customer-withdrawals-and-lays-off-employees-after-32-million-hack",
      "published": "2022-08-14T15:03:00.230Z",
      "description": "<img src=\"https://storage.googleapis.com/primary-web3/entryImages/logos/resized/bluebenx_300.webp\" alt=\"Text \"BlueBenx\" in bright blue, followed by a blue diagonal line with a blue line spiraling around it\"..."
    }
  ]
}
```

### Configuration methods

#### `setRequestOptions(Object requestOptions)`

Affects the way `axios` works. Please refer [axios' request config](https://axios-http.com/docs/req_config) for more info.

#### `getRequestOptions()`

Return current request options.

Default values can be found [here](https://github.com/ndaidong/feed-reader/blob/main/src/config.js#L5).

#### `setReaderOptions(Object readerOptions)`

Change reader options.

#### `getReaderOptions()`

Return current reader options.

Default values:

- `descriptionMaxLen`: Number, max num of chars for description (default: `210`)
- `includeFullContent`: Boolean, add `content` and to entry if available, also add any other values to feed and feed entries that are not included by default, such as `author`, `ttl`, etc. Note that those may still be in xml format if they are complex types (default: `false`)
- `convertPubDateToISO`: Boolean, reformat published date to [ISO standard](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString) (default: `true`)

#### `setParserOptions(Object parserOptions)`

Change parser options.

- use any options from [fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser)

#### `getParserOptions()`

Return current parser options.

Default values:

- `ignoreAttributes`: boolean, see [fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser) (default `false`)
- `preserveOrder`: boolean, see [fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser)  (default `true`)
  - changing this may break functionality, use at own risk
- `removeNSPrefix`: boolean, see [fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser) (default `true`)


## Test

```bash
git clone https://github.com/ndaidong/feed-reader.git
cd feed-reader
npm install

# quick evaluation
npm run eval https://news.google.com/rss
npm test
```

## License

The MIT License (MIT)

---
