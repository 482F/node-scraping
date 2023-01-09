import { describe, expect, test } from 'vitest'
import getGtavEvents from './gtav-events.js'
import * as history from './history.js'

describe('gtav-events', () => {
  test('main', async () => {
    const dbName = 'gtav-events-test'

    const data = await getGtavEvents(false, dbName)
    expect(data.items.length).not.toBe(0)
    expect(data.text).toBeTruthy()

    const registeredData = await getGtavEvents(true, dbName)
    expect(registeredData.items.length).not.toBe(0)
    expect(registeredData.text).toBeTruthy()

    const filteredData = await getGtavEvents(true, dbName)
    expect(filteredData.items.length).toBe(0)
    expect(filteredData.text).toBeFalsy()

    await history.deleteDb(dbName)
  }, 1000 * 60 * 5)
})

