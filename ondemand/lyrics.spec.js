import { describe, expect, test } from 'vitest'
import getLyricSites from './lyrics.mjs'

describe('lyrics', () => {
  test('getLyricSites', async () => {
    const sites = await getLyricSites('ラフメイカー')
    expect(sites.length).toBeGreaterThan(0)
    const lyrics = []
    for (const site of sites) {
      lyrics.push(await site.getLyric())
    }
    expect(lyrics.every((lyric) => 30 <= lyric.length)).toBe(true)
  }, 1000 * 60 * 5)
})
