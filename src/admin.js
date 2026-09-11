import { CHANNEL_ADMIN_ENDPOINT } from './lib/supabase-config.js'

let adminPassword = ''
let editor
let currentArticle = null
let cover = { url: '', path: '' }
let customSlug = false

function localDateValue(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 16)
}

function updatePublicationMode() {
  const input = document.querySelector('[name=published_at]')
  const scheduled = input.value && new Date(input.value).getTime() > Date.now()
  document.querySelector('[data-publication-mode]').textContent = scheduled ? 'Will be published automatically at the selected time.' : 'Publishes immediately with the selected date.'
  document.querySelector('.admin-publish').textContent = scheduled ? 'Schedule transmission' : 'Publish transmission'
  return scheduled
}

async function adminRequest(body, options = {}) {
  const response = await fetch(CHANNEL_ADMIN_ENDPOINT, {
    method: 'POST',
    headers: { 'x-channel-password': adminPassword, ...(options.headers || {}) },
    body: options.raw ? body : JSON.stringify(body)
  })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(result.error || 'The request failed.')
  return result
}

async function uploadMedia(file) {
  const form = new FormData()
  form.append('action', 'upload')
  form.append('file', file)
  return adminRequest(form, { raw: true })
}

function slugify(value) {
  return value.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 96)
}

function plainText(output) {
  const holder = document.createElement('div')
  const parts = (output.blocks || []).flatMap(block => {
    if (block.type === 'list') return (block.data.items || []).map(item => typeof item === 'string' ? item : item.content)
    if (block.type === 'image' || block.type === 'delimiter') return []
    return [block.data?.text || block.data?.caption || '']
  })
  holder.innerHTML = parts.join(' ')
  return (holder.textContent || '').replace(/\s+/g, ' ').trim()
}

function showNotice(message, error = false) {
  const notice = document.querySelector('[data-admin-notice]')
  notice.textContent = message
  notice.classList.toggle('error', error)
}

function showDeliveryAnimation(status) {
  const overlay = document.querySelector('[data-publish-overlay]')
  overlay.querySelector('strong').textContent = status === 'draft' ? 'Draft saved.' : status === 'scheduled' ? 'Scheduled.' : 'Sent.'
  overlay.classList.add('visible')
  setTimeout(() => overlay.classList.remove('visible'), 1500)
}

async function createEditor(data) {
  const [{ default: EditorJS }, { default: Header }, { default: EditorjsList }, { default: Delimiter }, { default: ImageTool }, { default: Embed }, { default: RawTool }, { default: Quote }] = await Promise.all([
    import('@editorjs/editorjs'), import('@editorjs/header'), import('@editorjs/list'), import('@editorjs/delimiter'),
    import('@editorjs/image'), import('@editorjs/embed'), import('@editorjs/raw'), import('@editorjs/quote')
  ])
  editor = new EditorJS({
    holder: 'channel-editor',
    placeholder: 'Tell the story…',
    data: data || { blocks: [{ type: 'paragraph', data: { text: '' } }] },
    inlineToolbar: ['bold', 'italic', 'link'],
    tools: {
      header: { class: Header, config: { levels: [2, 3, 4], defaultLevel: 2 } },
      list: { class: EditorjsList, inlineToolbar: true },
      delimiter: Delimiter,
      quote: { class: Quote, inlineToolbar: true },
      embed: { class: Embed, config: { services: { youtube: true, vimeo: true, twitch: true } } },
      raw: RawTool,
      image: {
        class: ImageTool,
        config: {
          types: 'image/jpeg,image/png,image/webp,image/gif',
          uploader: {
            uploadByFile: uploadMedia,
            uploadByUrl: async url => ({ success: 1, file: { url } })
          }
        }
      }
    }
  })
  await editor.isReady
}

function renderArticleList(articles) {
  const list = document.querySelector('[data-admin-articles]')
  if (!articles.length) {
    list.innerHTML = '<p class="admin-empty">No drafts or posts yet.</p>'
    return
  }
  list.replaceChildren(...articles.map(article => {
    const button = document.createElement('button')
    button.type = 'button'
    button.dataset.articleId = article.id
    const label = document.createElement('span')
    const title = document.createElement('b')
    const category = document.createElement('small')
    const status = document.createElement('em')
    title.textContent = article.title
    category.textContent = article.category.replace('-', ' ')
    status.textContent = article.status
    status.className = article.status
    label.append(title, category)
    button.append(label, status)
    return button
  }))
  list.querySelectorAll('[data-article-id]').forEach(button => {
    button.onclick = () => loadArticle(articles.find(article => article.id === button.dataset.articleId))
  })
}

async function refreshArticles() {
  const { articles } = await adminRequest({ action: 'list' })
  renderArticleList(articles || [])
}

async function loadArticle(article) {
  currentArticle = article
  customSlug = true
  cover = { url: article.cover_url || '', path: article.cover_path || '' }
  document.querySelector('[name=title]').value = article.title
  document.querySelector('[name=category]').value = article.category
  document.querySelector('[name=slug]').value = article.slug
  document.querySelector('[name=published_at]').value = localDateValue(article.published_at || new Date())
  document.querySelector('[name=rain-heart]').checked = article.delivery_channels?.includes('rain-heart') || false
  document.querySelector('[name=the-nick]').checked = article.delivery_channels?.includes('the-nick') || false
  const preview = document.querySelector('[data-cover-preview]')
  preview.innerHTML = cover.url ? `<img src="${cover.url}" alt="">` : '<span>Cover image</span>'
  await editor.render(article.content)
  document.querySelector('[data-editor-heading]').textContent = article.status === 'draft' ? 'Edit draft' : 'Edit post'
  updatePublicationMode()
  scrollTo({ top: 0, behavior: 'smooth' })
}

function newArticle() {
  currentArticle = null
  customSlug = false
  cover = { url: '', path: '' }
  document.querySelector('[data-channel-form]').reset()
  document.querySelector('[name=website]').checked = true
  document.querySelector('[name=published_at]').value = localDateValue()
  document.querySelector('[data-cover-preview]').innerHTML = '<span>Cover image</span>'
  document.querySelector('[data-editor-heading]').textContent = 'Create a transmission'
  editor.render({ blocks: [{ type: 'paragraph', data: { text: '' } }] })
  updatePublicationMode()
}

async function saveArticle(status) {
  const form = document.querySelector('[data-channel-form]')
  if (status === 'published' && !form.reportValidity()) return
  if (status === 'draft' && !form.elements.title.value.trim()) form.elements.title.value = 'Untitled transmission'
  if (!form.elements.slug.value.trim()) form.elements.slug.value = slugify(form.elements.title.value)
  const scheduled = status === 'published' && updatePublicationMode()
  showNotice(status === 'draft' ? 'Saving draft…' : scheduled ? 'Scheduling…' : 'Publishing…')
  try {
    const content = await editor.save()
    const excerpt = plainText(content).slice(0, 320) || (status === 'draft' ? 'Draft in progress.' : '')
    if (!excerpt) throw new Error('Write at least one paragraph before publishing.')
    const delivery = ['website']
    if (form.elements['rain-heart'].checked) delivery.push('rain-heart')
    if (form.elements['the-nick'].checked) delivery.push('the-nick')
    const { article } = await adminRequest({
      action: 'save', id: currentArticle?.id, status,
      title: form.elements.title.value,
      category: form.elements.category.value,
      slug: form.elements.slug.value,
      excerpt, content,
      cover_url: cover.url, cover_path: cover.path,
      published_at: new Date(form.elements.published_at.value).toISOString(),
      delivery_channels: delivery
    })
    currentArticle = article
    showNotice(status === 'draft' ? 'Draft saved.' : article.status === 'scheduled' ? `Scheduled for ${new Date(article.published_at).toLocaleString()}.` : `Published at /channel/${article.slug}/`)
    showDeliveryAnimation(status === 'draft' ? 'draft' : article.status)
    await refreshArticles()
  } catch (error) { showNotice(error.message, true) }
}

async function openWorkspace() {
  document.querySelector('[data-admin-login]').hidden = true
  document.querySelector('[data-admin-workspace]').hidden = false
  await createEditor()
  await refreshArticles()
  const form = document.querySelector('[data-channel-form]')
  const title = form.elements.title
  const slug = form.elements.slug
  const publicationDate = form.elements.published_at
  publicationDate.value = localDateValue()
  publicationDate.addEventListener('input', updatePublicationMode)
  slug.addEventListener('input', () => { customSlug = true; slug.value = slugify(slug.value) })
  title.addEventListener('input', () => { if (!customSlug) slug.value = slugify(title.value) })
  form.addEventListener('submit', event => { event.preventDefault(); saveArticle('published') })
  document.querySelector('[data-save-draft]').onclick = () => saveArticle('draft')
  document.querySelector('[data-new-article]').onclick = newArticle
  document.querySelector('[data-cover-input]').onchange = async event => {
    const file = event.target.files[0]
    if (!file) return
    showNotice('Uploading cover…')
    try {
      const result = await uploadMedia(file)
      cover = { url: result.file.url, path: result.path }
      document.querySelector('[data-cover-preview]').innerHTML = file.type.startsWith('video/') ? `<video src="${cover.url}" muted autoplay loop></video>` : `<img src="${cover.url}" alt="">`
      showNotice('Cover uploaded.')
    } catch (error) { showNotice(error.message, true) }
  }
}

export async function initAdmin() {
  const login = document.querySelector('[data-admin-login-form]')
  login.addEventListener('submit', async event => {
    event.preventDefault()
    const button = login.querySelector('button')
    button.disabled = true
    button.textContent = 'Opening…'
    adminPassword = login.elements.password.value
    try {
      await adminRequest({ action: 'login' })
      login.reset()
      await openWorkspace()
    } catch (error) {
      adminPassword = ''
      document.querySelector('[data-login-error]').textContent = error.message
    } finally {
      button.disabled = false
      button.textContent = 'Enter workspace'
    }
  })
}
