const getLyricSites = async (...args) => {
  const getLyricSites = await import('./lyrics.mjs').then((m) => m.default)
  return await getLyricSites(...args)
}

module.exports = {
  getLyricSites,
}

