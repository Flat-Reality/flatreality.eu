import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from '../src/lib/supabase-config.js'

const pagesDomain = process.env.PAGES_DOMAIN || 'flatreality.eu'
const template = await readFile('dist/index.html', 'utf8')
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character])
const plainText = value => String(value ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

function articleBody(article) {
  const blocks = (article.content?.blocks || []).map(block => {
    const data = block.data || {}
    if (block.type === 'header') return `<h2>${escapeHtml(plainText(data.text))}</h2>`
    if (block.type === 'paragraph' || block.type === 'quote') return `<p>${escapeHtml(plainText(data.text))}</p>`
    if (block.type === 'list') return `<ul>${(data.items || []).map(item => `<li>${escapeHtml(plainText(typeof item === 'string' ? item : item.content))}</li>`).join('')}</ul>`
    if (block.type === 'image' && (data.file?.url || data.url)) return `<img src="${escapeHtml(data.file?.url || data.url)}" alt="${escapeHtml(plainText(data.caption))}">`
    return ''
  }).join('')
  return `<main><nav><a href="/channel/">FR Channel</a> • ${escapeHtml(article.category)} • ${escapeHtml(article.title)}</nav><article><h1>${escapeHtml(article.title)}</h1><p>${escapeHtml(article.excerpt)}</p>${article.cover_url ? `<img src="${escapeHtml(article.cover_url)}" alt="">` : ''}${blocks}</article></main>`
}

async function getPublishedArticles() {
  try {
    const cutoff = encodeURIComponent(new Date().toISOString())
    const response = await fetch(`${SUPABASE_URL}/rest/v1/channel_articles?select=*&status=in.(published,scheduled)&published_at=lte.${cutoff}&order=published_at.desc&limit=100`, {
      headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}` },
      signal: AbortSignal.timeout(8000)
    })
    if (!response.ok) throw new Error(`Supabase returned ${response.status}`)
    return await response.json()
  } catch (error) {
    console.warn(`FR Channel prerender skipped: ${error.message}`)
    return []
  }
}

const articles = await getPublishedArticles()
const routes = [
  { path: '', title: 'Flat Reality - Games Should Say Something', description: 'Flat Reality is an independent European game studio creating expressive games that leave a lasting impression.', canonical: 'https://flatreality.eu/', indexable: true, priority: '1.0', changefreq: 'weekly', body: `<main><p>Flat Reality Studio</p><h1>Games Should Say Something</h1><p>Independent, expressive games that leave a lasting impression.</p><nav><a href="/games/">Our games</a><a href="/channel/">FR Channel</a><a href="/partners/">Flat Reality Partners</a><a href="/privacy/">Privacy Policy</a></nav></main>` },
  { path: 'games', title: 'Games - Flat Reality', description: 'Explore expressive games by Flat Reality, including The Nick and RAIN HEART.', canonical: 'https://flatreality.eu/games/', indexable: true, priority: '0.8', changefreq: 'monthly', body: `<main><p>Flat Reality Studio</p><h1>Games</h1><p>Independent, expressive games that leave a lasting impression.</p><nav><a href="https://thenick.flatreality.eu/">The Nick</a><a href="https://store.steampowered.com/app/4397540/RAIN_HEART/">RAIN HEART</a></nav></main>` },
  { path: 'channel', title: 'Flat Reality Channel | News from Flat Reality', description: 'The latest news, stories and transmissions from Flat Reality Studio, RAIN HEART, The Nick and FR Partners.', canonical: 'https://flatreality.eu/channel/', indexable: true, priority: '0.9', changefreq: 'daily', body: `<main><p>Flat Reality</p><h1>Flat Reality Channel</h1><p>News, stories and transmissions from our studio, games and partners.</p>${articles.slice(0, 12).map(article => `<article><h2><a href="/channel/${escapeHtml(article.slug)}/">${escapeHtml(article.title)}</a></h2><p>${escapeHtml(article.excerpt)}</p></article>`).join('')}</main>` },
  { path: 'partners', title: 'Flat Reality Partners - Create More. Manage Less.', description: 'Creative production services, technologies and a trusted partner network for ambitious game teams.', canonical: 'https://flatreality.eu/partners/', indexable: true, priority: '0.8', changefreq: 'monthly', body: `<main><p>Flat Reality Partners</p><h1>Create More. Manage Less.</h1><p>Creative production services, technologies and a trusted partner network for ambitious game teams.</p><nav><a href="/partners/outsourcing/">Outsourcing</a><a href="/partners/tech/">Technologies</a><a href="/partners/#network">Network</a></nav></main>` },
  { path: 'privacy', title: 'Privacy Policy - Flat Reality', description: 'Privacy, cookies and data rights at Flat Reality.', canonical: 'https://flatreality.eu/privacy/', indexable: true, priority: '0.2', changefreq: 'yearly', body: `<main><p>Flat Reality Legal</p><h1>Privacy Policy</h1><p>Flat Reality processes personal information transparently and in accordance with applicable privacy law, including the GDPR and CCPA/CPRA where relevant.</p><p>Contact <a href="mailto:contact@flatreality.eu">contact@flatreality.eu</a> about your privacy rights.</p></main>` },
  { path: 'admin', title: 'FR Channel Administration', description: 'Private Flat Reality publishing workspace.', canonical: 'https://flatreality.eu/admin/', robots: 'noindex, nofollow, noarchive', body: '<main><h1>Flat Reality Administration</h1><p>Private publishing workspace.</p></main>' },
  { path: 'partners/outsourcing', title: 'Outsourcing - Flat Reality Partners', description: 'Flexible production support for ambitious game teams.' },
  { path: 'partners/outsourcing/game-vision-pack', title: 'Game Vision Pack - Flat Reality Partners', description: 'A focused foundation for positioning, scope and creative direction.' },
  { path: 'partners/outsourcing/retainer', title: 'Retainer+ - Flat Reality Partners', description: 'Reliable, ongoing production capacity without management overhead.' },
  { path: 'partners/outsourcing/retainerplus', title: 'Retainer+ - Flat Reality Partners', description: 'Reliable, ongoing production capacity without management overhead.' },
  { path: 'partners/tech', title: 'Technologies - Flat Reality Partners', description: 'Tools that simplify development and empower creators.' },
  { path: 'partners/tech/phantomui', title: 'Phantom UI - Flat Reality Partners', description: 'Dialogue systems and production-ready UI technology for Unity.' },
  ...articles.map(article => ({ path: `channel/${article.slug}`, title: `${article.title} | FR Channel`, description: article.excerpt, canonical: `https://flatreality.eu/channel/${article.slug}/`, image: article.cover_url, type: 'article', indexable: true, priority: '0.7', changefreq: 'monthly', lastmod: article.updated_at?.slice(0, 10), body: articleBody(article) }))
]

function renderRoute(route) {
  const canonical = route.canonical || `https://flatreality.eu/${route.path}/`
  const robots = route.robots || (route.indexable ? 'index, follow, max-image-preview:large' : 'noindex, follow')
  const body = route.body || `<main><p>Flat Reality Partners</p><h1>${escapeHtml(route.title.replace(' - Flat Reality Partners', ''))}</h1><p>${escapeHtml(route.description)}</p><p>This page is being prepared.</p><a href="/partners/">Return to Flat Reality Partners</a></main>`
  let html = template
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(route.title)}</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${escapeHtml(route.description)}" />`)
    .replace(/<meta name="robots" content="[^"]*"\s*\/>/, `<meta name="robots" content="${robots}" />`)
    .replace(/<meta property="og:title" content="[^"]*"\s*\/>/, `<meta property="og:title" content="${escapeHtml(route.title)}" />`)
    .replace(/<meta property="og:description" content="[^"]*"\s*\/>/, `<meta property="og:description" content="${escapeHtml(route.description)}" />`)
    .replace(/<meta property="og:type" content="[^"]*"\s*\/>/, `<meta property="og:type" content="${route.type || 'website'}" />`)
    .replace(/<meta property="og:url" content="[^"]*"\s*\/>/, `<meta property="og:url" content="${canonical}" />`)
    .replace(/<link rel="canonical" href="[^"]*"\s*\/>/, `<link rel="canonical" href="${canonical}" />`)
    .replace('<div id="app"></div>', `<div id="app"><div class="seo-prerender">${body}</div></div>`)
    .replace('</head>', `<style>.seo-prerender{min-height:100vh;padding:120px max(24px,8vw);background:#090909;color:#fff;font-family:Arial,sans-serif}.seo-prerender main{max-width:960px}.seo-prerender h1{font-size:clamp(40px,7vw,96px);line-height:1}.seo-prerender p{max-width:720px;font-size:18px;line-height:1.5}.seo-prerender nav{display:flex;gap:24px;flex-wrap:wrap}.seo-prerender a{color:inherit}.seo-prerender img{max-width:100%;height:auto}</style></head>`)
  if (route.image) html = html
    .replace(/<meta property="og:image" content="[^"]*"\s*\/>/, `<meta property="og:image" content="${escapeHtml(route.image)}" />`)
    .replace(/<meta name="twitter:image" content="[^"]*"\s*\/>/, `<meta name="twitter:image" content="${escapeHtml(route.image)}" />`)
    .replace(/\s*<meta property="og:image:(?:width|height|alt)" content="[^"]*"\s*\/>/g, '')
    .replace(/\s*<meta name="twitter:image:alt" content="[^"]*"\s*\/>/, '')
  return html
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

const today = new Date().toISOString().slice(0, 10)
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.filter(route => route.indexable).map(route => `  <url>\n    <loc>${escapeHtml(route.canonical || `https://flatreality.eu/${route.path ? `${route.path}/` : ''}`)}</loc>\n    <lastmod>${route.lastmod || today}</lastmod>\n    <changefreq>${route.changefreq || 'monthly'}</changefreq>\n    <priority>${route.priority || '0.5'}</priority>\n  </url>`).join('\n')}\n</urlset>\n`
await writeFile('dist/sitemap.xml', sitemap)
await writeFile('dist/CNAME', `${pagesDomain}\n`)
await writeFile('dist/.nojekyll', '')
