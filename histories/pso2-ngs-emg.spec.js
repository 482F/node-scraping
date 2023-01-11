import { describe, expect, test } from 'vitest'
import get from './pso2-ngs-emg.js'
import * as history from './history.js'

describe('pso2-ngs-emg', () => {
  test('main', async () => {
    const dbName = 'pso2-ngs-emg-test'

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



