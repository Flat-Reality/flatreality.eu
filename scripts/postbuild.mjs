import { copyFile, mkdir, writeFile } from 'node:fs/promises'

const pagesDomain = process.env.PAGES_DOMAIN || 'flatreality.eu'

await copyFile('dist/index.html', 'dist/404.html')
const routes = [
  'games',
  'privacy',
  'partners',
  'partners/outsourcing',
  'partners/outsourcing/game-vision-pack',
  'partners/outsourcing/retainerplus',
  'partners/tech',
  'partners/tech/phantomui'
]

await Promise.all(routes.map(async route => {
  const directory = `dist/${route}`
  await mkdir(directory, { recursive: true })
  await copyFile('dist/index.html', `${directory}/index.html`)
}))
await writeFile('dist/CNAME', `${pagesDomain}\n`)
await writeFile('dist/.nojekyll', '')
