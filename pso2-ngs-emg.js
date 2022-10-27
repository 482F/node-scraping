import fetch from 'node-fetch'
import JSON5 from 'json5'
import fs from 'node:fs/promises'
const info = JSON5.parse(await fs.readFile('./info.json5'))
import * as history from './history.js'

export default async function getPso2Emg(useHistory = true, dbName) {
  const baseUrl = 'https://api.twitter.com/2/tweets/search/recent'
  const query = {
    query: 'from:PSO2NGS_JP',
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

  const emgs = result.data.flatMap((datum) => {
    if (!datum.text.match(/^予告：『緊急クエスト』/)) return []
    const text = datum.text
      .replaceAll(/\n\n/g, '\n')
      .replaceAll(/^#.+$|^予告：『緊急クエスト』\n/gm, '')
    const date = new Date(datum.created_at)
    const df = (n) => n.toString().padStart(2, '0')
    const y = df(date.getFullYear())
    const mo = df(date.getMonth() + 1)
    const d = df(date.getDate())
    return {
      text,
      dateText: `${y}/${mo}/${d} ${text}`,
    }
  })

  const filteredEmgs = await (() => {
    if (useHistory) {
      return history.filterAndRegister('pso2-ngs-emgs', emgs, 'dateText', dbName)
    }

    return emgs
  })()

  return {
    items: filteredEmgs,
    text: filteredEmgs.map(({ text }) => text).join('\n'),
  }
}
