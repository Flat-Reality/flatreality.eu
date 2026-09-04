import './style.css'
import { ArrowUpRight, ChevronLeft, ChevronRight, Cookie, Mail, Menu, X } from 'lucide'

const A = '/assets'
const external = '<span aria-hidden="true">↗</span>'
const icon = (nodes, cls = '') => {
  const draw = ([tag, attrs]) => `<${tag} ${Object.entries(attrs).map(([k,v]) => `${k}="${v}"`).join(' ')}></${tag}>`
  const children = nodes[0] === 'svg' ? nodes[2] : nodes
  return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="${cls}" aria-hidden="true">${children.map(draw).join('')}</svg>`
}

const studioLogo = `${A}/logos/LightTransparentLogo.png`
const partnerLogo = `${A}/icons/PartnersIcon.png`

function header(partners = false) {
  return `<header class="site-header ${partners ? 'partner-header' : ''}" data-header>
    <a class="brand" href="/" data-route><span class="brand-mark"><img src="${partners ? partnerLogo : studioLogo}" alt=""></span><span>Flat Reality${partners ? ' <b>Partners</b>' : ''}</span></a>
    <nav class="desktop-nav" aria-label="Main navigation">
      <a href="/" data-route>Studio</a>
      <button class="nav-trigger" data-menu="games">Games</button>
      <button class="nav-trigger ${partners ? 'active' : ''}" data-menu="partners">FR Partners</button>
      <a href="https://www.linkedin.com/company/flatreality/jobs/" target="_blank" rel="noreferrer">Careers</a>
    </nav>
    <button class="menu-toggle" aria-label="Open menu" aria-expanded="false">${icon(Menu)}</button>
    <div class="mega-menu" data-mega="games"><p>Our worlds</p><a href="https://thenick.flatreality.eu" target="_blank">The Nick ${external}</a><a href="https://store.steampowered.com/app/4397540/RAIN_HEART/" target="_blank">RAIN HEART ${external}</a></div>
    <div class="mega-menu" data-mega="partners"><p>Creative services</p><a href="/partners#outsourcing" data-route>Outsourcing</a><a href="/partners#technologies" data-route>Technologies</a><a href="/partners#network" data-route>Network</a><a href="/partners" data-route>Partners overview ${external}</a></div>
    <div class="mobile-menu"><a href="/" data-route>Studio</a><a href="https://thenick.flatreality.eu" target="_blank">The Nick ${external}</a><a href="https://store.steampowered.com/app/4397540/RAIN_HEART/" target="_blank">RAIN HEART ${external}</a><a href="/partners" data-route>FR Partners</a><a href="https://www.linkedin.com/company/flatreality/jobs/" target="_blank">Careers ${external}</a></div>
  </header>`
}

const button = (label, href, cls = '') => `<a class="button ${cls}" href="${href}" ${href.startsWith('http') ? 'target="_blank" rel="noreferrer"' : ''}>${label} ${external}</a>`

function footer() {
  return `<footer class="footer">
    <div class="footer-top"><a class="footer-brand" href="/" data-route><img src="${studioLogo}" alt="">Flat Reality</a><a class="to-top" href="#top">Back to top ↑</a></div>
    <div class="footer-grid">
      <div><h3>Sitemap</h3><a href="/" data-route>Studio</a><a href="/partners" data-route>FR Partners</a><a href="https://blog.flatreality.eu">Channel</a></div>
      <div><h3>Get help</h3><a href="mailto:contact@flatreality.eu">Contact</a><a href="/privacy" data-route>Privacy & cookies</a></div>
      <div><h3>Our socials</h3><a href="https://www.linkedin.com/company/flatreality/" target="_blank">LinkedIn</a></div>
      <div class="footer-location"><h3>Location</h3><a href="https://maps.google.com/?q=Madrid%2C+Spain" target="_blank">Madrid ${external}</a></div>
    </div>
    <p class="copyright">© Flat Reality Entertainment Group 2019–2026. All trademarks are the property of their respective owners.</p>
  </footer>`
}

function channel(active = 'Studio') {
  return `<section class="channel section"><div class="eyebrow">Flat Reality <em>Channel</em></div><div class="channel-head"><div class="filters"><span>${active}</span><span>The Nick</span><span>RAIN HEART</span><span>FR Partners</span></div>${button('Explore more', 'https://blog.flatreality.eu', 'small')}</div><div class="empty-news"><div><span>Channel quiet</span><h2>No recent transmissions.</h2><p>New stories, studio updates and field notes will appear here.</p></div></div></section>`
}

function studio() {
  return `<div id="top" class="page studio-page">${header(false)}<main class="page-shell">
    <section class="hero slider" data-autoplay="6500" aria-label="Featured projects">
      <article class="hero-slide active"><video autoplay muted loop playsinline poster="${A}/images/TheNickCover.jpeg"><source src="${A}/videos/TheNick.MP4" type="video/mp4"></video><div class="hero-shade"></div><div class="hero-copy"><img src="${A}/logos/TheNickLogo.png" alt="The Nick"><h1>Meta Horror is awaiting an update…</h1>${button('Jump to website', 'https://thenick.flatreality.eu', 'light')}</div></article>
      <article class="hero-slide group-slide"><a class="full-slide-link" href="https://store.steampowered.com/app/4397540/RAIN_HEART/" target="_blank" rel="noreferrer" aria-label="Learn more about RAIN HEART"><img class="group-art" src="${A}/images/Group30.png" alt="RAIN HEART — teaser announcement for a new psychological horror about identity"></a></article>
      <div class="hero-progress"><i></i><i></i></div>
    </section>

    <section class="section games-section"><div class="section-title"><h2>Made by <em>us</em></h2><div class="slider-controls"><button data-slide-prev aria-label="Previous">${icon(ChevronLeft)}</button><button data-slide-next aria-label="Next">${icon(ChevronRight)}</button></div></div><div class="card-track" data-card-slider>
      <a class="game-card" href="https://thenick.flatreality.eu" target="_blank"><video autoplay muted loop playsinline poster="${A}/images/TheNickCover.jpeg"><source src="${A}/videos/TheNick.MP4" type="video/mp4"></video><div class="card-icons">▦ ● ◆</div><h3>The Nick: Chapter 1 ${external}</h3></a>
      <a class="game-card" href="https://store.steampowered.com/app/4397540/RAIN_HEART/" target="_blank"><img src="${A}/images/RAINHEARTCover.jpg" alt="RAIN HEART"><span class="tag">Coming in 2027</span><h3>RAIN HEART ${external}</h3></a>
    </div></section>

    <section class="statement-banner"><img src="${A}/images/MAD_GAMES_SHOW-SABADO-TARDE-2539-scaled.jpg" alt="Flat Reality team at a games show"><div><span>Our point of view</span><h2>Games Should Say<br>Something</h2></div></section>
    <section class="section manifesto"><div class="intro-grid"><p class="eyebrow">Independent Expressive <em>Games</em></p><div><p>Founded in 2019, Flat Reality is an independent European game studio creating expressive games that leave a lasting impression.</p><p>We believe games are one of the most powerful forms of storytelling. Through gameplay, atmosphere, music and narrative, we create experiences that explore meaningful ideas and evoke genuine emotion.</p></div></div><h2>Our shared <em>values</em></h2><div class="values"><article><span>01</span><h3>To Tell Something</h3><p>Every game deserves a reason to exist. We create experiences that leave players with something to think about long after the credits roll.</p></article><article><span>02</span><h3>Be genuinely expressive</h3><p>We value honest ideas over safe ideas. The games we make should reflect curiosity, emotion and a clear creative voice.</p></article><article><span>03</span><h3>People Come First</h3><p>Behind every great game are people. We foster respect, trust and the freedom to do their best work.</p></article><article><span>04</span><h3>Build With Integrity</h3><p>We make deliberate choices and stand behind the worlds we create.</p></article></div></section>
    <section class="location"><video autoplay muted loop playsinline><source src="${A}/videos/Madrid.mp4" type="video/mp4"></video><div class="location-shade"></div><div class="location-copy"><p class="eyebrow">Location · Headquarters</p><h2>Madrid, Spain</h2><p>Here, under the sunny skies, is where our headquarters are located. Embracing culture and diversity, we are inspired to create and work.</p></div></section>
    ${channel('Studio')}
  </main>${footer()}</div>`
}

const partnerCard = (title, subtitle, media, className = '') => `<a class="partner-card ${className}" href="#contact"><div class="partner-media">${media || ''}</div>${subtitle ? `<small>${subtitle}</small>` : ''}<h3>${title} ${external}</h3></a>`

function partners() {
  return `<div id="top" class="page partners-page">${header(true)}<main class="page-shell">
    <section class="partners-hero"><video autoplay muted loop playsinline><source src="${A}/videos/PartnersIntro.mp4" type="video/mp4"></video><div class="hero-shade"></div><div class="partners-copy"><span>Flat Reality Partners</span><h1>Create More.<br>Manage Less.</h1>${button('Contact us', '#contact', 'light')}</div><nav class="hero-anchors"><a href="#outsourcing">Outsourcing ↓</a><a href="#technologies">Technologies ↓</a><a href="#network">Network ↓</a></nav></section>
    <section class="section partner-intro"><div><p class="eyebrow">Built around creators</p><h2>Designed for<br>creative work</h2></div><div><p>Flat Reality Partners is the B2B division of Flat Reality, helping game studios and creative teams build better products through modular services, technologies and trusted partnerships. From game development and Unity tools to production infrastructure, we create solutions that let creators focus on creating — not managing.</p><div class="client-logos"><img src="${A}/logos/Microsoft logo 1.png" alt="Microsoft"><img src="${A}/logos/ID@Xbox logo 1.png" alt="ID at Xbox"><img src="${A}/logos/Valve logo 1.png" alt="Valve"><img src="${A}/logos/Unity Logo.png" alt="Unity"><img src="${A}/logos/new-XBOX-logo-black-png-large-size 1.png" alt="Xbox"></div></div></section>
    <section id="outsourcing" class="section partner-section"><div class="partner-section-head"><span>01</span><div><h2>Outsourcing</h2><p>Flexible game development and production support.</p></div></div><div class="partner-track">${partnerCard('Browse our services','Flexible studio support','<img src="'+A+'/images/IPkeyart.png" alt="">')}${partnerCard('Retainer+','A team that stays in context','<video autoplay muted loop playsinline><source src="'+A+'/videos/RetainerPlusBG.mp4" type="video/mp4"></video>','dark-card')}</div></section>
    <section id="technologies" class="section partner-section"><div class="partner-section-head"><span>02</span><div><h2>Technologies</h2><p>Tools that simplify development and empower creators.</p></div></div><div class="partner-track">${partnerCard('Phantom UI: Dialogue System','Production-ready Unity tool','<div class="phantom"></div>','dark-card')}${partnerCard('Emerald Core','A dependable foundation','<div class="emerald"></div>')}</div></section>
    <section id="network" class="section partner-section"><div class="partner-section-head"><span>03</span><div><h2>Network</h2><p>A trusted ecosystem of independent professionals and partners.</p></div></div><div class="partner-track">${partnerCard('Apply to be an Independent Partner','Join the network','<img src="'+A+'/logos/PartnersLogo.jpg" alt="">')}${partnerCard('Browse our Careers','Find your next role','<img src="'+A+'/images/MAD_GAMES_SHOW-SABADO-TARDE-2539-scaled.jpg" alt="">')}</div></section>
    <section id="contact" class="section contact"><p class="eyebrow">Have a project in mind?</p><h2>Contact us directly</h2><a href="mailto:contact@flatreality.eu">${icon(Mail)}<span>contact@flatreality.eu</span>${icon(ArrowUpRight)}</a><a href="https://www.upwork.com/agencies/1978795012604336421/" target="_blank"><img src="${A}/icons/upwork_icon_231982 1.png" alt=""><span>Flat Reality Partners</span>${icon(ArrowUpRight)}</a></section>
    ${channel('FR Partners')}
  </main>${footer()}</div>`
}

function privacy() {
  return `<div id="top" class="page privacy-page">${header(false)}<main class="page-shell"><section class="legal-hero"><p class="eyebrow">Legal · Effective 4 September 2026</p><h1>Privacy<br>Policy</h1><p>How Flat Reality handles personal information across our websites and services.</p></section><article class="legal section">
    <nav><a href="#overview">Overview</a><a href="#data">Data we process</a><a href="#cookies">Cookies</a><a href="#rights">Your rights</a><button data-cookie-settings>Cookie settings</button></nav><div>
    <section id="overview"><h2>1. Overview</h2><p>This privacy notice explains how Flat Reality Entertainment Group (“Flat Reality”, “we”, “us”) collects and uses personal information when you visit flatreality.eu and related pages. We aim to process data transparently and in line with the EU General Data Protection Regulation (GDPR), the ePrivacy framework and applicable California privacy law, including the CCPA/CPRA.</p><p>This prototype does not enable advertising or analytics cookies unless you choose them in the consent manager.</p></section>
    <section id="data"><h2>2. Information we process</h2><p>We may receive information that you choose to send us, such as your name, email address and the contents of an enquiry. Our hosting providers may also process limited technical records, including IP address, browser type, requested URL and security logs, to deliver and protect the site.</p><h3>Purposes and legal bases</h3><p>We process enquiries to take steps at your request and pursue our legitimate interest in business communication. Essential technical data is processed to provide a secure website. Optional analytics or marketing technologies, if introduced, will rely on consent where required.</p></section>
    <section id="cookies"><h2>3. Cookies and local storage</h2><p>Essential storage remembers your privacy selection and basic site preferences. Optional preference, analytics and marketing categories remain disabled until you actively enable them. You can withdraw consent at any time through “Cookie settings” in the footer or this page.</p></section>
    <section id="rights"><h2>4. Your choices and rights</h2><p>Depending on where you live, you may request access, correction, deletion, restriction, portability or objection, and may withdraw consent. California residents may also request to know, delete or correct information and opt out of sale or sharing. We do not sell personal information.</p><p>To exercise a right or ask a privacy question, email <a href="mailto:contact@flatreality.eu">contact@flatreality.eu</a>. You may also contact your local data protection authority.</p></section>
    <section><h2>5. Retention, transfers and security</h2><p>We keep personal information only as long as needed for the purpose collected, legal obligations and dispute resolution. Where providers process information outside your region, we use appropriate contractual and legal safeguards. We take proportionate technical and organisational measures to protect information.</p></section>
    <section><h2>6. Updates</h2><p>We may update this notice as our site and services evolve. Material changes will be highlighted here with a revised effective date.</p></section></div></article></main>${footer()}</div>`
}

function cookieBanner(force = false) {
  if (!force && localStorage.getItem('fr-cookie-consent')) return
  document.querySelector('.cookie-layer')?.remove()
  const layer = document.createElement('div'); layer.className = 'cookie-layer'; layer.innerHTML = `<div class="cookie-card"><button class="cookie-close" aria-label="Close">${icon(X)}</button><div class="cookie-icon">${icon(Cookie)}</div><p class="eyebrow">Your privacy, your call</p><h2>We use a small number of cookies.</h2><p>Essential storage keeps this site working. Optional categories stay off unless you choose them.</p><div class="cookie-options"><label><span><b>Essential</b><small>Security and consent choices</small></span><input type="checkbox" checked disabled></label><label><span><b>Preferences</b><small>Remember your choices</small></span><input name="preferences" type="checkbox"></label><label><span><b>Analytics</b><small>Anonymous site measurement</small></span><input name="analytics" type="checkbox"></label><label><span><b>Marketing</b><small>Relevant campaign measurement</small></span><input name="marketing" type="checkbox"></label></div><div class="cookie-actions"><button class="button accept-all">Accept all</button><button class="button save-choice">Save choices</button><button class="text-button reject-all">Essential only</button></div><a href="/privacy" data-route>Read privacy policy ${external}</a></div>`; document.body.append(layer)
  const save = (all = false) => { const data = { essential: true, preferences: all || layer.querySelector('[name=preferences]').checked, analytics: all || layer.querySelector('[name=analytics]').checked, marketing: all || layer.querySelector('[name=marketing]').checked, updated: new Date().toISOString() }; localStorage.setItem('fr-cookie-consent', JSON.stringify(data)); layer.classList.add('closing'); setTimeout(() => layer.remove(), 450) }
  layer.querySelector('.accept-all').onclick = () => save(true); layer.querySelector('.save-choice').onclick = () => save(); layer.querySelector('.reject-all').onclick = () => save(false); layer.querySelector('.cookie-close').onclick = () => layer.classList.add('minimized')
}

function render() {
  const path = location.pathname.toLowerCase(); const isPartnerHost = location.hostname.startsWith('partners.')
  document.body.className = (isPartnerHost || path.startsWith('/partners')) ? 'theme-partners' : path.startsWith('/privacy') ? 'theme-privacy' : 'theme-studio'
  document.querySelector('#app').innerHTML = isPartnerHost || path.startsWith('/partners') ? partners() : path.startsWith('/privacy') ? privacy() : studio()
  bindUI(); requestAnimationFrame(() => document.body.classList.add('page-ready'))
}

function bindUI() {
  const headerEl = document.querySelector('[data-header]'); let lastY = scrollY
  addEventListener('scroll', () => { const y = scrollY; headerEl.classList.toggle('hidden', y > lastY && y > 96); headerEl.classList.toggle('scrolled', y > 24); lastY = y }, { passive: true })
  document.querySelectorAll('.nav-trigger').forEach(btn => { btn.onmouseenter = () => { document.querySelectorAll('.mega-menu').forEach(m => m.classList.toggle('open', m.dataset.mega === btn.dataset.menu)) }; btn.onfocus = btn.onmouseenter })
  headerEl.onmouseleave = () => document.querySelectorAll('.mega-menu').forEach(m => m.classList.remove('open'))
  const toggle = document.querySelector('.menu-toggle'); toggle.onclick = () => { headerEl.classList.toggle('mobile-open'); toggle.setAttribute('aria-expanded', headerEl.classList.contains('mobile-open')); toggle.innerHTML = headerEl.classList.contains('mobile-open') ? icon(X) : icon(Menu) }
  document.querySelectorAll('[data-route]').forEach(a => a.addEventListener('click', e => { if (a.target === '_blank' || e.metaKey || e.ctrlKey) return; const url = new URL(a.href); if (url.origin !== location.origin) return; e.preventDefault(); document.body.classList.remove('page-ready'); setTimeout(() => { history.pushState({}, '', url.pathname + url.hash); render(); if (url.hash) setTimeout(() => document.querySelector(url.hash)?.scrollIntoView(), 50); else scrollTo(0,0) }, 320) }))
  document.querySelector('[data-cookie-settings]')?.addEventListener('click', () => cookieBanner(true))
  document.querySelectorAll('[data-autoplay]').forEach(slider => { const slides = [...slider.querySelectorAll('.hero-slide')], dots = [...slider.querySelectorAll('.hero-progress i')]; let i = 0; const show = n => { slides[i].classList.remove('active'); dots[i]?.classList.remove('active'); i = n % slides.length; slides[i].classList.add('active'); dots[i]?.classList.add('active') }; show(0); if (!matchMedia('(prefers-reduced-motion: reduce)').matches) setInterval(() => show(i + 1), Number(slider.dataset.autoplay)) })
  const track = document.querySelector('[data-card-slider]'); document.querySelector('[data-slide-next]')?.addEventListener('click', () => track.scrollBy({ left: track.clientWidth * .72, behavior: 'smooth' })); document.querySelector('[data-slide-prev]')?.addEventListener('click', () => track.scrollBy({ left: -track.clientWidth * .72, behavior: 'smooth' }))
  const observer = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && e.target.classList.add('revealed')), { threshold: .12 }); document.querySelectorAll('section, .values article').forEach(el => observer.observe(el))
}

addEventListener('popstate', render); render(); setTimeout(cookieBanner, 900)
