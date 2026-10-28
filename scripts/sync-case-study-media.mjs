import { mkdir, writeFile } from 'node:fs/promises'

// Public media supplied by the projects' official Steam listings.
const projects = { 'the-nick': 3026070, 'rain-heart': 4397540, 'dark-times': 3302960, 'cup-or-die': 4369890 }
const manifest = {}
for (const [slug, id] of Object.entries(projects)) {
  const response = await fetch(`https://store.steampowered.com/api/appdetails?appids=${id}&l=english`)
  const result = await response.json()
  if (!result[id]?.success) throw new Error(`Steam metadata unavailable: ${slug}`)
  const data = result[id].data
  const directory = `public/assets/case-studies/${slug}`
  await mkdir(directory, { recursive: true })
  const download = async (url, filename) => {
    const asset = await fetch(url)
    if (!asset.ok) throw new Error(`Media download failed: ${url}`)
    await writeFile(`${directory}/${filename}`, Buffer.from(await asset.arrayBuffer()))
    return `/assets/case-studies/${slug}/${filename}`
  }
  const cover = await download(data.header_image, 'cover.jpg')
  const screenshots = []
  for (const [index, shot] of (data.screenshots || []).entries()) screenshots.push(await download(shot.path_full, `screenshot-${index + 1}.jpg`))
  const trailers = []
  for (const [index, movie] of (data.movies || []).entries()) trailers.push({ title: movie.name, poster: await download(movie.thumbnail, `trailer-${index + 1}.jpg`), url: `https://store.steampowered.com/app/${id}/?snr=case-study#app_trailer_${movie.id}` })
  manifest[slug] = { cover, screenshots, trailers, storeUrl: `https://store.steampowered.com/app/${id}/`, source: `https://store.steampowered.com/app/${id}/`, checkedAt: '2026-10-28' }
  console.log(`${slug}: ${screenshots.length} screenshots, ${trailers.length} trailers`)
}
await writeFile('src/case-study-media.json', `${JSON.stringify(manifest, null, 2)}\n`)
