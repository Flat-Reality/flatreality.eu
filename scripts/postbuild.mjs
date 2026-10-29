import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from '../src/lib/supabase-config.js'
import { caseStudyProjects, caseStudyPath } from '../src/case-studies-data.js'
import { caseStudyBody, caseStudyCover, portfolioBody } from '../src/case-studies.js'
import { independentPartnerBody, independentPartnerPath, independentPartnerSeo } from '../src/independent-partner.js'

const origin = 'https://flatreality.eu'
const pagesDomain = process.env.PAGES_DOMAIN || 'flatreality.eu'
const defaultImage = `${origin}/assets/images/FlatRealityCover.png`
const publisherLogo = `${origin}/assets/logos/StudioLogo.png`
const template = await readFile('dist/index.html', 'utf8')
const categoryLabels = {
  studio: 'Studio',
  rainheart: 'RAIN HEART',
  thenick: 'The Nick',
  partners: 'FR Partners'
}

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character])
const escapeXml = escapeHtml
const plainText = value => String(value ?? '')
  .replace(/<[^>]*>/g, ' ')
  .replace(/&nbsp;/gi, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/&quot;/gi, '"')
  .replace(/&#39;/gi, "'")
  .replace(/\s+/g, ' ')
  .trim()
const truncate = (value, length = 180) => {
  const clean = plainText(value)
  return clean.length <= length ? clean : `${clean.slice(0, length - 1).replace(/\s+\S*$/, '')}…`
}
const absoluteUrl = value => {
  if (!value) return ''
  const url = String(value).trim()
  const rawMatch = url.match(/^https:\/\/raw\.githubusercontent\.com\/Flat-Reality\/flatreality\.eu\/(?:main|master)\/public\/(.+)$/i)
  if (rawMatch) return `${origin}/${rawMatch[1]}`
  if (/^https?:\/\//i.test(url)) return url
  return `${origin}/${url.replace(/^\.?\//, '')}`
}
const jsonLd = value => `<script type="application/ld+json">${JSON.stringify(value).replace(/</g, '\\u003c')}</script>`
const publishedDate = article => article.published_at || article.created_at || new Date().toISOString()
const modifiedDate = article => article.updated_at || publishedDate(article)
const categoryName = article => categoryLabels[article.category] || article.category || 'Studio'
const articleUrl = article => `${origin}/channel/${article.slug}/`

function articleImages(article) {
  const images = []
  if (article.cover_url) images.push(absoluteUrl(article.cover_url))
  for (const block of article.content?.blocks || []) {
    if (block.type !== 'image') continue
    const url = absoluteUrl(block.data?.file?.url || block.data?.url)
    if (url) images.push(url)
  }
  return [...new Set(images)]
}

function blockText(block) {
  const data = block?.data || {}
  if (block.type === 'list') return (data.items || []).map(item => plainText(typeof item === 'string' ? item : item.content)).join(' ')
  return plainText(data.text || data.caption || '')
}

function articleText(article) {
  return plainText([article.title, article.excerpt, ...(article.content?.blocks || []).map(blockText)].join(' '))
}

function renderBlocks(article) {
  return (article.content?.blocks || []).map((block, index) => {
    const data = block.data || {}
    if (block.type === 'header') {
      const level = Math.min(Math.max(Number(data.level) || 2, 2), 4)
      return `<h${level}>${escapeHtml(plainText(data.text))}</h${level}>`
    }
    if (block.type === 'paragraph') return `<p>${escapeHtml(plainText(data.text))}</p>`
    if (block.type === 'quote') return `<blockquote><p>${escapeHtml(plainText(data.text))}</p>${data.caption ? `<cite>${escapeHtml(plainText(data.caption))}</cite>` : ''}</blockquote>`
    if (block.type === 'delimiter') return '<hr>'
    if (block.type === 'list') {
      const tag = data.style === 'ordered' ? 'ol' : 'ul'
      return `<${tag}>${(data.items || []).map(item => `<li>${escapeHtml(plainText(typeof item === 'string' ? item : item.content))}</li>`).join('')}</${tag}>`
    }
    if (block.type === 'image' && (data.file?.url || data.url)) {
      const caption = plainText(data.caption)
      const alt = caption || `${article.title} image ${index + 1}`
      return `<figure><img src="${escapeHtml(absoluteUrl(data.file?.url || data.url))}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async"><figcaption>${escapeHtml(caption)}</figcaption></figure>`
    }
    if (block.type === 'embed' && data.source) {
      return `<p><a href="${escapeHtml(absoluteUrl(data.source))}" rel="noopener">${escapeHtml(data.caption || `Media related to ${article.title}`)}</a></p>`
    }
    if (block.type === 'raw' && data.html) return `<p>${escapeHtml(plainText(data.html))}</p>`
    return ''
  }).join('')
}

function breadcrumbItems(path, title) {
  const items = [{ name: 'Flat Reality', item: `${origin}/` }]
  if (path.startsWith('channel')) items.push({ name: 'FR Channel', item: `${origin}/channel/` })
  else if (path.startsWith('partners')) items.push({ name: 'FR Partners', item: `${origin}/partners/` })
  if (path && !['channel', 'partners'].includes(path)) items.push({ name: title.replace(/ \| FR Channel| - Flat Reality Partners| - Flat Reality/g, ''), item: `${origin}/${path}/` })
  return items
}

function breadcrumbSchema(path, title) {
  const items = breadcrumbItems(path, title)
  if (items.length < 2) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((entry, index) => ({ '@type': 'ListItem', position: index + 1, name: entry.name, item: entry.item }))
  }
}

function articleSchema(article) {
  const images = articleImages(article)
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: truncate(article.excerpt || articleText(article)),
    image: images.length ? images : [defaultImage],
    datePublished: publishedDate(article),
    dateModified: modifiedDate(article),
    articleSection: categoryName(article),
    inLanguage: 'en',
    isAccessibleForFree: true,
    mainEntityOfPage: { '@type': 'WebPage', '@id': articleUrl(article) },
    author: { '@type': 'Organization', '@id': `${origin}/#organization`, name: 'Flat Reality', url: origin },
    publisher: {
      '@type': 'Organization',
      '@id': `${origin}/#organization`,
      name: 'Flat Reality',
      url: origin,
      logo: { '@type': 'ImageObject', url: publisherLogo }
    }
  }
}

function articleBody(article) {
  const category = categoryName(article)
  const cover = absoluteUrl(article.cover_url)
  return `<main><nav aria-label="Breadcrumb"><a href="/channel/">FR Channel</a><span aria-hidden="true"> • </span><span>${escapeHtml(category)}</span><span aria-hidden="true"> • </span><span>${escapeHtml(article.title)}</span></nav><article itemscope itemtype="https://schema.org/NewsArticle"><header><p>${escapeHtml(category)}</p><h1 itemprop="headline">${escapeHtml(article.title)}</h1><p itemprop="description">${escapeHtml(article.excerpt)}</p><p>By <span itemprop="author">Flat Reality</span> · <time itemprop="datePublished" datetime="${escapeHtml(publishedDate(article))}">${escapeHtml(new Date(publishedDate(article)).toLocaleDateString('en-GB', { dateStyle: 'long', timeZone: 'UTC' }))}</time></p>${cover ? `<figure><img itemprop="image" src="${escapeHtml(cover)}" alt="${escapeHtml(`${article.title} cover image`)}" fetchpriority="high" decoding="async"></figure>` : ''}</header><div itemprop="articleBody">${renderBlocks(article)}</div></article></main>`
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
const articleList = articles.slice(0, 12).map(article => `<article><h2><a href="/channel/${escapeHtml(article.slug)}/">${escapeHtml(article.title)}</a></h2><p>${escapeHtml(truncate(article.excerpt || articleText(article), 240))}</p><p>${escapeHtml(categoryName(article))} · <time datetime="${escapeHtml(publishedDate(article))}">${escapeHtml(new Date(publishedDate(article)).toLocaleDateString('en-GB', { timeZone: 'UTC' }))}</time></p></article>`).join('')

const routes = [
  { path: '', title: 'Flat Reality - Games Should Say Something', description: 'Flat Reality is an independent European game studio creating expressive games that leave a lasting impression.', canonical: `${origin}/`, indexable: true, priority: '1.0', changefreq: 'weekly', images: [defaultImage, `${origin}/assets/images/TheNickCover.jpeg`, `${origin}/assets/images/RAINHEARTCover.jpg`], body: `<main><p>Flat Reality Studio</p><h1>Games Should Say Something</h1><p>Flat Reality is an independent European game studio creating expressive games that leave a lasting impression.</p><nav aria-label="Primary"><a href="/games/">Our games</a><a href="/channel/">FR Channel</a><a href="/partners/">Flat Reality Partners</a><a href="/privacy/">Privacy Policy</a></nav></main>`, schema: { '@context': 'https://schema.org', '@type': 'WebPage', '@id': `${origin}/#webpage`, url: `${origin}/`, name: 'Flat Reality - Games Should Say Something', isPartOf: { '@id': `${origin}/#website` }, about: { '@id': `${origin}/#organization` } } },
  { path: 'games', title: 'Games - Flat Reality', description: 'Explore expressive games by Flat Reality, including The Nick and RAIN HEART.', canonical: `${origin}/games/`, indexable: true, priority: '0.8', changefreq: 'monthly', images: [`${origin}/assets/images/TheNickCover.jpeg`, `${origin}/assets/images/RAINHEARTCover.jpg`], body: `<main><p>Flat Reality Studio</p><h1>Games</h1><p>Explore independent, expressive games that leave a lasting impression.</p><section><h2>The Nick</h2><p>A meta-horror experience from Flat Reality.</p><a href="https://thenick.flatreality.eu/">Visit The Nick</a></section><section><h2>RAIN HEART</h2><p>A psychological horror game about identity.</p><a href="https://store.steampowered.com/app/4397540/RAIN_HEART/">RAIN HEART on Steam</a></section></main>` },
  { path: 'channel', title: 'Flat Reality Channel | News from Flat Reality', description: 'The latest news, stories and transmissions from Flat Reality Studio, RAIN HEART, The Nick and FR Partners.', canonical: `${origin}/channel/`, indexable: true, priority: '0.9', changefreq: 'daily', images: [defaultImage, ...articles.slice(0, 12).flatMap(articleImages)], body: `<main><p>Flat Reality</p><h1>Flat Reality Channel</h1><p>News, stories and transmissions from our studio, games and partners.</p><section aria-labelledby="latest-news"><h2 id="latest-news">Latest News</h2>${articleList || '<p>New transmissions are coming soon.</p>'}</section></main>`, schema: { '@context': 'https://schema.org', '@type': 'CollectionPage', '@id': `${origin}/channel/#webpage`, url: `${origin}/channel/`, name: 'Flat Reality Channel', description: 'News, stories and transmissions from Flat Reality.', isPartOf: { '@id': `${origin}/#website` }, mainEntity: { '@type': 'ItemList', itemListElement: articles.slice(0, 12).map((article, index) => ({ '@type': 'ListItem', position: index + 1, url: articleUrl(article), name: article.title })) } } },
  { path: 'partners', title: 'Flat Reality Partners - Create More. Manage Less.', description: 'Creative production services, technologies and a trusted partner network for ambitious game teams.', canonical: `${origin}/partners/`, indexable: true, priority: '0.8', changefreq: 'monthly', images: [defaultImage], body: `<main><p>Flat Reality Partners</p><h1>Create More. Manage Less.</h1><p>Creative production services, technologies and a trusted partner network for ambitious game teams.</p><nav><a href="/partners/outsourcing/">Outsourcing</a><a href="/partners/tech/">Technologies</a><a href="/partners/#network">Network</a></nav></main>` },
  { path: 'privacy', title: 'Privacy Policy - Flat Reality', description: 'Privacy, cookies and data rights at Flat Reality.', canonical: `${origin}/privacy/`, indexable: true, priority: '0.2', changefreq: 'yearly', body: `<main><p>Flat Reality Legal</p><h1>Privacy Policy</h1><p>Flat Reality processes personal information transparently and in accordance with applicable privacy law, including the GDPR and CCPA/CPRA where relevant.</p><h2>Project inquiries</h2><p>Partners inquiries include the contact, project and collaboration details you provide. Unfinished drafts can be stored locally on your device for up to 30 days.</p><p>Contact <a href="mailto:contact@flatreality.eu">contact@flatreality.eu</a> about your privacy rights.</p></main>` },
  { path: 'admin', title: 'FR Channel Administration', description: 'Private Flat Reality publishing workspace.', canonical: `${origin}/admin/`, robots: 'noindex, nofollow, noarchive', body: '<main><h1>Flat Reality Administration</h1><p>Private publishing workspace.</p></main>' },
  { path: 'partners/outsourcing', title: 'Game Development Outsourcing & Production Services | Flat Reality Partners', description: 'Flexible game development outsourcing for indie studios and creative teams. Explore Unity development, game design, art, audio and production support.', canonical: `${origin}/partners/outsourcing/`, indexable: true, priority: '0.8', changefreq: 'monthly', images: [`${origin}/assets/images/PartnersTechnologyBackground.png`], body: `<main><p>Flat Reality Partners</p><h1>Build more. Without building a bigger team.</h1><p>Flexible game development services, built around your project.</p><nav><a href="/partners/outsourcing/new-inquiry/">Start a Project</a><a href="/partners/outsourcing/retainer-plus/">Retainer Plus</a><a href="/partners/tech/">Technologies</a></nav><h2>Our Capabilities</h2><p>Game Design and Narrative, Unity Development and Prototyping, 2D Art and UI, Audio and Sound, Production Management, Inclusive Design and Accessibility.</p></main>` },
  { path: 'partners/outsourcing/new-inquiry', title: 'Start a Project | Flat Reality Partners', description: 'Tell Flat Reality Partners about your game development project.', canonical: `${origin}/partners/outsourcing/new-inquiry/`, robots: 'noindex, nofollow, noarchive', body: '<main><h1>Start a Project</h1><p>Private project inquiry form.</p></main>' },
  { path: 'partners/outsourcing/game-vision-pack', title: 'Game Vision Pack - Flat Reality Partners', description: 'A focused foundation for positioning, scope and creative direction.' },
  { path: 'partners/outsourcing/retainer-plus', title: 'Retainer Plus | Flat Reality Partners', description: 'Reserve flexible game development capacity, specialists and coordinated production teams with Flat Reality Partners.', canonical: `${origin}/partners/outsourcing/retainer-plus/`, indexable: true, priority: '0.75', changefreq: 'monthly', body: `<main><p>Flat Reality Partners · Outsourcing</p><h1>Build the capacity you need.</h1><p>From individual specialists to coordinated production teams, Retainer Plus helps studios expand development capacity without expanding overhead.</p><h2>What Can We Support?</h2><p>Game Design and Narrative, Unity Development and Prototyping, 2D Art and UI, Audio and Sound, Production Management, Inclusive Design and Accessibility.</p><h2>Available Retainers</h2><p>Specialists, coordinated production teams and flexible capacity.</p><a href="/partners/outsourcing/retainer-plus/new-inquiry/">Request a Quote</a></main>` },
  { path: 'partners/outsourcing/retainer-plus/new-inquiry', title: 'Retainer Plus Inquiry | Flat Reality Partners', description: 'Configure long-term game production support with Flat Reality Partners.', canonical: `${origin}/partners/outsourcing/retainer-plus/new-inquiry/`, robots: 'noindex, nofollow, noarchive', body: '<main><h1>Retainer Plus Inquiry</h1><p>Private production capacity inquiry form.</p></main>' },
  { path: 'partners/tech', title: 'Technologies - Flat Reality Partners', description: 'Tools that simplify development and empower creators.' },
  { path: 'partners/tech/phantomui', title: 'Phantom UI - Flat Reality Partners', description: 'Dialogue systems and production-ready UI technology for Unity.' },
  ...articles.map(article => ({ path: `channel/${article.slug}`, title: `${article.title} | FR Channel`, description: truncate(article.excerpt || articleText(article)), canonical: articleUrl(article), image: articleImages(article)[0] || defaultImage, imageAlt: `${article.title} cover image`, type: 'article', indexable: true, priority: '0.7', changefreq: 'monthly', lastmod: modifiedDate(article).slice(0, 10), body: articleBody(article), schema: articleSchema(article), article }))
]

function renderRoute(route) {
  const canonical = route.canonical || `${origin}/${route.path}/`
  const robots = route.robots || (route.indexable ? 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1' : 'noindex, follow')
  const body = route.body || `<main><p>Flat Reality Partners</p><h1>${escapeHtml(route.title.replace(' - Flat Reality Partners', ''))}</h1><p>${escapeHtml(route.description)}</p><p>This page is being prepared.</p><a href="/partners/">Return to Flat Reality Partners</a></main>`
  const image = absoluteUrl(route.image) || defaultImage
  const schemas = [route.schema, breadcrumbSchema(route.path, route.title)].filter(Boolean)
  let html = template
    .replace(/<link rel="icon"[^>]*>/, `<link rel="icon" type="${/^partners(?:\/|$)/.test(route.path) ? 'image/jpeg' : 'image/png'}" href="/assets/logos/${/^partners(?:\/|$)/.test(route.path) ? 'PartnersLogo.jpg' : 'StudioLogo.png'}" />`)
    .replace(/<link rel="apple-touch-icon"[^>]*>/, `<link rel="apple-touch-icon" href="/assets/logos/${/^partners(?:\/|$)/.test(route.path) ? 'PartnersLogo.jpg' : 'StudioLogo.png'}" />`)
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(route.title)}</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${escapeHtml(truncate(route.description))}" />`)
    .replace(/<meta name="robots" content="[^"]*"\s*\/>/, `<meta name="robots" content="${robots}" />`)
    .replace(/<meta property="og:title" content="[^"]*"\s*\/>/, `<meta property="og:title" content="${escapeHtml(route.title)}" />`)
    .replace(/<meta property="og:description" content="[^"]*"\s*\/>/, `<meta property="og:description" content="${escapeHtml(truncate(route.description))}" />`)
    .replace(/<meta property="og:type" content="[^"]*"\s*\/>/, `<meta property="og:type" content="${route.type || 'website'}" />`)
    .replace(/<meta property="og:url" content="[^"]*"\s*\/>/, `<meta property="og:url" content="${canonical}" />`)
    .replace(/<meta property="og:image" content="[^"]*"\s*\/>/, `<meta property="og:image" content="${escapeHtml(image)}" />`)
    .replace(/<meta property="og:image:alt" content="[^"]*"\s*\/>/, `<meta property="og:image:alt" content="${escapeHtml(route.imageAlt || 'Flat Reality')}" />`)
    .replace(/<meta name="twitter:title" content="[^"]*"\s*\/>/, `<meta name="twitter:title" content="${escapeHtml(route.title)}" />`)
    .replace(/<meta name="twitter:description" content="[^"]*"\s*\/>/, `<meta name="twitter:description" content="${escapeHtml(truncate(route.description))}" />`)
    .replace(/<meta name="twitter:image" content="[^"]*"\s*\/>/, `<meta name="twitter:image" content="${escapeHtml(image)}" />`)
    .replace(/<meta name="twitter:image:alt" content="[^"]*"\s*\/>/, `<meta name="twitter:image:alt" content="${escapeHtml(route.imageAlt || 'Flat Reality')}" />`)
    .replace(/<link rel="canonical" href="[^"]*"\s*\/>/, `<link rel="canonical" href="${canonical}" />`)
    .replace('<div id="app"></div>', `<div id="app"><div class="seo-prerender">${body}</div></div>`)
    .replace('</head>', `${schemas.map(jsonLd).join('')}<style>.seo-prerender{min-height:100vh;padding:120px max(24px,8vw);background:#090909;color:#fff;font-family:Arial,sans-serif}.seo-prerender main{max-width:960px}.seo-prerender h1{font-size:clamp(40px,7vw,96px);line-height:1}.seo-prerender h2{font-size:clamp(28px,4vw,48px)}.seo-prerender p,.seo-prerender li{max-width:720px;font-size:18px;line-height:1.6}.seo-prerender nav{display:flex;gap:16px 24px;flex-wrap:wrap}.seo-prerender a{color:inherit}.seo-prerender img{max-width:100%;height:auto}.seo-prerender figure{margin:32px 0}.seo-prerender figcaption{margin-top:8px;color:#bbb}</style></head>`)

  if (route.article) {
    html = html.replace('</head>', `<meta property="article:published_time" content="${escapeHtml(publishedDate(route.article))}" /><meta property="article:modified_time" content="${escapeHtml(modifiedDate(route.article))}" /><meta property="article:section" content="${escapeHtml(categoryName(route.article))}" /><meta property="article:author" content="Flat Reality" /></head>`)
  }
  return html
}

for (const project of caseStudyProjects) routes.push({ path: caseStudyPath(project.slug).replace(/^\/|\/$/g,''), title: `${project.title} — Case Study | Flat Reality Partners`, description: project.description, indexable: false, robots: 'noindex, follow', image: caseStudyCover(project) || defaultImage, body: caseStudyBody(project), schema: { '@context':'https://schema.org', '@type':'Article', headline:`${project.title} — Case Study`, description:project.description, author:{'@type':'Organization',name:'Flat Reality Partners'}, mainEntityOfPage:`${origin}${caseStudyPath(project.slug)}` } })

routes.push({path:'partners/case-studies',title:'Case Study | Flat Reality Partners',description:'Explore game design, Unity development, production and key-art case studies from Flat Reality Partners.',canonical:`${origin}/partners/case-studies/`,indexable:true,image:defaultImage,body:portfolioBody()})
routes.push({path:'partners/portfolio',title:'Case Study | Flat Reality Partners',description:'Explore the Flat Reality Partners portfolio.',canonical:`${origin}/partners/case-studies/`,robots:'noindex, follow',indexable:false,image:defaultImage,body:portfolioBody()})

routes.push({path:independentPartnerPath.replace(/^\/|\/$/g,''),...independentPartnerSeo,indexable:true,body:independentPartnerBody(),images:[independentPartnerSeo.image]})

for (const route of routes) {
  if (!route.path) {
    await writeFile('dist/index.html', renderRoute(route))
    continue
  }
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
const sitemapPages = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.filter(route => route.indexable).map(route => `  <url>\n    <loc>${escapeXml(route.canonical || `${origin}/${route.path ? `${route.path}/` : ''}`)}</loc>\n    <lastmod>${route.lastmod || today}</lastmod>\n    <changefreq>${route.changefreq || 'monthly'}</changefreq>\n    <priority>${route.priority || '0.5'}</priority>\n  </url>`).join('\n')}\n</urlset>\n`

const newsCutoff = Date.now() - 48 * 60 * 60 * 1000
const recentNews = articles.filter(article => new Date(publishedDate(article)).getTime() >= newsCutoff)
const newsSitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n${recentNews.map(article => `  <url>\n    <loc>${escapeXml(articleUrl(article))}</loc>\n    <news:news>\n      <news:publication><news:name>Flat Reality Channel</news:name><news:language>en</news:language></news:publication>\n      <news:publication_date>${escapeXml(publishedDate(article))}</news:publication_date>\n      <news:title>${escapeXml(article.title)}</news:title>\n    </news:news>\n  </url>`).join('\n')}\n</urlset>\n`

const imageEntries = routes.filter(route => route.indexable).map(route => {
  const images = route.article ? articleImages(route.article) : [...new Set((route.images || (route.image ? [route.image] : [])).map(absoluteUrl))]
  if (!images.length) return ''
  return `  <url>\n    <loc>${escapeXml(route.canonical || `${origin}/${route.path ? `${route.path}/` : ''}`)}</loc>\n${images.map(image => `    <image:image><image:loc>${escapeXml(image)}</image:loc></image:image>`).join('\n')}\n  </url>`
}).filter(Boolean).join('\n')
const imageSitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${imageEntries}\n</urlset>\n`

const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap><loc>${origin}/sitemap-pages.xml</loc><lastmod>${today}</lastmod></sitemap>\n  <sitemap><loc>${origin}/news-sitemap.xml</loc><lastmod>${today}</lastmod></sitemap>\n  <sitemap><loc>${origin}/image-sitemap.xml</loc><lastmod>${today}</lastmod></sitemap>\n</sitemapindex>\n`

const rssItems = articles.slice(0, 50).map(article => `<item><title>${escapeXml(article.title)}</title><link>${escapeXml(articleUrl(article))}</link><guid isPermaLink="true">${escapeXml(articleUrl(article))}</guid><pubDate>${new Date(publishedDate(article)).toUTCString()}</pubDate><category>${escapeXml(categoryName(article))}</category><description>${escapeXml(truncate(article.excerpt || articleText(article), 500))}</description>${articleImages(article)[0] ? `<enclosure url="${escapeXml(articleImages(article)[0])}" type="image/${articleImages(article)[0].split('.').pop()?.split('?')[0] || 'jpeg'}" />` : ''}</item>`).join('')
const rss = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>Flat Reality Channel</title><link>${origin}/channel/</link><description>News, stories and transmissions from Flat Reality.</description><language>en</language><lastBuildDate>${new Date().toUTCString()}</lastBuildDate><atom:link xmlns:atom="http://www.w3.org/2005/Atom" href="${origin}/feed.xml" rel="self" type="application/rss+xml" />${rssItems}</channel></rss>\n`
const jsonFeed = {
  version: 'https://jsonfeed.org/version/1.1',
  title: 'Flat Reality Channel',
  home_page_url: `${origin}/channel/`,
  feed_url: `${origin}/feed.json`,
  description: 'News, stories and transmissions from Flat Reality.',
  language: 'en',
  items: articles.slice(0, 50).map(article => ({ id: articleUrl(article), url: articleUrl(article), title: article.title, summary: truncate(article.excerpt || articleText(article), 500), content_text: articleText(article), image: articleImages(article)[0] || undefined, date_published: publishedDate(article), date_modified: modifiedDate(article), tags: [categoryName(article)], authors: [{ name: 'Flat Reality', url: origin }] }))
}

const llms = `# Flat Reality\n\n> Independent European game studio creating expressive games that leave a lasting impression.\n\n## Primary sections\n- [Studio](${origin}/): Company overview and games studio.\n- [Games](${origin}/games/): The Nick and RAIN HEART.\n- [FR Channel](${origin}/channel/): Official news and articles.\n- [FR Partners](${origin}/partners/): Outsourcing, technology and partner services.\n- [Privacy Policy](${origin}/privacy/): Privacy and data rights.\n\n## Feeds\n- [RSS](${origin}/feed.xml)\n- [JSON Feed](${origin}/feed.json)\n- [Sitemap](${origin}/sitemap.xml)\n`
const llmsFull = `${llms}\n## Latest FR Channel articles\n${articles.map(article => `\n### ${article.title}\n- URL: ${articleUrl(article)}\n- Category: ${categoryName(article)}\n- Published: ${publishedDate(article)}\n\n${articleText(article)}\n`).join('')}`
const robots = `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /partners/outsourcing/new-inquiry/\nDisallow: /partners/outsourcing/retainer-plus/new-inquiry/\n\nSitemap: ${origin}/sitemap.xml\nSitemap: ${origin}/sitemap-pages.xml\nSitemap: ${origin}/news-sitemap.xml\nSitemap: ${origin}/image-sitemap.xml\n`

await Promise.all([
  writeFile('dist/sitemap.xml', sitemapIndex),
  writeFile('dist/sitemap-pages.xml', sitemapPages),
  writeFile('dist/news-sitemap.xml', newsSitemap),
  writeFile('dist/image-sitemap.xml', imageSitemap),
  writeFile('dist/feed.xml', rss),
  writeFile('dist/feed.json', `${JSON.stringify(jsonFeed, null, 2)}\n`),
  writeFile('dist/llms.txt', llms),
  writeFile('dist/llms-full.txt', llmsFull),
  writeFile('dist/robots.txt', robots),
  writeFile('dist/CNAME', `${pagesDomain}\n`),
  writeFile('dist/.nojekyll', '')
])
