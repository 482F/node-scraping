import fetch from 'node-fetch'
import * as history from './history.js'

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
  return 'https://socialclub.rockstargames.com/events?gameId=GTAV\n\n' + result
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

export default async function getGtavEvents(useHistory = true, dbName) {
  const { events } = await fetch(
    'https://socialclub.rockstargames.com/events/eventlisting?pageId=1&gameId=GTAV',
    {
      headers: {
        'accept-language': 'ja,en-US;q=0.9,en;q=0.8',
        cookie: 'AutoLoginCheck=1',
      },
    }
  ).then((r) => r.json())

  events.forEach(
    (event) => (event.dateAndDesc = event.startDate + event.description)
  )

  const filteredEvents = await (() => {
    if (useHistory) {
      return history.filterAndRegister(
        'gtav-events',
        events,
        'dateAndDesc',
        dbName
      )
    }

    return events
  })()

  return { items: filteredEvents, text: eventsToText(filteredEvents) }
}
