import { describe, expect, test } from 'vitest'
import * as history from './history.js'
import * as sqlite3 from '@482/js-utils/sqlite3.js'

const name = 'registerDefaultTest'

function createDbName() {
  return `scraping-history-${Math.random()}`
}

function createData(str) {
  return str.split('').map((char) => ({
    name: char,
    description: `description-${char}`,
  }))
}

async function register(dbName) {
  const data = createData('abcdef')
  await history.register(name, data, 'name', dbName)
}

describe('history', () => {
  test('filter', async () => {
    const dbName = createDbName()
    await register(dbName)
    const data = createData('abcdefg')
    const filteredData = await history.filter(name, data, 'name', dbName)
    expect(filteredData.length).toBe(1)
    expect(filteredData[0].name).toBe('g')
    await history.deleteDb(dbName)
  })
  test('filterAndRegister', async () => {
    const dbName = createDbName()
    await register(dbName)
    const data = createData('abcdefg')
    const filteredData = await history.filterAndRegister(
      name,
      data,
      'name',
      dbName
    )
    expect(filteredData.length).toBe(1)
    expect(filteredData[0].name).toBe('g')

    const secondFilteredData = await history.filterAndRegister(
      name,
      data,
      'name',
      dbName
    )
    expect(secondFilteredData.length).toBe(0)
    await history.deleteDb(dbName)
  })
})
