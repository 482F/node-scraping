import fetch from 'node-fetch'
import jsdom from 'jsdom'
const { JSDOM } = jsdom
import * as history from './history.js'

export default async function getPso2WikiZatsudan(useHistory = true, dbName) {
  async function getValue(domain) {
    const recentBody = await fetch(
      `https://${domain}/index.php?雑談掲示板`
    ).then((r) => r.text())

    const vol = recentBody.match(/雑談掲示板Vol(\d+)/)[1]

    const url = `https://${domain}/index.php?Comments%2F雑談掲示板Vol${vol}`

    const rawHtml = await fetch(
      `https://${domain}/index.php?cmd=edit&page=Comments%2F雑談掲示板Vol${vol}`
    ).then((r) => r.text())
    const dom = new JSDOM(rawHtml)
    const document = dom.window.document
    return document.querySelector('textarea#msg').value.replace(/^[^-]+/, '')
  }

  const value = await Promise.all(
    ['pso2.swiki.jp', 'pso2ngs.swiki.jp'].map(getValue)
  ).then((values) => values.join('\n'))
  const comments = []
  const parents = [null, { children: comments }]
  const lines = value.split('\n').map((line) => line.replace(/^\/\//, ''))
  for (const line of lines) {
    const depth = line.match(/^-+/)?.[0].length ?? 0
    if (depth <= 0) {
      const lastComment = comments.at(-1)
      if (!lastComment) continue
      lastComment.body += ' ' + line
      continue
    }
    const comment = {
      body: line
        .replace(/^-+/, '')
        .replace(/ --  &new{\d+-\d+-\d+ \(.\) \d+:\d+:\d+};$/, ''),
      children: [],
    }
    parents[depth].children.push(comment)
    parents[depth + 1] = comment
  }

  function processComment(comment, indent) {
    return (
      indent +
      '- ' +
      comment.body +
      '\n' +
      comment.children
        .map((child) => processComment(child, indent + '  '))
        .join('\n')
    ).replaceAll(/\n+/g, '\n')
  }

  const items = comments
    .map((comment) => processComment(comment, ''))
    .map((comment) => ({ text: comment }))

  const filteredItems = await (() => {
    if (useHistory) {
      return history.filterAndRegister(
        'pso2-wiki-zatsudan',
        items,
        'text',
        dbName
      )
    }

    return items
  })()

  return {
    items: filteredItems,
    text: filteredItems.map(({ text }) => text).join('\n'),
  }
}
