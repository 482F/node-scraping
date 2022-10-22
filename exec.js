;(async () => {
  const target = process.argv[2]
  const targetFunc = await import(`./${target}.js`)
    .then((m) => m.default)
    .catch(() => null)
  if (!targetFunc) return

  const result = await targetFunc().then((r) => r.text)

  if (result) {
    console.log(result)
  }
})()
