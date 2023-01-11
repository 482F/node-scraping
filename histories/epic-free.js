import fetch from 'node-fetch'
import jsdom from 'jsdom'
const { JSDOM } = jsdom
import * as history from './history.js'

export default async function getEpicFree(useHistory = true, dbName) {
  const rawHtml = await fetch('https://nogameb.com/archives/post-25456.html').then((r) => r.text())
  const dom = new JSDOM(rawHtml)
  const rows = [...dom.window.document.querySelectorAll('tr')]
  let year = null
  const items = []
  for (const row of rows) {
    if (row.firstChild.align) {
      year = row.firstChild.textContent
    }

    const dateStr = row.firstChild.textContent
    const games = [...row.children[1].querySelectorAll('a')]
    items.push(
      ...games.map((game) => {
        const text = `${dateStr} ${game.textContent}: ${game.href}`
        return {
          text,
          dateText: year + text,
        }
    })
    )
  }

  const filteredItems = await (() => {
    if (useHistory) {
      return history.filterAndRegister('epic-free', items, 'dateText', dbName)
    }

    return items
  })()

  return {
    items: filteredItems,
    text: filteredItems.map(({ text }) => text).join('\n'),
  }
}
