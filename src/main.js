import './style.css'

const A = '/assets'
const ext = '<span class="ext">↗</span>'

function header(partners = false) {
  return `<header class="header ${partners ? 'header--partners' : ''}" data-header>
    <a class="brand" href="/" data-route><span class="brand-glow"><img src="${partners ? `${A}/icons/PartnersIcon.png` : `${A}/logos/LightTransparentLogo.png`}" alt=""></span><span>Flat Reality${partners ? ' <b>Partners</b>' : ''}</span></a>
    <nav class="nav"><a class="${partners ? '' : 'active'}" href="/" data-route>Studio</a><button data-menu="games">Games</button><button class="${partners ? 'active' : ''}" data-menu="partners">FR Partners</button><a href="https://www.linkedin.com/company/flatreality/jobs/" target="_blank">Careers</a></nav>
    <button class="burger" aria-label="Open navigation" aria-expanded="false"><i></i><i></i></button>
    <div class="mega" data-mega="games"><small>Games</small><a href="https://thenick.flatreality.eu" target="_blank">The Nick ${ext}</a><a href="https://store.steampowered.com/app/4397540/RAIN_HEART/" target="_blank">RAIN HEART ${ext}</a></div>
    <div class="mega" data-mega="partners"><small>FR Partners</small><a href="/partners#outsourcing" data-route>Outsourcing</a><a href="/partners#technologies" data-route>Technologies</a><a href="/partners#network" data-route>Network</a></div>
    <div class="mobile-nav"><a href="/" data-route>Studio</a><a href="https://thenick.flatreality.eu">The Nick</a><a href="https://store.steampowered.com/app/4397540/RAIN_HEART/">RAIN HEART</a><a href="/partners" data-route>FR Partners</a><a href="https://www.linkedin.com/company/flatreality/jobs/">Careers</a></div>
  </header>`
}

function footer() {
  return `<footer class="footer"><div class="footer-brand"><img src="${A}/logos/LightTransparentLogo.png" alt=""><b>Flat Reality</b></div><div class="footer-cols"><div><h3>Sitemap</h3><a href="/" data-route>Studio</a><a href="/partners" data-route>FR Partners</a></div><div><h3>Get Help</h3><a href="mailto:contact@flatreality.eu">Contact</a><a href="/privacy" data-route>Privacy</a></div><div><h3>Our socials</h3><a href="https://www.linkedin.com/company/flatreality/">LinkedIn</a></div><div class="footer-place"><h3>Location</h3><a href="https://maps.google.com/?q=Madrid%2C+Spain">Madrid ${ext}</a></div></div><p class="copyright">© FLAT REALITY ENTERTAINMENT GROUP 2019 - 2026. All trademarks are the property of their respective owners.</p></footer>`
}

function channel(partners = false) {
  return `<section class="channel"><h2>Flat Reality <em>Channel</em></h2><div class="channel-row"><nav><b>${partners ? 'FR Partners' : 'Studio'}</b><span>The Nick</span><span>RAIN HEART</span><span>FR Partners</span></nav><a class="outline small" href="https://blog.flatreality.eu" target="_blank">Explore more</a></div><div class="channel-track"><a href="https://blog.flatreality.eu" target="_blank" class="news-card"><strong>${partners ? 'Article 3' : 'Article 1'} ${ext}</strong></a><a href="https://blog.flatreality.eu" target="_blank" class="news-card"><strong>${partners ? 'Article 4' : 'Article 2'} ${ext}</strong></a></div></section>`
}

function studio() {
  return `<div class="site studio" id="top">${header()}<main class="page-surface">
    <section class="hero" data-hero><article class="hero-slide active"><img src="${A}/images/TheNickCover.jpeg" alt=""><div class="scrim"></div><div class="studio-hero-copy"><img src="${A}/logos/TheNickLogo.png" alt="The Nick"><h1>Meta Horror is awaiting an update...</h1><a class="outline outline--white" href="https://thenick.flatreality.eu" target="_blank">Jump to website</a></div></article><article class="hero-slide"><a href="https://store.steampowered.com/app/4397540/RAIN_HEART/" target="_blank"><img src="${A}/images/Group30.png" alt="RAIN HEART teaser"></a></article></section>
    <section class="made"><h2>Made by <em>us</em></h2><div class="wide-track"><a class="game-card" href="https://thenick.flatreality.eu" target="_blank"><video autoplay muted loop playsinline poster="${A}/images/TheNickCover.jpeg"><source src="${A}/videos/TheNick.MP4" type="video/mp4"></video><span class="platforms"><img src="${A}/icons/windows-white-icon 1.png"><img src="${A}/icons/SteamDeckLightIcon.png"><img src="${A}/icons/AppleLightIcon.png"></span><strong>The Nick: Chapter 1 ${ext}</strong></a><a class="game-card" href="https://store.steampowered.com/app/4397540/RAIN_HEART/" target="_blank"><img src="${A}/images/RAINHEARTCover.jpg" alt="RAIN HEART"><b class="coming">Coming In 2027</b><strong>RAIN HEART ${ext}</strong></a></div></section>
    <section class="motto"><img src="${A}/images/MAD_GAMES_SHOW-SABADO-TARDE-2539-scaled.jpg" alt=""><div></div><h2>Games Should Say<br>Something</h2></section>
    <section class="about"><h2>Independent Expressive <em>Games</em></h2><div class="about-copy"><p>Founded in 2019, Flat Reality is an european game studio creating expressive games that leave a lasting impression.</p><p>We believe games are one of the most powerful forms of storytelling. Through gameplay, atmosphere, music, and narrative, we create experiences that explore meaningful ideas and evoke genuine emotion.</p><p>Every project begins with the same simple belief that games should say something.</p></div><h2 class="values-title">Our shared <em>values</em></h2><div class="values"><article><h3>To Tell Something</h3><p>Every game deserves a reason to exist. We create experiences that leave players with something to think about long after the credits roll.</p></article><article><h3>Be genuinely expressive</h3><p>We value honest ideas over safe ideas. The games we make should reflect curiosity, emotion, and a clear creative voice.</p></article><article><h3>People Come First</h3><p>Behind every great game are people. We foster a culture of respect, trust, and support where everyone has the freedom to do their best work.</p></article><article><h3>Build With Integrity</h3><p>Every game deserves a reason to exist. We create experiences that leave players with something to think about long after the credits roll.</p></article></div></section>
    <section class="location"><video autoplay muted loop playsinline><source src="${A}/videos/Madrid.mp4" type="video/mp4"></video><div class="scrim"></div><div><h2>Madrid, Spain</h2><p><b>Location • Headquarters</b><br><br>Here, under the sunny skies, is where our headquarters are located. Embracing culture and diversity, we are inspired to create and work.</p></div></section>
    ${channel(false)}
  </main>${footer()}</div>`
}

function partnerCard(title, media = '', cls = '') { return `<a class="service-card ${cls}" href="#contact">${media}<strong>${title} ${ext}</strong></a>` }

function partners() {
  return `<div class="site partners" id="top">${header(true)}<main class="page-surface">
    <section class="partners-hero"><video autoplay muted loop playsinline><source src="${A}/videos/PartnersIntro.mp4" type="video/mp4"></video><div class="scrim"></div><div class="partners-hero-copy"><h1>Create More.<br>Manage Less.</h1><a class="outline outline--white" href="#contact">Contact us</a></div><nav><a href="#outsourcing">Outsourcing ${ext}</a><a href="#technologies">Technologies ${ext}</a><a href="#network">Network ${ext}</a></nav></section>
    <section class="partner-intro"><h2>Designed for creative work</h2><p>Flat Reality Partners is the B2B division of Flat Reality, helping game studios and creative teams build better products through modular services, technologies and trusted partnerships. From game development and Unity tools to production infrastructure, we create solutions that let creators focus on creating—not managing.</p><div class="logos"><img src="${A}/logos/Microsoft logo 1.png"><img src="${A}/logos/ID@Xbox logo 1.png"><img src="${A}/logos/Valve logo 1.png"><img src="${A}/logos/Unity Logo.png"><img src="${A}/logos/new-XBOX-logo-black-png-large-size 1.png"><b>GS</b><b>ST–RV</b></div></section>
    <section class="services" id="outsourcing"><header><img src="${A}/icons/PartnersIcon.png"><h2>Outsourcing</h2></header><p>Flexible game development and production support.</p><div class="service-track">${partnerCard('Browse our services')}${partnerCard('Retainer+',`<video autoplay muted loop playsinline><source src="${A}/videos/RetainerPlusBG.mp4" type="video/mp4"></video>`,'dark')}</div></section>
    <section class="services" id="technologies"><header><img src="${A}/icons/PartnersIcon.png"><h2>Technologies</h2></header><p>Tools that simplify development and empower creators.</p><div class="service-track">${partnerCard('Phantom UI: Dialogue System','<i class="phantom"></i>','dark')}${partnerCard('Emerald Core','<i class="emerald"></i>')}</div></section>
    <section class="services" id="network"><header><img src="${A}/icons/PartnersIcon.png"><h2>Network</h2></header><p>A trusted ecosystem of independent professionals and partners.</p><div class="service-track">${partnerCard('Apply to be an Independent Partner',`<img src="${A}/images/IPkeyart.png" alt="">`)}${partnerCard('Browse our Careers')}</div></section>
    <section class="contact" id="contact"><h2>Contact us directly</h2><a href="mailto:contact@flatreality.eu"><img src="${A}/icons/EmailDarkIcon.png"><span>contact@flatreality.eu</span>${ext}</a><a href="https://www.upwork.com/agencies/1978795012604336421/" target="_blank"><img src="${A}/icons/upwork_icon_231982 1.png"><span>Flat Reality Partners</span>${ext}</a></section>
    ${channel(true)}
  </main>${footer()}</div>`
}

function privacy() {
  return `<div class="site privacy" id="top">${header()}<main class="page-surface"><section class="legal-head"><span>Legal · Updated 5 September 2026</span><h1>Privacy Policy</h1></section><article class="legal"><h2>Privacy and cookies</h2><p>Flat Reality processes personal information transparently and in accordance with applicable privacy law, including the GDPR and CCPA/CPRA where relevant.</p><h2>Information we process</h2><p>We may process information you send in an enquiry and limited technical records required to deliver and secure this website. Optional analytics and marketing technologies remain disabled until you consent.</p><h2>Your rights</h2><p>You may request access, correction, deletion, restriction or portability of your information, object to certain processing, or withdraw consent. Contact <a href="mailto:contact@flatreality.eu">contact@flatreality.eu</a>.</p><button class="outline" data-cookie-settings>Cookie settings</button></article></main>${footer()}</div>`
}

function cookies(force = false) {
  if (!force && localStorage.getItem('fr-cookie-consent')) return
  document.querySelector('.cookie-layer')?.remove()
  const el = document.createElement('div'); el.className = 'cookie-layer'; el.innerHTML = `<div class="cookie"><button class="cookie-x">×</button><small>Your privacy, your call</small><h2>Cookies</h2><p>Essential storage keeps the site working. Optional categories stay off unless you choose them.</p><label><span><b>Essential</b><small>Always active</small></span><input type="checkbox" checked disabled></label><label><span><b>Preferences</b><small>Remember choices</small></span><input name="preferences" type="checkbox"></label><label><span><b>Analytics</b><small>Anonymous measurement</small></span><input name="analytics" type="checkbox"></label><label><span><b>Marketing</b><small>Campaign measurement</small></span><input name="marketing" type="checkbox"></label><div><button class="outline accept">Accept all</button><button class="outline save">Save choices</button><button class="essential">Essential only</button></div><a href="/privacy" data-route>Privacy policy ${ext}</a></div>`; document.body.append(el)
  const save = all => { localStorage.setItem('fr-cookie-consent',JSON.stringify({essential:true,preferences:all||el.querySelector('[name=preferences]').checked,analytics:all||el.querySelector('[name=analytics]').checked,marketing:all||el.querySelector('[name=marketing]').checked})); el.remove() }
  el.querySelector('.accept').onclick=()=>save(true); el.querySelector('.save').onclick=()=>save(false); el.querySelector('.essential').onclick=()=>{el.querySelectorAll('input:not(:disabled)').forEach(i=>i.checked=false);save(false)};el.querySelector('.cookie-x').onclick=()=>el.remove()
}

function bind() {
  const hd=document.querySelector('[data-header]');let prev=scrollY
  addEventListener('scroll',()=>{const y=scrollY;hd.classList.toggle('hidden',y>prev&&y>120);hd.classList.toggle('glass',y>16);prev=y},{passive:true})
  document.querySelectorAll('[data-menu]').forEach(b=>{b.onmouseenter=()=>document.querySelectorAll('.mega').forEach(m=>m.classList.toggle('open',m.dataset.mega===b.dataset.menu));b.onfocus=b.onmouseenter});hd.onmouseleave=()=>document.querySelectorAll('.mega').forEach(m=>m.classList.remove('open'))
  const burger=hd.querySelector('.burger');burger.onclick=()=>{hd.classList.toggle('menu-open');burger.setAttribute('aria-expanded',hd.classList.contains('menu-open'))}
  document.querySelectorAll('[data-route]').forEach(a=>a.onclick=e=>{const u=new URL(a.href);if(u.origin!==location.origin)return;e.preventDefault();document.body.classList.add('leaving');setTimeout(()=>{history.pushState({},'',u.pathname+u.hash);render();scrollTo(0,0)},260)})
  document.querySelector('[data-cookie-settings]')?.addEventListener('click',()=>cookies(true))
  const slides=[...document.querySelectorAll('.hero-slide')];if(slides.length>1&&!matchMedia('(prefers-reduced-motion:reduce)').matches){let i=0;setInterval(()=>{slides[i].classList.remove('active');i=(i+1)%slides.length;slides[i].classList.add('active')},6500)}
  const io=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting&&e.target.classList.add('in')),{threshold:.08});document.querySelectorAll('section,.values article').forEach(x=>io.observe(x))
}

function render(){document.body.classList.remove('leaving');const p=location.pathname.toLowerCase();const partner=location.hostname.startsWith('partners.')||p.startsWith('/partners');document.body.className=partner?'theme-partners':p.startsWith('/privacy')?'theme-privacy':'theme-studio';document.querySelector('#app').innerHTML=partner?partners():p.startsWith('/privacy')?privacy():studio();bind();requestAnimationFrame(()=>document.body.classList.add('ready'))}
addEventListener('popstate',render);render();setTimeout(()=>cookies(),1000)
