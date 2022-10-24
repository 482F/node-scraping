import crypto from 'crypto'
function createHash(text) {
  return crypto.createHash('sha256').update(text).digest('hex')
}

import * as sqlite3 from '@482/js-utils/sqlite3.js'
import fs from 'node:fs/promises'

function toAsyncCallback(func) {
  return new Promise((resolve, reject) => {
    func((err, result) => {
      if (err) reject(err)
      resolve(result)
    })
  })
}

function createDbPath(dbName) {
  return new URL('./' + dbName + '.sqlite3', import.meta.url).pathname
}

function createDbProxy(dbName = 'scraping-history') {
  return sqlite3.createDbProxy(createDbPath(dbName))
}

function repeatPlaceholder(placeholder, length, joint = ',') {
  return Array(length)
    .fill(0)
    .map(() => placeholder)
    .join(joint)
}

async function createTable(db) {
  return db.run(
    `CREATE TABLE IF NOT EXISTS hashes (
      id INTEGER UNIQUE NOT NULL PRIMARY KEY,
      name TEXT NOT NULL,
      hash TEXT NOT NULL,
      UNIQUE(name, hash)
    )`
  )
}

async function prepareDb(dbName, func) {
  const db = createDbProxy(dbName)
  await createTable(db)
  try {
    return await func(db)
  } finally {
    await db.close()
  }
}

async function _filter(db, name, arr, key) {
  const existsHashes = await db
    .all(
      `SELECT hash FROM hashes WHERE name = ? AND hash IN (
        ${repeatPlaceholder('?', arr.length)}
      )`,
      name,
      ...arr.map((item) => createHash(item[key]))
    )
    .then((rows) => rows.map(({ hash }) => hash))

  return arr.filter((item) => !existsHashes.includes(createHash(item[key])))
}

export async function filter(name, arr, key, dbName) {
  return await prepareDb(dbName, (db) => _filter(db, name, arr, key))
}

async function _register(db, name, arr, key) {
  if (!arr.length) return
  await db.run(
    `INSERT INTO hashes (name, hash) VALUES
      ${repeatPlaceholder('(?, ?)', arr.length)}
    `,
    ...arr.flatMap((item) => [name, createHash(item[key])])
  )
}

export async function register(name, arr, key, dbName) {
  await prepareDb(dbName, (db) => _register(db, name, arr, key))
}

export async function filterAndRegister(name, arr, key, dbName) {
  return await prepareDb(dbName, async (db) => {
    const filteredArr = await _filter(db, name, arr, key)
    await _register(db, name, filteredArr, key)
    return filteredArr
  })
}

export async function deleteDb(dbName) {
  await fs.unlink(createDbPath(dbName))
}
