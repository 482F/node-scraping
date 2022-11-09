import fetch from 'node-fetch'
import JSON5 from 'json5'
import fs from 'node:fs/promises'
const info = JSON5.parse(await fs.readFile('./info.json5'))
import * as history from './history.js'

export default async function getPso2Thunderstorm(useHistory = true, dbName) {
  const baseUrl = 'https://api.twitter.com/2/tweets/search/recent'
  const query = {
    query: 'from:Pso2ngsB 異常気象通知',
    sort_order: 'recency',
    'user.fields': 'name,username',
    'tweet.fields': 'created_at',
    max_results: 10,
  }

  const url =
    baseUrl +
    '?' +
    Object.entries(query)
      .map((field) => field.join('='))
      .join('&')

  const token = info.twitterToken
  const headers = {
    Authorization: 'Bearer ' + token,
    'Content-Type': 'application/json',
  }

  const result = await fetch(url, { headers }).then((r) => r.json())
  const items = result.data.map((datum) => ({
    text:
      datum.created_at.match(/^\d{4}/)[0] +
      '/' +
      datum.text.match(/\d\d\/\d\d \d\d:\d\d/)[0] +
      ' 雷雨発生',
  }))

  const filteredItems = await (() => {
    if (useHistory) {
      return history.filterAndRegister(
        'pso2-thunderstorm',
        items,
        'text',
        dbName
      )
    }

    return items
  })()

  return {
    items: filteredItems,
    text: filteredItems.map(({ text }) => text).join('\n\n'),
  }
}
