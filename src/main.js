import './style.css'
import { independentPartnerPage, independentPartnerSeo } from './independent-partner.js'
import { initAnalytics } from './analytics.js'
initAnalytics()
import { channelCategories, emptyChannelCard, hydrateArticle, hydrateChannelIndex, hydrateHomeChannel } from './channel.js'
import { initOutsourcing, outsourcingPage } from './partners-outsourcing.js'
import { initInquiry, inquiryPage } from './partners-inquiry.js'
import { initRetainerPlus, retainerPlusPage } from './retainer-plus.js'
import { initRetainerInquiry, retainerInquiryPage } from './retainer-inquiry.js'
import privacyPolicyText from './privacy-policy-en.txt?raw'
import { caseStudyPage, findCaseStudy, caseStudyCover, initCaseStudy, portfolioPage } from './case-studies.js'

const A = '/assets'
const ext = `<span class="ext" aria-hidden="true"><img src="${A}/icons/LinkIcon.png" alt=""></span>`
const host = location.hostname.toLowerCase()
const localHost = host === 'localhost' || host === '127.0.0.1'
let pageEvents
let heroTimer

function studioHref(path = '/') {
  return localHost || host === 'flatreality.eu' || host === 'www.flatreality.eu' ? path : `https://flatreality.eu${path}`
}

function partnersHref(path = '/') {
  const [pathname,hash] = path.split('#')
  const suffix = pathname === '/' ? '/' : `${pathname.replace(/\/$/,'')}/`
  return `/partners${suffix}${hash ? `#${hash}` : ''}`
}

function typedLabel(text, offset = 0) {
  return [...text].map((letter,index)=>`<span style="--i:${index + offset}">${letter === ' ' ? '&nbsp;' : letter}</span>`).join('')
}

function brandTransition(fromPartners, navigate) {
  if (matchMedia('(max-width:800px)').matches) { navigate(); return }
  document.querySelector('.brand-transition')?.remove()
  const overlay=document.createElement('div')
  overlay.className=`brand-transition ${fromPartners ? 'brand-transition--partners' : 'brand-transition--studio'}`
  overlay.innerHTML=`<div class="brand-transition__lockup"><img src="${A}/logos/${fromPartners ? 'LogoBlackTransparent.png' : 'StudioLogo.png'}" alt=""><div class="brand-transition__name" aria-label="${fromPartners ? 'Flat Reality Partners' : 'Flat Reality'}"><strong>${typedLabel('Flat Reality')}</strong>${fromPartners ? `<b>${typedLabel('Partners',13)}</b>` : ''}</div></div>`
  document.body.append(overlay)
  requestAnimationFrame(()=>overlay.classList.add('active'))
  setTimeout(navigate,1250)
  setTimeout(()=>overlay.classList.add('leaving'),1850)
  setTimeout(()=>overlay.remove(),2350)
}

function header(partners = false) {
  const gamesActive = !partners && (
    location.pathname.toLowerCase().startsWith('/games') ||
    host === 'thenick.flatreality.eu' ||
    host === 'rainheart.flatreality.eu'
  )
  return `<header class="header ${partners ? 'header--partners' : ''}" data-header>
    <a class="brand" href="${partners ? partnersHref('/') : studioHref('/')}" data-route><span class="brand-glow"><img src="${partners ? `${A}/logos/LogoBlackTransparent.png` : `${A}/logos/StudioLogo.png`}" alt=""></span><span>Flat Reality${partners ? ' <b>Partners</b>' : ''}</span></a>
    <nav class="nav"><a class="${!partners && !gamesActive ? 'active' : ''}" href="${studioHref('/')}" data-route>Studio</a><a class="${gamesActive ? 'active' : ''}" href="${studioHref('/games')}" data-menu="games" data-route>Games</a><a class="${partners ? 'active' : ''}" href="${partnersHref('/')}" data-menu="partners" data-route>FR Partners</a><a href="https://www.linkedin.com/company/flatreality/jobs/" target="_blank" rel="noopener noreferrer" data-menu="careers">Careers</a></nav>
    <button class="burger" aria-label="Open navigation" aria-expanded="false"><i></i><i></i></button>
    <div class="mega" data-mega="games"><small>Games</small><a href="https://thenick.flatreality.eu" target="_blank">The Nick ${ext}</a><a href="https://store.steampowered.com/app/4397540/RAIN_HEART/" target="_blank">RAIN HEART ${ext}</a></div>
    <div class="mega" data-mega="partners"><small>FR Partners</small><a href="${partnersHref('/outsourcing')}" data-route>Outsourcing</a><a href="${partnersHref('/tech')}" data-route>Technologies</a><a href="${partnersHref('/#network')}" data-route>Network</a></div>
    <div class="mega" data-mega="careers"><small>Careers</small><a href="https://www.linkedin.com/company/flatreality/jobs/" target="_blank" rel="noopener noreferrer">Browse open roles ${ext}</a><a href="${partnersHref('/network/independent-partner')}" data-route>Prefer independent collaboration? Explore our Partner Network ${ext}</a></div>
    <div class="mobile-nav"><a href="${studioHref('/')}" data-route>Studio</a><a href="${studioHref('/channel/')}" data-route>FR Channel</a><a href="https://thenick.flatreality.eu">The Nick</a><a href="https://rainheart.flatreality.eu">RAIN HEART</a><a href="${partnersHref('/')}" data-route>FR Partners</a><a href="https://www.linkedin.com/company/flatreality/jobs/">Careers</a><a href="${partnersHref('/network/independent-partner')}" data-route>Independent Partner</a></div>
  </header>`
}

function footer() {
  return `<footer class="footer" data-footer><div class="footer-brand"><img src="${A}/logos/LightTransparentLogo.png" alt=""><b>Flat Reality</b></div><div class="footer-cols"><div><h3>Sitemap</h3><a href="${studioHref('/')}" data-route>Studio</a><a href="${studioHref('/games/')}" data-route>Games</a><a href="${studioHref('/channel/')}" data-route>FR Channel</a><a href="${partnersHref('/')}" data-route>FR Partners</a></div><div><h3>Get Help</h3><a href="mailto:contact@flatreality.eu">Contact</a><a href="${studioHref('/privacy/')}" data-route>Privacy</a></div><div><h3>Our socials</h3><a href="https://www.linkedin.com/company/flatreality/" target="_blank">LinkedIn</a><a href="https://instagram.com/flat.reality" target="_blank">Instagram</a><a href="https://bsky.app/profile/flatreality.bsky.social" target="_blank">Bluesky</a><a href="https://www.tiktok.com/@flat.reality" target="_blank">TikTok</a><a href="https://discord.flatreality.eu" target="_blank">Discord</a><a href="https://www.youtube.com/channel/UCLTCUyuodEMx6v9jFJLUylg" target="_blank">YouTube</a><a href="https://www.threads.com/@flat.reality" target="_blank">Threads</a></div><div class="footer-place"><h3>Location</h3><a href="https://maps.google.com/?q=Madrid%2C+Spain">Madrid ${ext}</a></div></div><p class="copyright">© FLAT REALITY ENTERTAINMENT GROUP 2019 - 2026. All trademarks are the property of their respective owners.</p></footer>`
}

function channel(partners = false) {
  const categoryLink = (slug, label, active) => `<a href="/channel/#${slug}" data-route>${active ? `<b>${label}</b>` : label}</a>`
  return `<section class="channel"><h2>Flat Reality <em>Channel</em></h2><div class="channel-row"><nav>${categoryLink('studio', 'Studio', !partners)}${categoryLink('the-nick', 'The Nick', false)}${categoryLink('rain-heart', 'RAIN HEART', false)}${categoryLink('fr-partners', 'FR Partners', partners)}</nav><a class="outline small" href="/channel/" data-route>Explore more</a></div><div class="channel-track" data-home-channel>${emptyChannelCard()}</div></section>`
}

function studio() {
  return `<div class="site studio" id="top">${header()}<main class="page-surface">
    <section class="hero" data-hero><article class="hero-slide active"><img src="${A}/images/TheNickCover.jpeg" alt=""><div class="scrim"></div><div class="studio-hero-copy"><img src="${A}/logos/TheNickLogo.png" alt="The Nick"><h1>Meta Horror is awaiting an update...</h1><a class="outline outline--white" href="https://thenick.flatreality.eu" target="_blank">Jump to website</a></div></article><article class="hero-slide hero-slide--rain"><img src="${A}/images/RAINHEARTCover.jpg" alt="RAIN HEART"><div class="scrim"></div><div class="studio-hero-copy rain-hero-copy"><img src="${A}/logos/RAINHEARTLogo.png" alt="RAIN HEART"><h1>Teaser announcement for a new psychological horror about identity</h1><a class="outline outline--white" href="https://store.steampowered.com/app/4397540/RAIN_HEART/" target="_blank">Learn More</a></div></article></section>
    <section class="made"><h2>Made by <em>us</em></h2><div class="wide-track"><a class="game-card" href="https://thenick.flatreality.eu" target="_blank"><video autoplay muted loop playsinline poster="${A}/images/TheNickCover.jpeg"><source src="${A}/videos/TheNick.MP4" type="video/mp4"></video><span class="platforms"><img src="${A}/icons/windows-white-icon 1.png"><img src="${A}/icons/SteamDeckLightIcon.png"><img src="${A}/icons/AppleLightIcon.png"></span><strong>The Nick: Chapter 1 ${ext}</strong></a><a class="game-card" href="https://store.steampowered.com/app/4397540/RAIN_HEART/" target="_blank"><img src="${A}/images/RAINHEARTCover.jpg" alt="RAIN HEART"><b class="coming">Coming In 2027</b><strong>RAIN HEART ${ext}</strong></a></div></section>
    <section class="motto"><img src="${A}/images/MAD_GAMES_SHOW-SABADO-TARDE-2539-scaled.jpg" alt=""><div></div><h2>Games Should Say<br>Something</h2></section>
    <section class="about"><h2>Independent Expressive <em>Games</em></h2><div class="about-copy"><p>Founded in 2019, Flat Reality is an european game studio creating expressive games that leave a lasting impression.</p><p>We believe games are one of the most powerful forms of storytelling. Through gameplay, atmosphere, music, and narrative, we create experiences that explore meaningful ideas and evoke genuine emotion.</p><p>Every project begins with the same simple belief that games should say something.</p></div><h2 class="values-title">What Sets Us <em>Apart</em></h2><div class="values"><article><h3>To Tell Something</h3><p>Every game deserves a reason to exist. We create experiences that leave players with something to think about long after the credits roll.</p></article><article><h3>Be genuinely expressive</h3><p>We value honest ideas over safe ideas. The games we make should reflect curiosity, emotion, and a clear creative voice.</p></article><article><h3>People Come First</h3><p>Behind every great game are people. We foster a culture of respect, trust, and support where everyone has the freedom to do their best work.</p></article><article><h3>Build With Integrity</h3><p>Every game deserves a reason to exist. We create experiences that leave players with something to think about long after the credits roll.</p></article></div></section>
    <section class="location"><video autoplay muted loop playsinline><source src="${A}/videos/Madrid.mp4" type="video/mp4"></video><div class="scrim"></div><div><h2>Madrid, Spain</h2><p><b>Location • Headquarters</b><br><br>Here, under the sunny skies, is where our headquarters are located. Embracing culture and diversity, we are inspired to create and work.</p></div></section>
    ${channel(false)}
  </main>${footer()}</div>`
}

function partnerCard(title, href, media = '', cls = '') { return `<a class="service-card ${cls}" href="${href}" data-route>${media}<strong>${title} ${ext}</strong></a>` }

function partners() {
  return `<div class="site partners" id="top">${header(true)}<main class="page-surface">
    <section class="partners-hero"><video autoplay muted loop playsinline><source src="${A}/videos/PartnersIntro.mp4" type="video/mp4"></video><div class="scrim"></div><div class="partners-hero-copy"><h1>Create More.<br>Manage Less.</h1><a class="outline outline--white" href="#contact">Contact us</a></div><nav><a href="#outsourcing">Outsourcing ${ext}</a><a href="#technologies">Technologies ${ext}</a><a href="#network">Network ${ext}</a></nav></section>
    <section class="partner-intro"><h2>Designed for creative work</h2><p>Flat Reality Partners is the B2B division of Flat Reality, helping game studios and creative teams build better products through modular services, technologies and trusted partnerships. From game development and Unity tools to production infrastructure, we create solutions that let creators focus on creating—not managing.</p><div class="logos"><img src="${A}/logos/Microsoft logo 1.png"><img src="${A}/logos/ID@Xbox logo 1.png"><img src="${A}/logos/Valve logo 1.png"><img src="${A}/logos/Unity Logo.png"><img src="${A}/logos/new-XBOX-logo-black-png-large-size 1.png"><b>GS</b><b>ST–RV</b></div></section>
    <section class="services" id="outsourcing"><header><img src="${A}/icons/PartnersIcon.png"><h2>Outsourcing</h2></header><p>Flexible game development and production support.</p><div class="service-track">${partnerCard('Browse our services',partnersHref('/outsourcing'))}${partnerCard('Retainer+',partnersHref('/outsourcing/retainer-plus'),`<video autoplay muted loop playsinline><source src="${A}/videos/RetainerPlusBG.mp4" type="video/mp4"></video>`,'dark')}</div></section>
    <section class="services" id="technologies"><header><img src="${A}/icons/PartnersIcon.png"><h2>Technologies</h2></header><p>Tools that simplify development and empower creators.</p><div class="service-track">${partnerCard('Phantom UI: Dialogue System',partnersHref('/tech/phantomui'),'<i class="phantom"></i>','dark')}${partnerCard('Emerald Core',partnersHref('/tech'),'<i class="emerald"></i>')}</div></section>
    <section class="services" id="network"><header><img src="${A}/icons/PartnersIcon.png"><h2>Network</h2></header><p>A trusted ecosystem of independent professionals and partners.</p><div class="service-track">${partnerCard('Apply to be an Independent Partner',partnersHref('/network/independent-partner'),`<img src="${A}/images/IPkeyart.png" alt="An independent creator facing a city of tall architectural structures">`)}${partnerCard('Browse our Careers','https://www.linkedin.com/company/flatreality/jobs/')}</div></section>
    <section class="contact" id="contact"><h2>Contact us directly</h2><a href="mailto:contact@flatreality.eu"><img src="${A}/icons/EmailDarkIcon.png"><span>contact@flatreality.eu</span>${ext}</a><a href="https://www.upwork.com/agencies/1978795012604336421/" target="_blank"><img src="${A}/icons/upwork_icon_231982 1.png"><span>Flat Reality Partners</span>${ext}</a></section>
    ${channel(true)}
  </main>${footer()}</div>`
}

const policyEscape = value => String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char])
const policyInline = value => policyEscape(value)
  .replace(/(https:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')
  .replace(/([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi, '<a href="mailto:$1">$1</a>')

function privacyPolicyBody() {
  return privacyPolicyText.trim().split(/\r?\n\s*\r?\n/).map((block, index) => {
    const lines = block.split(/\r?\n/).map(line => line.trim()).filter(Boolean)
    const first = lines[0] || ''
    if (index === 0 || first === 'FLAT REALITY PRIVACY POLICY') return ''
    if (first.startsWith('DRAFT —')) return `<aside class="legal-draft"><strong>${policyInline(first)}</strong><p>${lines.slice(1).map(policyInline).join('<br>')}</p></aside>`
    if (lines.every(line => /^(Version|Effective date|Last updated):/.test(line))) return `<p class="legal-meta">${lines.map(policyInline).join('<br>')}</p>`
    if (/^\d+\.\d+\./.test(first)) return `<h3>${policyInline(first)}</h3>${lines.length > 1 ? `<p>${policyInline(lines.slice(1).join(' '))}</p>` : ''}`
    if (/^\d+\.\s/.test(first)) return `<h2>${policyInline(first)}</h2>${lines.length > 1 ? `<p>${policyInline(lines.slice(1).join(' '))}</p>` : ''}`
    if (lines.every(line => line.startsWith('- '))) return `<ul>${lines.map(line => `<li>${policyInline(line.slice(2))}</li>`).join('')}</ul>`
    if (first.startsWith('Controller:')) return `<address>${lines.map(policyInline).join('<br>')}</address>`
    return `<p>${policyInline(lines.join(' '))}</p>`
  }).join('')
}

function privacy() {
  return `<div class="site privacy" id="top">${header()}<main class="page-surface"><section class="legal-head"><span>Legal · Privacy Policy</span><h1>Privacy Policy</h1></section><article class="legal legal--full">${privacyPolicyBody()}<button class="outline" data-cookie-settings>Cookie settings</button></article></main>${footer()}</div>`
}

const catalogPages = {
  '/outsourcing': ['Outsourcing','Flexible production support for ambitious game teams.'],
  '/outsourcing/game-vision-pack': ['Game Vision Pack','A focused foundation for positioning, scope and creative direction.'],
  '/outsourcing/retainer': ['Retainer+','Reliable, ongoing production capacity without management overhead.'],
  '/outsourcing/retainerplus': ['Retainer+','Reliable, ongoing production capacity without management overhead.'],
  '/tech': ['Technologies','Tools that simplify development and empower creators.'],
  '/tech/phantomui': ['Phantom UI','Dialogue systems and production-ready UI technology for Unity.']
}

function catalogPage(path) {
  const [title, description] = catalogPages[path] || ['FR Partners','This page is being prepared.']
  return `<div class="site partners catalog" id="top">${header(true)}<main class="page-surface"><section class="catalog-hero"><small>Flat Reality Partners</small><h1>${title}</h1><p>${description}</p><span>Full page coming soon.</span></section></main>${footer()}</div>`
}

function gamesPage() {
  return `<div class="site studio catalog" id="top">${header()}<main class="page-surface"><section class="catalog-hero catalog-hero--dark"><small>Flat Reality Studio</small><h1>Games</h1><p>Independent, expressive games that leave a lasting impression.</p><div class="catalog-games"><a href="https://thenick.flatreality.eu"><img src="${A}/images/TheNickCover.jpeg" alt="The Nick"><strong>The Nick ${ext}</strong></a><a href="https://rainheart.flatreality.eu"><img src="${A}/images/RAINHEARTCover.jpg" alt="RAIN HEART"><strong>RAIN HEART ${ext}</strong></a></div></section></main>${footer()}</div>`
}

function productPlaceholder(product) {
  const nick = product === 'The Nick'
  return `<div class="site studio catalog" id="top">${header()}<main class="page-surface"><section class="catalog-hero catalog-hero--dark"><small>Flat Reality Studio</small><h1>${product}</h1><p>${nick ? 'Meta Horror is awaiting an update.' : 'A psychological horror about identity.'}</p><span>Dedicated website coming soon.</span></section></main>${footer()}</div>`
}

function channelPage() {
  const sections = Object.entries(channelCategories).map(([key, category]) => `<section class="channel-category" id="${key}"><header><img src="${category.icon}" alt=""><h2>${category.label}</h2></header><div class="channel-grid" data-channel-category="${key}">${emptyChannelCard()}</div></section>`).join('')
  return `<div class="site studio channel-index" id="top">${header()}<main class="page-surface">
    <section class="channel-index-hero"><h1>Flat Reality Channel</h1></section>
    <section class="channel-latest"><header><h2>Latest News</h2></header><div data-channel-latest>${emptyChannelCard()}</div></section>
    ${sections}
  </main>${footer()}</div>`
}

function articlePage() {
  return `<div class="site studio channel-post" id="top">${header()}<main class="page-surface" data-article-shell><div class="article-loading"><img src="${A}/logos/StudioLogo.png" alt=""><span>Receiving transmission…</span></div></main>${footer()}</div>`
}

function adminPage() {
  return `<div class="admin-app">
    <section class="admin-login admin-login--microsoft" data-admin-login>
      <button class="microsoft-signin" type="button" data-microsoft-signin>
        <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAVCAYAAACpF6WWAAAAdklEQVR4AeyQwQmAQAwENxYg2ILF6NcC7EXsxQL8ajG2INhATO787yf+cjCQxzIH0+CHV6TP1CvD/15OKMN3RepHJCmNrFld2RRo90sYXmsdIAzf1abbrWDYWg8ow2aoUr8CSWlgzE+VTS3E3AkYNpMRwrAZXgAAAP//8mU1bQAAAAZJREFUAwAIY3Urx7NCCwAAAABJRU5ErkJggg==" alt="" width="21" height="21">
        <span>Sign in with Microsoft</span>
      </button>
      <output data-login-error aria-live="polite"></output>
    </section>
    <section class="admin-workspace" data-admin-workspace hidden>
      <aside class="admin-sidebar"><div class="admin-brand"><img src="${A}/logos/LogoBlackTransparent.png" alt=""><span><b>Flat Reality</b><small>Administration</small></span></div><nav><button class="active" type="button"><img src="${A}/icons/PartnersIcon.png" alt="">FR Channel</button></nav><button class="admin-new" type="button" data-new-article>＋ New transmission</button><div class="admin-article-list" data-admin-articles><p class="admin-empty">Loading transmissions…</p></div></aside>
      <main class="admin-main"><header class="admin-top"><div><small>FR CHANNEL</small><h1 data-editor-heading>Create a transmission</h1></div><span>Website publishing</span></header>
        <form class="admin-editor" data-channel-form>
          <section class="admin-panel admin-fields"><label><span>Title</span><input name="title" maxlength="160" required placeholder="A title people will remember"></label><label><span>Category</span><select name="category" required><option value="studio">Studio</option><option value="rain-heart">RAIN HEART</option><option value="the-nick">The Nick</option><option value="fr-partners">FR Partners</option></select></label><label class="admin-date"><span>Transmission date</span><input name="published_at" type="datetime-local" required><small data-publication-mode>Publishes immediately.</small></label><label class="admin-slug"><span>Article URL</span><div><b>flatreality.eu/channel/</b><input name="slug" maxlength="96" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required placeholder="article-name"><b>/</b></div></label></section>
          <section class="admin-panel admin-cover"><div><small>Cover</small><h2>Lead with a strong image.</h2><p>JPG, PNG, WebP or GIF. Uploaded automatically to the website repository.</p><label class="admin-upload"><input type="file" data-cover-input accept="image/jpeg,image/png,image/webp,image/gif"><span>Choose cover</span></label></div><div class="admin-cover-preview" data-cover-preview><span>Cover image</span></div></section>
          <section class="admin-panel admin-story"><header><div><small>Story</small><h2>Compose the transmission.</h2></div><p>Use the plus button for headings, lists, images, video embeds, separators, quotes and custom HTML.</p></header><div id="channel-editor"></div></section>
          <section class="admin-panel admin-delivery"><header><small>Delivery channels</small><h2>Where should this appear?</h2></header><div class="delivery-options"><label><input name="website" type="checkbox" checked disabled><img src="${A}/logos/StudioLogo.png" alt=""><span><b>Website</b><small>Always enabled</small></span></label><label><input name="rain-heart" type="checkbox"><img src="${A}/icons/RainHeartIcon.png" alt=""><span><b>RAIN HEART</b><small>Prepared for game delivery</small></span></label><label><input name="the-nick" type="checkbox"><img src="${A}/icons/TheNickIcon.png" alt=""><span><b>The Nick</b><small>Prepared for game delivery</small></span></label></div></section>
          <footer class="admin-actions"><output data-admin-notice aria-live="polite">Ready to write.</output><div><button class="admin-draft" type="button" data-save-draft>Save draft</button><button class="admin-publish" type="submit">Publish transmission</button></div></footer>
        </form>
      </main>
    </section>
    <div class="publish-overlay" data-publish-overlay><img src="${A}/logos/StudioLogo.png" alt=""><strong>Sent.</strong></div>
  </div>`
}

function applySeo({title,description,canonical,robots='index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',image,imageAlt='Flat Reality',type='website',structuredData=[]}) {
  document.title = title
  const partnersIcon = /^\/partners(?:\/|$)/i.test(location.pathname)
  const iconHref = partnersIcon ? '/assets/logos/PartnersLogo.jpg' : '/assets/logos/StudioLogo.png'
  document.querySelectorAll('link[rel="icon"],link[rel="apple-touch-icon"]').forEach(node => { node.href = iconHref; if (node.rel === 'icon') node.type = partnersIcon ? 'image/jpeg' : 'image/png' })
  const socialImage = image || 'https://flatreality.eu/assets/images/FlatRealityCover.png'
  const set = (selector, key, name, value) => { let node=document.head.querySelector(selector);if(!node){node=document.createElement('meta');node.setAttribute(key,name);document.head.append(node)}node.setAttribute('content',value) }
  set('meta[name="description"]','name','description',description)
  set('meta[name="robots"]','name','robots',robots)
  set('meta[property="og:title"]','property','og:title',title)
  set('meta[property="og:description"]','property','og:description',description)
  set('meta[property="og:type"]','property','og:type',type)
  set('meta[property="og:url"]','property','og:url',canonical)
  set('meta[property="og:image"]','property','og:image',socialImage)
  set('meta[property="og:image:alt"]','property','og:image:alt',imageAlt)
  set('meta[property="og:site_name"]','property','og:site_name','Flat Reality')
  set('meta[name="twitter:card"]','name','twitter:card','summary_large_image')
  set('meta[name="twitter:title"]','name','twitter:title',title)
  set('meta[name="twitter:description"]','name','twitter:description',description)
  set('meta[name="twitter:image"]','name','twitter:image',socialImage)
  set('meta[name="twitter:image:alt"]','name','twitter:image:alt',imageAlt)
  let link=document.head.querySelector('link[rel="canonical"]');if(!link){link=document.createElement('link');link.rel='canonical';document.head.append(link)}link.href=canonical
  document.head.querySelectorAll('script[data-dynamic-seo]').forEach(node=>node.remove())
  ;(Array.isArray(structuredData)?structuredData:[structuredData]).filter(Boolean).forEach(data=>{const script=document.createElement('script');script.type='application/ld+json';script.dataset.dynamicSeo='true';script.textContent=JSON.stringify(data).replace(/</g,'\\u003c');document.head.append(script)})
}

function cookies(force = false) {
  if (!force && localStorage.getItem('fr-cookie-consent')) return
  document.querySelector('.cookie-layer')?.remove()
  const el = document.createElement('div'); el.className = 'cookie-layer'; el.innerHTML = `<div class="cookie"><button class="cookie-x">×</button><small>Your privacy, your call</small><h2>Cookies</h2><p>Essential storage keeps the site working. Optional categories stay off unless you choose them.</p><label><span><b>Essential</b><small>Always active</small></span><input type="checkbox" checked disabled></label><label><span><b>Preferences</b><small>Remember choices</small></span><input name="preferences" type="checkbox"></label><label><span><b>Analytics</b><small>Anonymous measurement</small></span><input name="analytics" type="checkbox"></label><label><span><b>Marketing</b><small>Campaign measurement</small></span><input name="marketing" type="checkbox"></label><div><button class="outline accept">Accept all</button><button class="outline save">Save choices</button><button class="essential">Essential only</button></div><a href="/privacy" data-route>Privacy policy ${ext}</a></div>`; document.body.append(el)
  const save = all => {
    const previous = JSON.parse(localStorage.getItem('fr-cookie-consent') || 'null')
    const consent = {essential:true,preferences:all||el.querySelector('[name=preferences]').checked,analytics:all||el.querySelector('[name=analytics]').checked,marketing:all||el.querySelector('[name=marketing]').checked}
    localStorage.setItem('fr-cookie-consent',JSON.stringify(consent))
    window.gtag?.('consent','update',{
      ad_storage:consent.marketing?'granted':'denied',
      ad_user_data:consent.marketing?'granted':'denied',
      ad_personalization:consent.marketing?'granted':'denied',
      analytics_storage:consent.analytics?'granted':'denied',
      functionality_storage:consent.preferences?'granted':'denied',
      personalization_storage:consent.preferences?'granted':'denied'
    })
    if(consent.analytics) window.loadClarity?.(consent)
    else if(window.clarity){
      window.clarity('consentv2',{ad_Storage:consent.marketing?'granted':'denied',analytics_Storage:'denied'})
      window.clarity('consent',false)
    }
    el.remove()
    if(previous?.analytics&&!consent.analytics) location.reload()
  }
  el.querySelector('.accept').onclick=()=>save(true); el.querySelector('.save').onclick=()=>save(false); el.querySelector('.essential').onclick=()=>{el.querySelectorAll('input:not(:disabled)').forEach(i=>i.checked=false);save(false)};el.querySelector('.cookie-x').onclick=()=>el.remove()
}

function bind() {
  pageEvents?.abort();pageEvents=new AbortController();clearInterval(heroTimer)
  const signal=pageEvents.signal
  const hd=document.querySelector('[data-header]');const surface=document.querySelector('.page-surface');const ft=document.querySelector('[data-footer]');let prev=scrollY
  const updateScroll=()=>{const y=scrollY;hd.classList.toggle('hidden',y>prev&&y>120);hd.classList.toggle('glass',y>16);prev=y;const start=surface.offsetTop+surface.offsetHeight-innerHeight;const distance=Math.max(240,Math.min(640,ft.offsetHeight*.7));const progress=Math.max(0,Math.min(1,(y-start)/distance));surface.style.setProperty('--surface-scale',String(1-progress*.035));surface.style.setProperty('--surface-radius',`${progress*30}px`);surface.style.setProperty('--surface-lift',`${progress*24}px`)}
  addEventListener('scroll',updateScroll,{passive:true,signal});addEventListener('resize',updateScroll,{passive:true,signal});updateScroll()
  const megaPanels=[...document.querySelectorAll('.mega')]
  let megaCloseTimer
  const closeMega=()=>megaPanels.forEach(panel=>panel.classList.remove('open'))
  const scheduleMegaClose=()=>{clearTimeout(megaCloseTimer);megaCloseTimer=setTimeout(closeMega,120)}
  hd.querySelectorAll('.nav a').forEach(link=>{link.onmouseenter=()=>{clearTimeout(megaCloseTimer);if(!link.dataset.menu){closeMega();return}megaPanels.forEach(panel=>panel.classList.toggle('open',panel.dataset.mega===link.dataset.menu))};link.onfocus=link.onmouseenter})
  megaPanels.forEach(panel=>{panel.onmouseenter=()=>clearTimeout(megaCloseTimer);panel.onmouseleave=scheduleMegaClose})
  hd.onmouseleave=scheduleMegaClose
  hd.addEventListener('focusout',()=>setTimeout(()=>{if(!hd.contains(document.activeElement))closeMega()},0),{signal})
  const burger=hd.querySelector('.burger')
  const setMenu=open=>{hd.classList.toggle('menu-open',open);document.documentElement.classList.toggle('nav-open',open);burger.setAttribute('aria-expanded',String(open))}
  burger.onclick=()=>setMenu(!hd.classList.contains('menu-open'))
  hd.querySelectorAll('.mobile-nav a').forEach(link=>link.addEventListener('click',()=>setMenu(false),{signal}))
  addEventListener('keydown',event=>{if(event.key==='Escape')setMenu(false)},{signal})
  document.querySelectorAll('[data-route]').forEach(a=>a.onclick=e=>{const u=new URL(a.href);if(u.origin!==location.origin)return;e.preventDefault();const currentPartner=location.pathname.toLowerCase().startsWith('/partners');const targetPartner=u.pathname.toLowerCase().startsWith('/partners');const navigate=()=>{history.pushState({},'',u.pathname+u.hash);render();if(!u.hash)scrollTo(0,0)};if(currentPartner!==targetPartner&&!matchMedia('(max-width:800px)').matches){closeMega();brandTransition(targetPartner,navigate)}else{document.body.classList.add('leaving');setTimeout(navigate,260)}})
  document.querySelector('[data-cookie-settings]')?.addEventListener('click',()=>cookies(true))
  const slides=[...document.querySelectorAll('.hero-slide')];if(slides.length>1&&!matchMedia('(prefers-reduced-motion:reduce)').matches){let i=0;heroTimer=setInterval(()=>{slides[i].classList.remove('active');i=(i+1)%slides.length;slides[i].classList.add('active')},6500)}
  const io=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&e.target.classList.add('in')),{threshold:.08});document.querySelectorAll('section,.values article').forEach(x=>io.observe(x))
}

function render(){document.body.classList.remove('leaving');const p=location.pathname.toLowerCase().replace(/\/$/,'')||'/';const partnerRoute=p.startsWith('/partners')?(p.slice(9)||'/'):null;let page,seo,afterRender
  if(p==='/admin'){page=adminPage();seo={title:'FR Channel Administration',description:'Private Flat Reality publishing workspace.',canonical:'https://flatreality.eu/admin/',robots:'noindex, nofollow, noarchive'};document.body.className='theme-admin';afterRender=()=>import('./admin.js').then(({initAdmin})=>initAdmin())}
  else if(p==='/channel'){page=channelPage();seo={title:'Flat Reality Channel | News from Flat Reality',description:'The latest news, stories and transmissions from Flat Reality Studio, RAIN HEART, The Nick and FR Partners.',canonical:'https://flatreality.eu/channel/'};document.body.className='theme-studio';afterRender=hydrateChannelIndex}
  else if(p.startsWith('/channel/')){const slug=p.slice(9);page=articlePage();seo={title:'Receiving transmission | FR Channel',description:'News and stories from Flat Reality.',canonical:`https://flatreality.eu/channel/${slug}/`,robots:'noindex, follow'};document.body.className='theme-studio';afterRender=()=>hydrateArticle(slug,applySeo)}
  else if(partnerRoute==='/outsourcing/retainer-plus/new-inquiry'){page=retainerInquiryPage();seo={title:'Retainer Plus Inquiry | Flat Reality Partners',description:'Configure long-term game production support with Flat Reality Partners.',canonical:'https://flatreality.eu/partners/outsourcing/retainer-plus/new-inquiry/',robots:'noindex, nofollow, noarchive'};document.body.className='theme-partners theme-inquiry';afterRender=initRetainerInquiry}
  else if(partnerRoute==='/outsourcing/retainer-plus'||partnerRoute==='/outsourcing/retainer'||partnerRoute==='/outsourcing/retainerplus'){page=retainerPlusPage({header,footer});seo={title:'Retainer Plus | Flat Reality Partners',description:'Reserve flexible game development capacity, specialists and coordinated production teams with Flat Reality Partners.',canonical:'https://flatreality.eu/partners/outsourcing/retainer-plus/'};document.body.className='theme-partners';afterRender=initRetainerPlus}
  else if(partnerRoute==='/outsourcing/new-inquiry'){page=inquiryPage();seo={title:'Start a Project | Flat Reality Partners',description:'Tell Flat Reality Partners about your game development project.',canonical:'https://flatreality.eu/partners/outsourcing/new-inquiry/',robots:'noindex, nofollow, noarchive'};document.body.className='theme-partners theme-inquiry';afterRender=initInquiry}
  else if(partnerRoute==='/outsourcing'){page=outsourcingPage({header,footer,partnersHref});seo={title:'Game Development Outsourcing & Production Services | Flat Reality Partners',description:'Flexible game development outsourcing for indie studios and creative teams. Explore Unity development, game design, art, audio and production support.',canonical:'https://flatreality.eu/partners/outsourcing/'};document.body.className='theme-partners';afterRender=initOutsourcing}
  else if(partnerRoute==='/network/independent-partner'){page=independentPartnerPage({header,footer});seo=independentPartnerSeo;document.body.className='theme-partners'}
  else if(partnerRoute!==null){page=partnerRoute==='/'?partners():catalogPage(partnerRoute);seo={title:partnerRoute==='/'?'Flat Reality Partners - Create More. Manage Less.':`${catalogPages[partnerRoute]?.[0]||'FR Partners'} - Flat Reality Partners`,description:catalogPages[partnerRoute]?.[1]||'Creative production services and technologies from Flat Reality Partners.',canonical:`https://flatreality.eu/partners${partnerRoute==='/'?'/':`${partnerRoute}/`}`,robots:partnerRoute==='/'?undefined:'noindex, follow'};document.body.className='theme-partners';afterRender=()=>hydrateHomeChannel(true)}
  else if(host==='thenick.flatreality.eu'){page=productPlaceholder('The Nick');seo={title:'The Nick - Flat Reality',description:'Meta Horror is awaiting an update.',canonical:'https://thenick.flatreality.eu/',robots:'noindex, follow'};document.body.className='theme-studio'}
  else if(host==='rainheart.flatreality.eu'){page=productPlaceholder('RAIN HEART');seo={title:'RAIN HEART - Flat Reality',description:'A psychological horror about identity from Flat Reality.',canonical:'https://rainheart.flatreality.eu/',robots:'noindex, follow'};document.body.className='theme-studio'}
  else if(p==='/games'){page=gamesPage();seo={title:'Games - Flat Reality',description:'Explore expressive games by Flat Reality, including The Nick and RAIN HEART.',canonical:'https://flatreality.eu/games/'};document.body.className='theme-studio'}
  else if(p.startsWith('/privacy')){page=privacy();seo={title:'Privacy Policy - Flat Reality',description:'Privacy, cookies and data rights at Flat Reality.',canonical:'https://flatreality.eu/privacy/'};document.body.className='theme-privacy'}
  else{page=studio();seo={title:'Flat Reality - Games Should Say Something',description:'Flat Reality is an independent European game studio creating expressive games that leave a lasting impression.',canonical:'https://flatreality.eu/'};document.body.className='theme-studio';afterRender=()=>hydrateHomeChannel(false)}
  if (partnerRoute === '/portfolio' || partnerRoute === '/case-studies') {
    if (partnerRoute === '/portfolio') history.replaceState({}, '', `/partners/case-studies/${location.search}${location.hash}`)
    page=portfolioPage({header,footer}); seo={title:'Case Study | Flat Reality Partners',description:'Explore Flat Reality Partners case studies: game design, Unity development, production and key art for client projects and studio productions.',canonical:'https://flatreality.eu/partners/case-studies/',robots:'index, follow, max-image-preview:large',image:'https://flatreality.eu/assets/images/FlatRealityCover.png'}; document.body.className='theme-partners'; afterRender=undefined
  }
  if (partnerRoute?.startsWith('/case-studies/')) {
    const project = findCaseStudy(partnerRoute.slice('/case-studies/'.length))
    if (project) { page=caseStudyPage(project,{header,footer}); seo={title:`${project.title} — Case Study | Flat Reality Partners`,description:project.description,canonical:`https://flatreality.eu/partners/case-studies/${project.slug}/`,robots:'noindex, follow',image:`https://flatreality.eu${caseStudyCover(project) || '/assets/images/FlatRealityCover.png'}`}; document.body.className='theme-partners'; afterRender=initCaseStudy }
  }
  const inquiryRoute=partnerRoute==='/outsourcing/new-inquiry'||partnerRoute==='/outsourcing/retainer-plus/new-inquiry'
  document.querySelector('#app').innerHTML=page;applySeo(seo);if(p!=='/admin'&&!inquiryRoute)bind();const hydration=afterRender?.();if(p!=='/admin'&&!inquiryRoute&&hydration?.then)hydration.then(()=>bind()).catch(()=>{})
  let revealed=false
  const reveal=()=>{if(revealed)return;revealed=true;document.body.classList.add('ready');if(location.hash)document.querySelector(location.hash)?.scrollIntoView();else scrollTo(0,0)}
  if(matchMedia('(max-width:800px)').matches){
    const critical=document.querySelector('.hero-slide.active img,.hero-slide.active video,.partners-hero video,.catalog-games img')
    const mediaReady=!critical||critical.complete||critical.readyState>=2?Promise.resolve():new Promise(resolve=>{critical.addEventListener('load',resolve,{once:true});critical.addEventListener('loadeddata',resolve,{once:true});critical.addEventListener('error',resolve,{once:true})})
    Promise.race([Promise.all([document.fonts?.ready||Promise.resolve(),mediaReady]),new Promise(resolve=>setTimeout(resolve,1600))]).then(reveal)
  }else reveal()
}
addEventListener('popstate',render);render();if(!location.pathname.toLowerCase().startsWith('/admin')&&!location.pathname.toLowerCase().includes('/new-inquiry'))setTimeout(()=>cookies(),2500)
