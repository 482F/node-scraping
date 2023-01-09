import { describe, expect, test } from 'vitest'
import get from './epic-free.js'
import * as history from './history.js'

describe('epic-free', () => {
  test('main', async () => {
    const dbName = 'epic-free-test'

    const data = await get(false, dbName)
    expect(data.items.length).not.toBe(0)
    expect(data.text).toBeTruthy()

    const registeredData = await get(true, dbName)
    expect(registeredData.items.length).not.toBe(0)
    expect(registeredData.text).toBeTruthy()

    const filteredData = await get(true, dbName)
    expect(filteredData.items.length).toBe(0)
    expect(filteredData.text).toBeFalsy()

    await history.deleteDb(dbName)
  }, 1000 * 60 * 5)
})



