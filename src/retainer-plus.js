import { services } from './partners-outsourcing-data.js'
import { engagementModels, loadRetainerOfferings, retainerCategories, retainerTabs } from './retainer-plus-data.js'
import { getRetainerDraft, saveRetainerDraft } from './retainer-plus-store.js'

let controller
const escapeHtml = value => String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char])
const arrow = '<span aria-hidden="true">→</span>'

function supportCard(service) {
  return `<article class="retainer-support-card"><button type="button" aria-expanded="false"><span aria-hidden="true">${service.icon}</span><b>${escapeHtml(service.title)}</b><i aria-hidden="true">+</i></button><div><div><p>${escapeHtml(service.shortDescription)}</p><ul>${service.deliverables.slice(0, 5).map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul><button class="retainer-filter-link" type="button" data-support-filter="${service.id}">Explore related retainers ${arrow}</button></div></div></article>`
}

function offeringCard(item, selected, quantity = 1) {
  const quantityControl = item.type === 'specialist' ? `<label class="retainer-quantity"><span>Select quantity</span><select data-retainer-quantity="${item.id}" aria-label="Select quantity for ${escapeHtml(item.title)}">${Array.from({ length: 10 }, (_, index) => index + 1).map(value => `<option value="${value}" ${Number(quantity) === value ? 'selected' : ''}>${value}</option>`).join('')}</select></label>` : ''
  return `<article class="retainer-offer ${selected ? 'selected' : ''}" data-retainer-offer="${item.id}"><div><small>${escapeHtml(item.category)}</small><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p>${item.roles ? `<p class="retainer-offer__roles"><b>Configuration:</b> ${item.roles.map(escapeHtml).join(' · ')}</p>` : ''}<div class="retainer-tags">${item.tags.map(tag => `<span>${escapeHtml(tag)}</span>`).join('')}</div></div><div class="retainer-offer__actions">${quantityControl}<button type="button" data-toggle-retainer="${item.id}" aria-pressed="${selected}">${selected ? 'Added to Inquiry ✓' : 'Add to Inquiry +'}</button></div></article>`
}

const faq = [
  ["What's the difference between Outsourcing and Retainer Plus?", 'Outsourcing is designed around defined project deliverables, while Retainer Plus focuses on reserving ongoing production capacity.'],
  ['Can I work with more than one specialization?', 'Yes. You can combine multiple development areas in a single request.'],
  ['Can Flat Reality Partners recommend the team composition?', 'Yes. Our team can review your requirements and propose a suitable combination of specialists.'],
  ['Is account management included?', 'Yes. Account management and production coordination are included in the engagement model, subject to the agreed scope.'],
  ['What happens if a specialist becomes unavailable?', 'Flat Reality coordinates continuity and replacement arrangements according to the terms of your agreement.'],
  ['Are prices fixed?', 'No public rates are displayed. We prepare individual proposals based on requested services, capacity, duration and project requirements.'],
]

export function retainerPlusPage({ header, footer }) {
  return `<div class="site partners retainer-plus" id="top">${header(true)}<main class="page-surface">
    <section class="retainer-hero"><h1>Build the capacity<br>you need.</h1><p>We handle the rest. From individual specialists to coordinated production teams, Retainer Plus helps you expand your development capacity without expanding your overhead.</p><a class="outline" href="#available-retainers">Explore Available Retainers <span aria-hidden="true">↓</span></a></section>
    <section class="retainer-section retainer-support"><header><h2>What Can We Support?</h2><p>Explore the development areas we can support through flexible, ongoing collaboration.</p></header><div>${services.map(supportCard).join('')}</div></section>
    <section class="retainer-section retainer-how"><header><h2>How It Works</h2></header><div><article><span>01</span><h3>Configure Your Support</h3><p>Choose the services, engagement model and production capacity that fit your project.</p></article><article><span>02</span><h3>We Assemble Your Team</h3><p>We review your requirements and propose the right specialists or production team.</p></article><article><span>03</span><h3>Focus on Your Game</h3><p>We coordinate the agreed capacity, communication and production workflow.</p></article></div></section>
    <section class="retainer-section retainer-catalog" id="available-retainers"><header><h2>Available Retainers</h2><output data-retainer-selected-count></output></header><div class="retainer-tabs" role="tablist">${retainerTabs.map((tab, index) => `<button type="button" role="tab" aria-selected="${index === 0}" data-retainer-tab="${tab.id}">${tab.label}</button>`).join('')}</div><div class="retainer-catalog__layout"><nav aria-label="Retainer category">${retainerCategories.map((category, index) => `<button type="button" class="${index === 0 ? 'active' : ''}" data-retainer-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`).join('')}</nav><div data-retainer-results></div></div></section>
    <section class="retainer-section retainer-models"><header><h2>Engagement Models</h2></header><div>${engagementModels.map(model => `<article><h3>${model.title}</h3><p>${model.description}</p></article>`).join('')}</div><p>Need a defined, fixed-scope delivery? <a href="/partners/outsourcing/" data-route>Explore Outsourcing ${arrow}</a></p></section>
    <section class="retainer-section retainer-quote"><div><h2>Let's build your capacity.</h2><p>Tell us what you need. We'll review your requirements and prepare a proposal tailored to your project.</p><a class="outline outline--white" href="/partners/outsourcing/retainer-plus/new-inquiry/" data-route>Request a Quote ${arrow}</a></div></section>
    <section class="retainer-section retainer-faq"><header><h2>Frequently Asked Questions</h2></header><div>${faq.map(([question, answer]) => `<article><button type="button" aria-expanded="false"><b>${question}</b><i aria-hidden="true">+</i></button><div><p>${answer}</p></div></article>`).join('')}</div></section>
  </main>${footer()}</div>`
}

export async function initRetainerPlus() {
  controller?.abort()
  controller = new AbortController()
  const { signal } = controller
  const root = document.querySelector('.retainer-plus')
  if (!root) return
  const offerings = await loadRetainerOfferings()
  let draft = getRetainerDraft()
  let tab = 'specialist'
  let category = retainerCategories[0]
  const results = root.querySelector('[data-retainer-results]')
  const count = root.querySelector('[data-retainer-selected-count]')

  const renderOffers = () => {
    const filtered = offerings.filter(item => item.type === tab && item.category === category)
    count.textContent = draft.selectedOfferingIds.length ? `${draft.selectedOfferingIds.length} service${draft.selectedOfferingIds.length === 1 ? '' : 's'} selected` : ''
    results.innerHTML = filtered.length ? filtered.map(item => offeringCard(item, draft.selectedOfferingIds.includes(item.id), draft.offeringQuantities[item.id] || 1)).join('') : `<div class="retainer-empty"><h3>Nothing available in this category right now.</h3><p>We can still help you find the right production support.</p><a class="outline" href="/partners/outsourcing/retainer-plus/new-inquiry/?mode=custom">Request Custom Support ${arrow}</a></div>`
  }

  root.querySelectorAll('[data-retainer-tab]').forEach(button => button.addEventListener('click', () => {
    tab = button.dataset.retainerTab
    root.querySelectorAll('[data-retainer-tab]').forEach(item => item.setAttribute('aria-selected', String(item === button)))
    renderOffers()
  }, { signal }))
  root.querySelectorAll('[data-retainer-category]').forEach(button => button.addEventListener('click', () => {
    category = button.dataset.retainerCategory
    root.querySelectorAll('[data-retainer-category]').forEach(item => item.classList.toggle('active', item === button))
    renderOffers()
  }, { signal }))
  results.addEventListener('click', event => {
    const button = event.target.closest('[data-toggle-retainer]')
    if (!button) return
    const selected = new Set(draft.selectedOfferingIds)
    selected.has(button.dataset.toggleRetainer) ? selected.delete(button.dataset.toggleRetainer) : selected.add(button.dataset.toggleRetainer)
    const quantities = { ...draft.offeringQuantities }
    if (!selected.has(button.dataset.toggleRetainer)) delete quantities[button.dataset.toggleRetainer]
    else if (!quantities[button.dataset.toggleRetainer]) quantities[button.dataset.toggleRetainer] = 1
    draft = saveRetainerDraft({ selectedOfferingIds: [...selected], offeringQuantities: quantities })
    renderOffers()
  }, { signal })
  results.addEventListener('change', event => {
    const select = event.target.closest('[data-retainer-quantity]')
    if (!select) return
    draft = saveRetainerDraft({ offeringQuantities: { ...draft.offeringQuantities, [select.dataset.retainerQuantity]: Number(select.value) } })
  }, { signal })
  root.querySelectorAll('.retainer-support-card>button,.retainer-faq article>button').forEach(button => button.addEventListener('click', () => {
    const article = button.closest('article')
    const open = !article.classList.contains('open')
    article.classList.toggle('open', open)
    button.setAttribute('aria-expanded', String(open))
  }, { signal }))
  root.querySelectorAll('[data-support-filter]').forEach(button => button.addEventListener('click', () => {
    const map = { 'game-design-narrative': 'Game Design & Narrative', 'unity-development-prototyping': 'Programming', 'art-ui': 'Art', 'audio-sound': 'Sound & Music', 'production-management': 'Production', 'inclusive-design-accessibility': 'Inclusive Design & Accessibility' }
    category = map[button.dataset.supportFilter] || retainerCategories[0]
    tab = 'specialist'
    root.querySelectorAll('[data-retainer-tab]').forEach(item => item.setAttribute('aria-selected', String(item.dataset.retainerTab === tab)))
    root.querySelectorAll('[data-retainer-category]').forEach(item => item.classList.toggle('active', item.dataset.retainerCategory === category))
    renderOffers()
    root.querySelector('#available-retainers').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }, { signal }))
  renderOffers()
}
