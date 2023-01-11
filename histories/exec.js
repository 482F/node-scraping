;(async () => {
  const target = process.argv[2]
  const targetFunc = await import(`./${target}.js`)
    .then((m) => m.default)
    .catch((e) => {
      if (e.message.match(/^Cannot find module/)) return
      else throw e
    })
  if (!targetFunc) return

  const result = await targetFunc().then((r) => r.text)

  if (result) {
    console.log(result)
  }
})()
