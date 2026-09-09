import { mkdir, readFile, writeFile } from 'node:fs/promises'

const pagesDomain = process.env.PAGES_DOMAIN || 'flatreality.eu'
const template = await readFile('dist/index.html', 'utf8')

const escapeHtml = value => value.replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[character])

const routes = [
  { path: '', title: 'Flat Reality - Games Should Say Something', description: 'Flat Reality is an independent European game studio creating expressive games that leave a lasting impression.', canonical: 'https://flatreality.eu/', body: `<main><p>Flat Reality Studio</p><h1>Games Should Say Something</h1><p>Independent, expressive games that leave a lasting impression.</p><nav><a href="/games/">Our games</a><a href="/partners/">Flat Reality Partners</a><a href="/privacy/">Privacy Policy</a></nav></main>` },
  { path: 'games', title: 'Games - Flat Reality', description: 'Explore expressive games by Flat Reality, including The Nick and RAIN HEART.', canonical: 'https://flatreality.eu/games/', body: `<main><p>Flat Reality Studio</p><h1>Games</h1><p>Independent, expressive games that leave a lasting impression.</p><nav><a href="https://thenick.flatreality.eu/">The Nick</a><a href="https://store.steampowered.com/app/4397540/RAIN_HEART/">RAIN HEART</a></nav></main>` },
  { path: 'partners', title: 'Flat Reality Partners - Create More. Manage Less.', description: 'Creative production services, technologies and a trusted partner network for ambitious game teams.', canonical: 'https://flatreality.eu/partners/', body: `<main><p>Flat Reality Partners</p><h1>Create More. Manage Less.</h1><p>Creative production services, technologies and a trusted partner network for ambitious game teams.</p><nav><a href="/partners/outsourcing/">Outsourcing</a><a href="/partners/tech/">Technologies</a><a href="/partners/#network">Network</a></nav></main>` },
  { path: 'privacy', title: 'Privacy Policy - Flat Reality', description: 'Privacy, cookies and data rights at Flat Reality.', canonical: 'https://flatreality.eu/privacy/', body: `<main><p>Flat Reality Legal</p><h1>Privacy Policy</h1><p>Flat Reality processes personal information transparently and in accordance with applicable privacy law, including the GDPR and CCPA/CPRA where relevant.</p><p>Contact <a href="mailto:contact@flatreality.eu">contact@flatreality.eu</a> about your privacy rights.</p></main>` },
  { path: 'partners/outsourcing', title: 'Outsourcing - Flat Reality Partners', description: 'Flexible production support for ambitious game teams.' },
  { path: 'partners/outsourcing/game-vision-pack', title: 'Game Vision Pack - Flat Reality Partners', description: 'A focused foundation for positioning, scope and creative direction.' },
  { path: 'partners/outsourcing/retainer', title: 'Retainer+ - Flat Reality Partners', description: 'Reliable, ongoing production capacity without management overhead.' },
  { path: 'partners/outsourcing/retainerplus', title: 'Retainer+ - Flat Reality Partners', description: 'Reliable, ongoing production capacity without management overhead.' },
  { path: 'partners/tech', title: 'Technologies - Flat Reality Partners', description: 'Tools that simplify development and empower creators.' },
  { path: 'partners/tech/phantomui', title: 'Phantom UI - Flat Reality Partners', description: 'Dialogue systems and production-ready UI technology for Unity.' }
]

function renderRoute(route) {
  const indexable = route.body !== undefined
  const canonical = route.canonical || `https://flatreality.eu/${route.path}/`
  const robots = indexable ? 'index, follow, max-image-preview:large' : 'noindex, follow'
  const body = route.body || `<main><p>Flat Reality Partners</p><h1>${escapeHtml(route.title.replace(' - Flat Reality Partners', ''))}</h1><p>${escapeHtml(route.description)}</p><p>This page is being prepared.</p><a href="/partners/">Return to Flat Reality Partners</a></main>`
  return template
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(route.title)}</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${escapeHtml(route.description)}" />`)
    .replace(/<meta name="robots" content="[^"]*"\s*\/>/, `<meta name="robots" content="${robots}" />`)
    .replace(/<meta property="og:title" content="[^"]*"\s*\/>/, `<meta property="og:title" content="${escapeHtml(route.title)}" />`)
    .replace(/<meta property="og:description" content="[^"]*"\s*\/>/, `<meta property="og:description" content="${escapeHtml(route.description)}" />`)
    .replace(/<meta property="og:url" content="[^"]*"\s*\/>/, `<meta property="og:url" content="${canonical}" />`)
    .replace(/<link rel="canonical" href="[^"]*"\s*\/>/, `<link rel="canonical" href="${canonical}" />`)
    .replace('<div id="app"></div>', `<div id="app"><div class="seo-prerender">${body}</div></div>`)
    .replace('</head>', `<style>.seo-prerender{min-height:100vh;padding:120px max(24px,8vw);background:#090909;color:#fff;font-family:Arial,sans-serif}.seo-prerender main{max-width:960px}.seo-prerender h1{font-size:clamp(40px,7vw,96px);line-height:1}.seo-prerender p{max-width:720px;font-size:18px;line-height:1.5}.seo-prerender nav{display:flex;gap:24px;flex-wrap:wrap}.seo-prerender a{color:inherit}</style></head>`)
}

for (const route of routes) {
  if (!route.path) { await writeFile('dist/index.html', renderRoute(route)); continue }
  const directory = `dist/${route.path}`
  await mkdir(directory, { recursive: true })
  await writeFile(`${directory}/index.html`, renderRoute(route))
}

const notFound = template
  .replace(/<title>[^<]*<\/title>/, '<title>Page not found - Flat Reality</title>')
  .replace(/<meta name="robots" content="[^"]*"\s*\/>/, '<meta name="robots" content="noindex, follow" />')
  .replace(/<link rel="canonical" href="[^"]*"\s*\/>/, '')
  .replace('<div id="app"></div>', '<div id="app"><main><h1>Page not found</h1><p><a href="/">Return to Flat Reality</a></p></main></div>')
await writeFile('dist/404.html', notFound)
await writeFile('dist/CNAME', `${pagesDomain}\n`)
await writeFile('dist/.nojekyll', '')
