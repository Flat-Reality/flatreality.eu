import { caseStudyProjects, caseStudyPath } from './case-studies-data.js'
import media from './case-study-media.json' with { type: 'json' }

const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
const external = '<span class="ext" aria-hidden="true"><img src="/assets/icons/LinkIcon.png" alt=""></span>'
const list = items => `<ul>${items.map(item => `<li>${escape(item)}</li>`).join('')}</ul>`
export const findCaseStudy = slug => caseStudyProjects.find(project => project.slug === slug)
export const caseStudyCover = project => media[project.slug]?.cover || ''

export function caseStudyBody(project) {
  const assets = media[project.slug]
  const next = caseStudyProjects[(caseStudyProjects.indexOf(project) + 1) % caseStudyProjects.length]
  return `<nav class="case-breadcrumb" aria-label="Breadcrumb"><a href="/partners/case-studies/" data-route>Case Studies</a><span aria-hidden="true">—</span><span aria-current="page">${escape(project.title)}</span></nav>
    <article class="case-article">
      <header class="case-hero"><p>${escape(project.discipline)}</p><h1>${escape(project.title)}</h1><h2>${escape(project.headline)}</h2><p class="case-hero__description">${escape(project.description)}</p>${assets ? `<img class="case-hero__image" src="${assets.cover}" alt="${escape(project.title)} official key visual" fetchpriority="high">` : '<div class="case-phase-preview" aria-label="Day and night gameplay structure"><span>DAY<br><b>Build. Prepare.</b></span><span>NIGHT<br><b>Defend. Survive.</b></span></div>'}</header>
      <section class="case-facts" aria-label="Project facts"><dl>${[['Client', project.client], ['Engagement', project.relationship], ['Team', project.team], ['Engine', project.engine], ['Work period', project.period], ['Project status', project.status], ['Platform', project.platform], ['Genre', project.genre]].map(([name,value]) => `<div><dt>${name}</dt><dd>${escape(value)}</dd></div>`).join('')}</dl></section>
      <nav class="case-sections" aria-label="Case study sections"><a href="#overview">Overview</a><a href="#approach">Approach</a><a href="#deliverables">Deliverables</a><a href="#outcome">Outcome</a>${assets ? '<a href="#project-media">Media</a>' : ''}</nav>
      <section class="case-section case-overview" id="overview"><h2>The project.</h2><div><p class="case-lead">${escape(project.overview)}</p><h3>The challenge</h3><p>${escape(project.challenge)}</p></div></section>
      <section class="case-section case-approach" id="approach"><header><h2>Designed around<br>the challenge.</h2></header><div>${project.solutions.map((solution,index) => `<article><span class="case-number">${String(index+1).padStart(2,'0')}</span><div><h3>${escape(solution.title)}</h3><p>${escape(solution.text)}</p>${list(solution.items)}</div></article>`).join('')}</div></section>
      ${project.roadmap ? `<section class="case-section case-roadmap"><header><h2>A roadmap<br>with room to grow.</h2><p>Three proposed phases, with the MVP as the starting point.</p></header><ol>${project.roadmap.map((phase,index)=>`<li><span>0${index+1}</span><h3>${escape(phase.title)}</h3><p>${escape(phase.text)}</p></li>`).join('')}</ol></section>` : ''}
      <section class="case-section case-deliverables" id="deliverables"><header><h2>What we delivered.</h2><p>Flat Reality’s scope within this project.</p></header>${list(project.deliverables)}</section>
      <section class="case-section case-process"><header><h2>From brief<br>to delivery.</h2></header><div><ol>${project.process.map((step,index)=>`<li><span>${String(index+1).padStart(2,'0')}</span>${escape(step)}</li>`).join('')}</ol><h3>Quality throughout</h3><p>${escape(project.quality)}</p></div></section>
      <section class="case-section case-outcome" id="outcome"><h2>The outcome.</h2><p class="case-lead">${escape(project.outcome)}</p>${project.metrics ? `<dl class="case-metrics">${project.metrics.map(metric=>`<div><dt>${escape(metric.label)}</dt><dd>${escape(metric.value)}</dd></div>`).join('')}</dl><p class="case-metric-note">${escape(project.metricNote)}</p>` : ''}</section>
      ${assets ? `<section class="case-section case-media" id="project-media"><header><h2>See the project.</h2><p>Official project media. Screenshots and trailers show the complete game; the work described above defines our contribution.</p></header><div class="case-trailers">${assets.trailers.map((trailer,index)=>`<a href="${project.youtube && index===0 ? `https://www.youtube.com/watch?v=${project.youtube}` : trailer.url}" target="_blank" rel="noopener noreferrer"><img loading="lazy" src="${trailer.poster}" alt=""><span><b>${escape(trailer.title)}</b><small>Watch official trailer ${external}</small></span></a>`).join('')}</div><div class="case-gallery">${assets.screenshots.map((src,index)=>`<a href="${src}" data-case-image aria-label="Enlarge ${escape(project.title)} screenshot ${index+1}"><img loading="lazy" decoding="async" src="${src}" alt="${escape(project.title)} — official gameplay screenshot ${index+1}" width="1920" height="1080"></a>`).join('')}</div><div class="case-project-links"><a class="outline" href="${assets.storeUrl}" target="_blank" rel="noopener noreferrer">View on Steam ${external}</a>${(project.links||[]).map(link=>`<a class="outline" href="${link.url}" target="_blank" rel="noopener noreferrer">${escape(link.label)} ${external}</a>`).join('')}</div></section>` : ''}
      <section class="case-section case-cta"><div><h2>Let's build<br>what comes next.</h2><p>Tell us about your project and the support you need.</p><a class="outline outline--white" href="/partners/outsourcing/new-inquiry/" data-route>Start a Project</a></div><a href="${caseStudyPath(next.slug)}" data-route><small>Next case study</small><strong>${escape(next.title)}</strong>${external}</a></section>
    </article>`
}

export function caseStudyPage(project, { header, footer }) {
  return `<div class="site partners case-study" id="top">${header(true)}<main class="page-surface">${caseStudyBody(project)}</main>${footer()}<dialog class="case-lightbox" aria-label="Project screenshot"><button type="button" aria-label="Close image">×</button><img alt=""></dialog></div>`
}

export function portfolioBody() {
  const card = (project, featured=false) => `<a class="channel-card ${featured ? 'channel-card--featured' : ''} ${!media[project.slug] ? 'case-card--concept' : ''}" href="${caseStudyPath(project.slug)}" data-route>${media[project.slug] ? `<img src="${media[project.slug].cover}" alt="${escape(project.title)}" loading="lazy">` : '<span class="case-card__concept">DAY / NIGHT<br>STRATEGY & SURVIVAL</span>'}<span class="channel-card__shade"></span><strong>${escape(project.title)} ${external}</strong></a>`
  return `<section class="channel-index-hero"><h1>Case Study</h1></section><section class="channel-latest"><header><h2>Featured Case Study</h2></header><div data-channel-latest>${card(findCaseStudy('cup-or-die'),true)}</div></section>${[{title:'Client Projects',projects:caseStudyProjects.filter(p=>p.relationship.startsWith('Client'))},{title:'Studio Productions',projects:caseStudyProjects.filter(p=>p.relationship.startsWith('Internal'))}].map(group=>`<section class="channel-category"><header><img src="/assets/icons/PartnersIcon.png" alt=""><h2>${group.title}</h2></header><div class="channel-grid">${group.projects.map(p=>card(p)).join('')}</div></section>`).join('')}`
}

export function portfolioPage({header,footer}) {
  return `<div class="site partners channel-index portfolio-index" id="top">${header(true)}<main class="page-surface">${portfolioBody()}</main>${footer()}</div>`
}

export function initCaseStudy() {
  const dialog = document.querySelector('.case-lightbox')
  if (!dialog) return
  let opener
  const close = () => { dialog.close(); opener?.focus() }
  dialog.querySelector('button').addEventListener('click',close)
  dialog.addEventListener('click',event=>{if(event.target===dialog)close()})
  document.querySelectorAll('[data-case-image]').forEach(link=>link.addEventListener('click',event=>{
    event.preventDefault(); opener=link
    const image=dialog.querySelector('img'); image.src=link.href; image.alt=link.querySelector('img').alt
    dialog.showModal()
  }))
}
