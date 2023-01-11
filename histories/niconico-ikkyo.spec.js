import { describe, expect, test } from 'vitest'
import getNiconicoIkkyo from './niconico-ikkyo.js'
import * as history from './history.js'

describe('pso2-emg', () => {
  test(
    'main',
    async () => {
      const dbName = 'niconico-ikkyo-test'

      const data = await getNiconicoIkkyo(false, dbName)
      expect(data.items.length).not.toBe(0)
      expect(data.text).toBeTruthy()

      const registeredData = await getNiconicoIkkyo(true, dbName)
      expect(registeredData.items.length).not.toBe(0)
      expect(registeredData.text).toBeTruthy()

      const filteredData = await getNiconicoIkkyo(true, dbName)
      expect(filteredData.items.length).toBe(0)
      expect(filteredData.text).toBeFalsy()

      await history.deleteDb(dbName)
    },
    1000 * 60 * 5
  )
})
