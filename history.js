import crypto from 'crypto'
function createHash(text) {
  return crypto.createHash('sha256').update(text).digest('hex')
}

import * as sqlite3 from '@482/js-utils/sqlite3.js'

function toAsyncCallback(func) {
  return new Promise((resolve, reject) => {
    func((err, result) => {
      if (err) reject(err)
      resolve(result)
    })
  })
}

function createDbProxy(dbFilePath = './scraping-history.sqlite3') {
  return sqlite3.createDbProxy(new URL(dbFilePath, import.meta.url).pathname)
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

export async function filter(name, arr, key, dbName) {
  const db = createDbProxy(dbName)
  await createTable(db)
  const existsHashes = await db
    .all(
      `SELECT hash FROM hashes WHERE name = ? AND hash IN (
        ${repeatPlaceholder('?', arr.length)}
      )`,
      name,
      ...arr.map((item) => createHash(item[key]))
    )
    .then((rows) => rows.map(({ hash }) => hash))

  await db.close()

  return arr.filter((item) => !existsHashes.includes(createHash(item[key])))
}

export async function register(name, arr, key, dbName) {
  const db = createDbProxy(dbName)
  await createTable(db)
  await db.run(
    `INSERT INTO hashes (name, hash) VALUES
      ${repeatPlaceholder('(?, ?)', arr.length)}
    `,
    ...arr.flatMap((item) => [name, createHash(item[key])])
  )
  await db.close()
}
