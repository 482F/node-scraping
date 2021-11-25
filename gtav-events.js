#!/usr/bin/env node

const puppeteer = require('puppeteer')

async function getScriptDirPath() {
  const fs = require('fs')
  const scriptPath = process.argv[1]
  const scriptRealPath = await new Promise((resolve) =>
    fs.realpath(scriptPath, (err, result) => resolve(result))
  )
  const path = require('path')
  const scriptDirPath = path.dirname(scriptRealPath)
  return scriptDirPath
}

function getJSON() {
  return JSON.parse(document.body.innerText)
}

function eventsToText(rawEvents) {
  const events = {}
  for (const { label, date } of rawEvents.map(eventToObj)) {
    if (!events[date]) {
      events[date] = []
    }
    events[date].push(label)
  }

  let result = ''
  for (const [date, labels] of Object.entries(events)) {
    result += date + '\n'
    for (const label of labels) {
      result += label + '\n'
    }
    result += '\n'
  }
  return result
}

function eventToObj(event) {
  const p = (num) => num.toString().padStart(2, '0')

  const sd = new Date(event.startDate)
  const ed = new Date(event.endDate)

  const label = event.headerText
  const date =
    `${p(sd.getFullYear())}/${p(sd.getMonth() + 1)}/${p(sd.getDate())}` +
    ' ～ ' +
    `${p(ed.getFullYear())}/${p(ed.getMonth() + 1)}/${p(ed.getDate())}`
  return {
    label,
    date,
  }
}

async function main() {
  const fs = require('fs').promises
  const scriptDir = await getScriptDirPath()
  const hashesTxt = `${scriptDir}/hashes.txt`
  const hashes = (await fs.readFile(hashesTxt, 'utf-8')).split('\n')

  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'ja-JP',
  })
  await page.setDefaultNavigationTimeout(1000 * 60 * 30)

  const eventsUrl = 'https://socialclub.rockstargames.com/events?gameId=GTAV'
  await page.goto(eventsUrl)

  await page.goto(
    'https://socialclub.rockstargames.com/events/eventlisting?pageId=1&gameId=GTAV'
  )
  const json = await page.evaluate(getJSON)

  const events = json.events.filter(
    (event) => !hashes.includes(event.urlHash) && event.isLive
  )

  if (events.length === 0) {
    process.exit(1)
  }

  console.log(eventsUrl + '\n')

  console.log(eventsToText(events))

  const newHashes = [...hashes, ...events.map((event) => event.urlHash)]
  await fs.writeFile(hashesTxt, newHashes.join('\n'))

  process.exit(0)
}

main()
