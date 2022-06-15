import { describe, expect, test } from 'vitest'
import * as history from './history.js'
import * as sqlite3 from '@482/js-utils/sqlite3.js'
import fs from 'node:fs/promises'

const name = 'registerDefaultTest'

function createDbName() {
  return `./scraping-history-${Math.random()}.sqlite3`
}

async function dbTest(dbName, func) {
  const dbPath = new URL(dbName, import.meta.url).pathname
  const db = sqlite3.createDbProxy(dbPath)
  try {
    await func(db)
  } finally {
    await db.close()
    console.log('unlink', dbPath)
    await fs.unlink(dbPath)
  }
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
  test('register', async () => {
    const dbName = createDbName()
    dbTest(dbName, async (db) => {
      await register(dbName)
      const result = await db.all(
        `SELECT * FROM hashes WHERE name = ? ORDER BY id ASC`,
        name
      )
      expect(result[0].hash).toBe(
        'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb'
      )
    })
  })
  test('filter', async () => {
    const dbName = createDbName()
    await register(dbName)
    const data = createData('abcdefg')
    const filteredData = await history.filter(name, data, 'name', dbName)
    expect(filteredData.length).toBe(1)
    expect(filteredData[0].name).toBe('g')
    // db ファイル削除
    await dbTest(dbName, () => {})
  })
})
