import { describe, expect, test } from 'vitest'
import getPso2Emg from './pso2-emg.js'
import * as history from './history.js'

describe('pso2-emg', () => {
  test('main', async () => {
    const dbName = 'pso2-emg-test'

    const data = await getPso2Emg(false, dbName)
    expect(data.items.length).not.toBe(0)
    expect(data.text).toBeTruthy()

    const registeredData = await getPso2Emg(true, dbName)
    expect(registeredData.items.length).not.toBe(0)
    expect(registeredData.text).toBeTruthy()

    const filteredData = await getPso2Emg(true, dbName)
    expect(filteredData.items.length).toBe(0)
    expect(filteredData.text).toBeFalsy()

    await history.deleteDb(dbName)
  }, 1000 * 60 * 5)
})


