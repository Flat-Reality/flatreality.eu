import DOMPurify from 'dompurify'
import { supabase } from './lib/supabase.js'

export const channelCategories = {
  studio: { label: 'Studio', icon: '/assets/icons/PartnersIcon.png' },
  'rain-heart': { label: 'RAIN HEART', icon: '/assets/icons/RainHeartIcon.png' },
  'the-nick': { label: 'The Nick', icon: '/assets/icons/TheNickIcon.png' },
  'fr-partners': { label: 'FR Partners', icon: '/assets/icons/PartnersIcon.png' }
}

let articleCache

export async function getPublishedArticles(force = false) {
  if (!force && articleCache) return articleCache
  const { data, error } = await supabase.from('channel_articles').select('*')
    .eq('status', 'published').lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false }).limit(100)
  if (error) throw error
  articleCache = data || []
  return articleCache
}

export async function getArticle(slug) {
  const { data, error } = await supabase.from('channel_articles').select('*')
    .eq('slug', slug).eq('status', 'published').maybeSingle()
  if (error) throw error
  return data
}

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[character])

const safeUrl = value => {
  try {
    const url = new URL(value, location.origin)
    return ['http:', 'https:'].includes(url.protocol) ? escapeHtml(url.href) : ''
  } catch { return '' }
}

function renderList(items = [], style = 'unordered') {
  const tag = style === 'ordered' ? 'ol' : 'ul'
  const renderItems = list => `<${tag}>${list.map(item => {
    const content = typeof item === 'string' ? item : item.content
    const children = typeof item === 'object' ? item.items : []
    return `<li>${DOMPurify.sanitize(content || '', { ALLOWED_TAGS: ['b','strong','i','em','a','code','mark'], ALLOWED_ATTR: ['href','target','rel'] })}${children?.length ? renderItems(children) : ''}</li>`
  }).join('')}</${tag}>`
  return renderItems(items)
}

export function renderArticleBlocks(output = {}) {
  return (output.blocks || []).map(block => {
    const data = block.data || {}
    switch (block.type) {
      case 'header': return `<h${Math.min(4, Math.max(2, Number(data.level) || 2))}>${DOMPurify.sanitize(data.text || '')}</h${Math.min(4, Math.max(2, Number(data.level) || 2))}>`
      case 'paragraph': return `<p>${DOMPurify.sanitize(data.text || '')}</p>`
      case 'list': return renderList(data.items, data.style)
      case 'quote': return `<blockquote><p>${DOMPurify.sanitize(data.text || '')}</p>${data.caption ? `<cite>${DOMPurify.sanitize(data.caption)}</cite>` : ''}</blockquote>`
      case 'delimiter': return '<hr>'
      case 'image': {
        const url = safeUrl(data.file?.url || data.url)
        return url ? `<figure class="article-media ${data.stretched ? 'stretched' : ''}"><img src="${url}" alt="${escapeHtml(data.caption || '')}" loading="lazy">${data.caption ? `<figcaption>${DOMPurify.sanitize(data.caption)}</figcaption>` : ''}</figure>` : ''
      }
      case 'embed': {
        const url = safeUrl(data.embed || data.source)
        return url ? `<figure class="article-embed"><iframe src="${url}" title="${escapeHtml(data.caption || 'Embedded media')}" loading="lazy" allowfullscreen></iframe>${data.caption ? `<figcaption>${DOMPurify.sanitize(data.caption)}</figcaption>` : ''}</figure>` : ''
      }
      case 'raw': return `<div class="article-custom">${DOMPurify.sanitize(data.html || '', { USE_PROFILES: { html: true }, FORBID_TAGS: ['script','style','form','input','button','iframe','object','embed'], FORBID_ATTR: ['onerror','onload','onclick','style'] })}</div>`
      default: return ''
    }
  }).join('')
}

export function emptyChannelCard() {
  return `<article class="channel-card channel-card--empty"><img src="/assets/images/ChannelInterference.gif" alt=""><span>Coming soon</span></article>`
}

export function articleCard(article, featured = false) {
  const image = article.cover_url || '/assets/images/ChannelInterference.gif'
  const category = channelCategories[article.category]?.label || 'Studio'
  return `<a class="channel-card ${featured ? 'channel-card--featured' : ''}" href="/channel/${escapeHtml(article.slug)}/" data-route><img src="${escapeHtml(image)}" alt=""><span class="channel-card__shade"></span><span class="channel-card__meta">${escapeHtml(category)} · ${new Date(article.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span><strong>${escapeHtml(article.title)}</strong></a>`
}

export async function hydrateChannelIndex() {
  const latest = document.querySelector('[data-channel-latest]')
  try {
    const articles = await getPublishedArticles(true)
    latest.innerHTML = articles[0] ? articleCard(articles[0], true) : emptyChannelCard()
    Object.keys(channelCategories).forEach(category => {
      const target = document.querySelector(`[data-channel-category="${category}"]`)
      const matches = articles.filter(article => article.category === category)
      target.innerHTML = matches.length ? matches.map(article => articleCard(article)).join('') : emptyChannelCard()
    })
  } catch {
    latest.innerHTML = emptyChannelCard()
    document.querySelectorAll('[data-channel-category]').forEach(target => { target.innerHTML = emptyChannelCard() })
  }
}

export async function hydrateHomeChannel(partners = false) {
  const target = document.querySelector('[data-home-channel]')
  if (!target) return
  try {
    const articles = await getPublishedArticles()
    const relevant = partners ? articles.filter(article => article.category === 'fr-partners') : articles.filter(article => article.category !== 'fr-partners')
    target.innerHTML = relevant.length ? relevant.slice(0, 2).map(article => articleCard(article)).join('') : emptyChannelCard()
  } catch { target.innerHTML = emptyChannelCard() }
}

export async function hydrateArticle(slug, applySeo) {
  const target = document.querySelector('[data-article-shell]')
  try {
    const article = await getArticle(slug)
    if (!article) {
      target.innerHTML = '<div class="article-missing"><h1>Transmission not found.</h1><a href="/channel/" data-route>Return to FR Channel</a></div>'
      applySeo({ title: 'Article not found | FR Channel', description: 'This FR Channel article could not be found.', canonical: location.href, robots: 'noindex, follow' })
      return
    }
    const category = channelCategories[article.category]?.label || 'Studio'
    target.innerHTML = `<article class="channel-article"><nav aria-label="Breadcrumb"><a href="/channel/" data-route>FR Channel</a><span>•</span><span>${escapeHtml(category)}</span><span>•</span><span>${escapeHtml(article.title)}</span></nav><header><p>${escapeHtml(category)}</p><h1>${escapeHtml(article.title)}</h1><time datetime="${escapeHtml(article.published_at)}">${new Date(article.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</time></header>${article.cover_url ? `<img class="channel-article__cover" src="${escapeHtml(article.cover_url)}" alt="">` : ''}<div class="channel-article__body">${renderArticleBlocks(article.content)}</div></article>`
    applySeo({ title: `${article.title} | FR Channel`, description: article.excerpt, canonical: `https://flatreality.eu/channel/${article.slug}/`, image: article.cover_url, type: 'article' })
  } catch {
    target.innerHTML = '<div class="article-missing"><h1>Signal interrupted.</h1><p>Please try again shortly.</p></div>'
  }
}
