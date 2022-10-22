import fetch from 'node-fetch'
import JSON5 from 'json5'
import fs from 'node:fs/promises'
const info = JSON5.parse(await fs.readFile('./info.json5'))
import * as history from './history.js'

export default async function getPso2Emg(useHistory = true, dbName) {
  const baseUrl = 'https://api.twitter.com/2/tweets/search/recent'
  const query = {
    query: 'from:pso2_emg_hour',
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

  const emgs = result.data
    .flatMap((datum) => {
      const text = datum.text.replaceAll(
        /^.....緊急クエスト予告.\n|.#PSO2$/g,
        ''
      )
      const rows = text.split('\n')
      return rows.map((row) => {
        const date = new Date(datum.created_at)
        if (row.match(/^00/)) {
          date.setDate(date.getDate() + 1)
        }

        const df = (n) => n.toString().padStart(2, '0')
        return {
          text: row,
          dateText: datum.created_at + row,
        }
      })
    })
    .filter((datum) => !datum.text.match(/開催中|\(\d+時/))

  const filteredEmgs = await (() => {
    if (useHistory) {
      return history.filterAndRegister('pso2-emgs', emgs, 'dateText', dbName)
    }

    return emgs
  })()

  return {
    items: filteredEmgs,
    text: filteredEmgs.map(({ text }) => text).join('\n'),
  }
}
