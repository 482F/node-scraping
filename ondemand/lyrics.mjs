import iconv from 'iconv-lite'
import fetch from 'node-fetch'
import jsdom from 'jsdom'
const { JSDOM } = jsdom

function formatLyric(rawLyric) {
  return (rawLyric ?? '')
    .replaceAll(/\n+/g, '\n')
    .replaceAll(/^\s+|\s+$/g, '')
    .replaceAll(/　/g, ' ')
}

async function google(query) {
  return await fetch(
    `https://www.google.com/search?q=${query.replaceAll(' ', '+')}`,
    {
      headers: {
        'accept-language': 'ja,en-US;q=0.9,en;q=0.8',
      },
    }
  )
    .then((r) => r.arrayBuffer())
    .then((arr) => iconv.decode(Buffer.from(arr), 'shift_jis'))
}

const domainFuncs = {
  'www.uta-net.com': async (document) => {
    return (
      document.getElementById('kashi_area') ??
      document.querySelector('div.row.kashi > div > h2')?.nextElementSibling
    )?.innerHTML
      .replaceAll('<br>', '\n')
      .replaceAll(/\n+/g, '\n')
  },
  'utaten.com': async (document) => {
    const lyrics = Array.from(document.querySelector('.hiragana').childNodes)
    return lyrics
      .map((node) => {
        if (node.nodeName === '#text') {
          return node.textContent
        } else if (node.nodeName === 'SPAN') {
          return node.children[0].textContent
        }
        return ''
      })
      .reduce((all, part) => all + part, '')
  },
  'j-lyric.net': async (document) => {
    return document.getElementById('Lyric').innerHTML.replaceAll('<br>', '\n')
  },
  'www.utamap.com': async (document) => {
    return document
      .querySelector('td.noprint.kasi_honbun')
      .innerHTML.replaceAll('<br>', '\n')
      .replaceAll('<!-- 歌詞 end -->', '')
  },
  'www.google.com': (document) => {
    const lyricEl = [...document.querySelectorAll('div')].find(
      (e) => e.children.length === 1 && e.textContent.match(/^\n*提供元:/)
    )?.parentElement?.parentElement?.previousElementSibling
    if (!lyricEl) return

    return lyricEl.textContent
  },
}
const domains = Object.keys(domainFuncs)

export default async function getLyricSites(title, artist) {
  const googleResult = await google(`${title}+${artist ?? ''}+歌詞`)
  const document = new JSDOM(googleResult).window.document

  return [
    {
      title: `${title}${artist ? ' ' + artist : ''} - Google`,
      async getLyric() {
        return formatLyric(await domainFuncs['www.google.com'](document))
      },
    },
    ...[...document.querySelectorAll('a[href]')]
      .filter((el) => el.href.match(/^\/url\?q=http/))
      .map((el) => {
        const [href, domain] = el.href.match(/https?:\/\/([^\/]+)\/[^&]+/) ?? []
        return [el, decodeURIComponent(href), domain]
      })
      .filter(([, , domain]) =>
        domains.some((someDomain) => domain === someDomain)
      )
      .map(([el, href, domain]) => ({
        title: el.querySelector('h3')?.textContent,
        async getLyric() {
          const domainFunc = domainFuncs[domain]
          if (!domainFunc) {
            return
          }

          const rawHtml = await fetch(href).then((r) => r.text())
          const document = new JSDOM(rawHtml).window.document
          return formatLyric(await domainFunc(document, href))
        },
      })),
  ]
}
