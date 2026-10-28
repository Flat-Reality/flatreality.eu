import { caseStudies, services, workflowSteps } from './partners-outsourcing-data.js'
import { getInquiryDraft, mergeInquiryDraft, saveInquiryDraft, toggleInquiryService } from './partners-inquiry-store.js'

let controller

const escapeHtml = value => String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char])

const arrow = '<span aria-hidden="true">→</span>'
const external = '<span class="ext" aria-hidden="true"><img src="/assets/icons/LinkIcon.png" alt=""></span>'

function serviceCard(service) {
  return `<article class="outsourcing-service" data-service-card="${service.id}" tabindex="0" role="button" aria-label="View ${escapeHtml(service.title)} details">
    <div class="outsourcing-service__icon" ${service.iconLabel ? `role="img" aria-label="${service.iconLabel}"` : 'aria-hidden="true"'}>${service.icon}</div>
    <h3>${escapeHtml(service.title)}</h3>
    <p>${escapeHtml(service.shortDescription)}</p>
    <button type="button" data-toggle-service="${service.id}">Add to Inquiry</button>
  </article>`
}

function workCard(item) {
  return `<a class="game-card outsourcing-work-card ${!item.image ? 'case-card--concept' : ''}" href="${item.url}" ${item.internal ? 'data-route' : 'target="_blank" rel="noopener noreferrer"'}>${item.image ? `<img loading="lazy" src="${item.image}" alt="">` : '<span class="case-card__concept">DAY / NIGHT<br>STRATEGY & SURVIVAL</span>'}<strong>${escapeHtml(item.title)} ${external}</strong></a>`
}

export function outsourcingPage({ header, footer, partnersHref }) {
  const stepMarkup = workflowSteps.map((step, index) => `<article class="outsourcing-step ${index === 0 ? 'open' : ''}"><button type="button" aria-expanded="${index === 0}" aria-controls="outsourcing-step-${index}"><span>${String(index + 1).padStart(2, '0')}</span><b>${step.title}</b><i aria-hidden="true">+</i></button><div id="outsourcing-step-${index}"><p>${step.description}</p></div></article>`).join('')
  return `<div class="site partners outsourcing-page" id="top">${header(true)}<main class="page-surface">
    <section class="outsourcing-hero"><div><h1>Build more.<br>Without building a bigger team.</h1><p>Flexible game development services, built around your project.</p><a class="outline outline--white" href="#inquiry">Start a Project</a></div></section>

    <section class="outsourcing-section outsourcing-collaboration"><header><h2>Ways to Collaborate</h2><p>Every project is different. Choose the kind of support that works for you.</p></header><div class="collaboration-grid">
      <article><span aria-hidden="true">◇</span><h3>A Defined Deliverable</h3><b>One clear scope. One concrete result.</b><p>Perfect for game design documents, reviews, art assets, technical features and other focused tasks.</p><a href="${partnersHref('/outsourcing/new-inquiry')}" data-route data-collaboration="One-time Project">Start with a Deliverable ${arrow}</a></article>
      <article><span aria-hidden="true">▦</span><h3>A Production Module</h3><b>A coordinated part of your development.</b><p>From playable prototypes to production milestones, we can take ownership of a defined part of your project.</p><a href="${partnersHref('/outsourcing/new-inquiry')}" data-route data-collaboration="Production Module">Explore Production Support ${arrow}</a></article>
      <a class="collaboration-retainer" href="${partnersHref('/outsourcing/retainer-plus')}" data-route><video autoplay muted loop playsinline aria-hidden="true"><source src="/assets/videos/RetainerPlusBG.mp4" type="video/mp4"></video><span><h3>More than a one-off project.</h3><p>Need ongoing development capacity? Discover Retainer Plus for long-term collaboration and continuous production support.</p><b>Explore Retainer Plus ${external}</b></span></a>
    </div></section>

    <section class="outsourcing-section outsourcing-capabilities"><header><h2>Our Capabilities</h2><p>Explore the ways we can support your next project.</p></header><div class="outsourcing-service-grid">${services.map(serviceCard).join('')}</div></section>

    <section class="outsourcing-section outsourcing-work" id="selected-work"><header><div><h2>Selected Work</h2><p>Explore client collaborations and internal studio productions through our case studies.</p></div><div class="slider-controls" aria-label="Selected Work controls"><button type="button" data-work-prev aria-label="Previous case study">←</button><button type="button" data-work-next aria-label="Next case study">→</button></div></header><div class="wide-track outsourcing-work-track" data-work-track>${caseStudies.map(workCard).join('')}</div></section>

    <section class="outsourcing-tech" id="technology"><img class="outsourcing-tech__background" loading="lazy" src="/assets/images/PartnersTechnologyBackground.png" alt="Abstract glass shapes representing Flat Reality technology"><div class="outsourcing-tech__copy"><h2>Powered by Technology</h2><h3>Built with the tools we create.</h3><p>Our own technologies can complement custom development and simplify production where they fit your project.</p><a href="${partnersHref('/tech')}" data-route>Explore Technologies ${arrow}</a></div><div class="outsourcing-tech__products"><div class="outsourcing-tech__cards"><article><span><img src="/assets/icons/PhantomUIIcon.png" alt="Phantom UI"></span><b>Phantom UI</b></article><article><span><img src="/assets/icons/FRSDKIcon.png" alt="Flat Reality SDK"></span><b>Flat Reality SDK</b></article></div><div class="outsourcing-tech__support"><b>Need implementation support?</b><button type="button" data-toggle-service="implementation-support">+ Add to Inquiry</button></div></div></section>

    <section class="outsourcing-section outsourcing-process"><header><h2>How We Work</h2></header><div class="outsourcing-steps">${stepMarkup}</div></section>

    <section class="outsourcing-section outsourcing-retainer"><div><video autoplay muted loop playsinline aria-hidden="true"><source src="/assets/videos/RetainerPlusBG.mp4" type="video/mp4"></video><div><h2>Built for the long run.</h2><p>Looking for continuous collaboration rather than a one-off assignment? Discover Retainer Plus for ongoing development support.</p><a class="outline outline--white" href="${partnersHref('/outsourcing/retainer-plus')}" data-route>Explore Retainer Plus ${external}</a></div></div></section>

    <section class="outsourcing-section outsourcing-inquiry" id="inquiry"><header><h2>Start a Project</h2><p>Tell us what you're building. We'll help you find the right way forward.</p></header><div class="outsourcing-inquiry__entry"><label for="project-entry">Tell us about your project</label><textarea id="project-entry" rows="5" maxlength="4000" placeholder="A short description is enough for now." data-project-entry></textarea><div><span data-selected-summary>No services selected yet.</span><a class="outline" href="${partnersHref('/outsourcing/new-inquiry')}" data-route data-continue-inquiry>Continue to Inquiry ${arrow}</a></div></div><p class="outsourcing-email"><b>Prefer email?</b> <a href="mailto:partners@flatreality.eu">partners@flatreality.eu</a></p></section>

    <section class="outsourcing-section outsourcing-network"><div><h2>Looking for projects as an independent specialist?</h2><p>Join our network of independent creators and professionals working on meaningful game development projects.</p><a class="outline outline--white" href="https://www.linkedin.com/company/flatreality/jobs/" target="_blank" rel="noopener noreferrer">Become an Independent Partner ${external}</a></div></section>
  </main>${footer()}
  <div class="service-drawer-layer" data-service-drawer-layer hidden><button class="service-drawer-scrim" type="button" data-close-drawer aria-label="Close service details"></button><aside class="service-drawer" role="dialog" aria-modal="true" aria-labelledby="service-drawer-title"><button class="service-drawer__close" type="button" data-close-drawer aria-label="Close service details">×</button><div data-service-drawer-content></div></aside></div>
  </div>`
}

function updateSelection(root) {
  const selected = new Set(getInquiryDraft().selectedServices)
  root.querySelectorAll('[data-service-card]').forEach(card => {
    const active = selected.has(card.dataset.serviceCard)
    card.classList.toggle('selected', active)
    const button = card.querySelector('[data-toggle-service]')
    button.textContent = active ? 'Added to Inquiry ✓' : 'Add to Inquiry'
    button.setAttribute('aria-pressed', String(active))
  })
  root.querySelectorAll('[data-toggle-service="implementation-support"]').forEach(button => {
    const active = selected.has('implementation-support')
    button.classList.toggle('selected', active)
    button.textContent = active ? '✓ Added to Inquiry' : '+ Add to Inquiry'
    button.setAttribute('aria-pressed', String(active))
  })
  root.querySelectorAll('[data-selected-summary]').forEach(node => { node.textContent = selected.size ? `${selected.size} service${selected.size === 1 ? '' : 's'} selected.` : 'No services selected yet.' })
  const drawerButton = root.querySelector('.service-drawer [data-toggle-service]')
  if (drawerButton) {
    const active = selected.has(drawerButton.dataset.toggleService)
    drawerButton.textContent = active ? 'Remove from Inquiry' : 'Add to Inquiry'
    drawerButton.setAttribute('aria-pressed', String(active))
  }
  root.querySelector('[data-drawer-count]')?.replaceChildren(document.createTextNode(`${selected.size} selected`))
}

export function initOutsourcing() {
  controller?.abort()
  controller = new AbortController()
  const { signal } = controller
  const root = document.querySelector('.outsourcing-page')
  if (!root) return
  root.dataset.outsourcingReady = 'true'
  const layer = root.querySelector('[data-service-drawer-layer]')
  const drawer = root.querySelector('.service-drawer')
  const drawerContent = root.querySelector('[data-service-drawer-content]')
  let opener = null

  const closeDrawer = () => {
    layer.classList.remove('visible')
    setTimeout(() => { layer.hidden = true }, 260)
    document.documentElement.classList.remove('drawer-open')
    opener?.focus()
  }
  const openDrawer = (service, source) => {
    opener = source
    drawerContent.innerHTML = `<div class="service-drawer__icon" ${service.iconLabel ? `role="img" aria-label="${service.iconLabel}"` : 'aria-hidden="true"'}>${service.icon}</div><h2 id="service-drawer-title">${escapeHtml(service.title)}</h2><p>${escapeHtml(service.fullDescription)}</p><h3>Deliverables</h3><ul>${service.deliverables.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul><button class="outline" type="button" data-toggle-service="${service.id}"></button><footer><span data-drawer-count></span><a class="outline" href="/partners/outsourcing/new-inquiry/" data-route>Continue to Inquiry ${arrow}</a></footer>`
    layer.hidden = false
    requestAnimationFrame(() => layer.classList.add('visible'))
    document.documentElement.classList.add('drawer-open')
    updateSelection(root)
    drawer.querySelector('.service-drawer__close').focus()
  }

  root.querySelectorAll('[data-service-card]').forEach(card => {
    const service = services.find(item => item.id === card.dataset.serviceCard)
    const activate = event => {
      if (event.target.closest('[data-toggle-service]')) return
      if (event.type === 'keydown' && !['Enter', ' '].includes(event.key)) return
      event.preventDefault()
      openDrawer(service, card)
    }
    card.addEventListener('click', activate, { signal })
    card.addEventListener('keydown', activate, { signal })
    card.dataset.drawerReady = 'true'
  })
  root.addEventListener('click', event => {
    const toggle = event.target.closest('[data-toggle-service]')
    if (toggle) {
      event.preventDefault()
      event.stopPropagation()
      toggleInquiryService(toggle.dataset.toggleService)
      updateSelection(root)
      return
    }
    const card = event.target.closest('[data-service-card]')
    if (card) openDrawer(services.find(item => item.id === card.dataset.serviceCard), card)
  }, { signal })
  root.querySelectorAll('[data-close-drawer]').forEach(button => button.addEventListener('click', closeDrawer, { signal }))
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !layer.hidden) closeDrawer()
    if (event.key === 'Tab' && !layer.hidden) {
      const focusable = [...drawer.querySelectorAll('button,a[href]')]
      if (!focusable.length) return
      const first = focusable[0], last = focusable.at(-1)
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
  }, { signal })
  root.querySelectorAll('[data-collaboration]').forEach(link => link.addEventListener('click', () => { sessionStorage.setItem('fr_inquiry_direct_entry', '1'); mergeInquiryDraft({ collaborationModel: link.dataset.collaboration }) }, { signal }))
  const description = root.querySelector('[data-project-entry]')
  description.value = getInquiryDraft().projectDescription
  let saveTimer
  description.addEventListener('input', () => { clearTimeout(saveTimer); saveTimer = setTimeout(() => saveInquiryDraft({ projectDescription: description.value }), 280) }, { signal })
  root.querySelector('[data-continue-inquiry]').addEventListener('click', () => { sessionStorage.setItem('fr_inquiry_direct_entry', '1'); saveInquiryDraft({ projectDescription: description.value }) }, { signal })
  root.querySelectorAll('.outsourcing-step>button').forEach(button => button.addEventListener('click', () => {
    const article = button.parentElement
    const open = !article.classList.contains('open')
    article.classList.toggle('open', open)
    button.setAttribute('aria-expanded', String(open))
  }, { signal }))
  const track = root.querySelector('[data-work-track]')
  root.querySelector('[data-work-prev]').addEventListener('click', () => track.scrollBy({ left: -Math.min(track.clientWidth * .82, 760), behavior: 'smooth' }), { signal })
  root.querySelector('[data-work-next]').addEventListener('click', () => track.scrollBy({ left: Math.min(track.clientWidth * .82, 760), behavior: 'smooth' }), { signal })
  window.addEventListener('fr-inquiry-change', () => updateSelection(root), { signal })
  updateSelection(root)
}
