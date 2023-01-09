import fetch from 'node-fetch'
import jsdom from 'jsdom'
const { JSDOM } = jsdom
import * as history from './history.js'

export default async function getPso2News(useHistory = true, dbName) {
  const rawHtml = await fetch('https://pso2.jp/players/news/').then((r) =>
    r.text()
  )
  const dom = new JSDOM(rawHtml)
  const topics = [
    ...dom.window.document.querySelectorAll('.topicList li > a'),
  ].map((el) => ({
    text:
      el.textContent.replaceAll(/\t|^\n/g, '').replaceAll(/^NEW\n|\n+$/g, '') +
      '\n' +
      el.href,
  }))

  const filteredTopics = await (() => {
    if (useHistory) {
      return history.filterAndRegister('pso2-news', topics, 'text', dbName)
    }

    return topics
  })()

  return {
    items: filteredTopics,
    text: filteredTopics.map(({ text }) => text).join('\n\n'),
  }
}
