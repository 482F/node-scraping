import fetch from 'node-fetch'
import JSON5 from 'json5'
import * as history from './history.js'

function toText(item) {
  const title = item.title
  const url = item.watchUrl

  const date = new Date(item.startTime)
  const p = (num) => num.toString().padStart(2, '0')
  const y = p(date.getFullYear())
  const mo = p(date.getMonth() + 1)
  const d = p(date.getDate())
  const h = p(date.getHours())
  const mi = p(date.getMinutes())
  const s = p(date.getSeconds())
  const dateStr = `${y}/${mo}/${d} ${h}:${mi}:${s}`

  return title + '\n' + url + '\n' + dateStr
}

export default async function getNiconicoIkkyo(useHistory = true, dbName) {
  const result = await fetch(
    'https://anime.nicovideo.jp/live/reserved-ikkyo.html?from=nanime_live-reserved_list'
  ).then((r) => r.text())
  const list = JSON5.parse(
    result
      .match(/window\.TKTK\['live_reserved_ikkyo'\][\s\S]+](?=;)/)[0]
      .replace(/window\.TKTK\['live_reserved_ikkyo'\] = /, '')
      .replaceAll(/(?<=:)[^:(]+\((['"][\s\S]+?['"])\)(?=,)/g, '$1')
      .replaceAll(';', '')
  )
  const formattedList = list.map(toText).map((text) => ({ text }))

  const filteredItems = await (() => {
    if (useHistory) {
      return history.filterAndRegister(
        'niconico-ikkyo',
        formattedList,
        'text',
        dbName
      )
    }

    return formattedList
  })()

  return {
    items: filteredItems,
    text: filteredItems.map(({ text }) => text).join('\n\n'),
  }
}
