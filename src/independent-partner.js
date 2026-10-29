export const independentPartnerPath = '/partners/network/independent-partner/'
export const independentPartnerSeo = {
  title: 'Become an Independent GameDev Partner | Flat Reality Partners',
  description: "Join Flat Reality Partners' network of independent game developers, artists and designers. Explore paid project opportunities, flexible collaboration and professional growth.",
  canonical: `https://flatreality.eu${independentPartnerPath}`,
  image: 'https://flatreality.eu/assets/images/IPkeyart.png',
  imageAlt: 'An independent creator facing a city of tall architectural structures',
}
const tallyUrl = 'https://tally.so/r/jagbWE'
const external = '<span class="ext" aria-hidden="true"><img src="/assets/icons/LinkIcon.png" alt="" width="20" height="20"></span>'
const applyButton = (light = false, placement = 'hero') => `<a class="outline ${light ? 'outline--white' : ''}" href="${tallyUrl}" target="_blank" rel="noopener noreferrer" data-partner-apply="${placement}">Apply to Join ${external}</a>`
const icon = paths => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`
const benefits = [
  { title:'Get Paid for Your Work', text:'Explore paid game development projects with clear requirements, budgets and terms before accepting an assignment.', icon:icon('<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12a24 24 0 0 0 18 0M12 12v3"/>') },
  { title:'Keep Your Freedom', text:"Stay independent. Choose the opportunities that work for you, whether you're studying, working another job or freelancing full-time.", icon:icon('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18M8 15h2M14 15h2M8 18h2"/>') },
  { title:'Grow in GameDev', text:'Collaborate with creators, strengthen your portfolio and gain experience working on real game development projects.', icon:icon('<path d="M6 8h12c2 0 3 2 3 4l1 5a2 2 0 0 1-3 2l-4-3H9l-4 3a2 2 0 0 1-3-2l1-5c0-2 1-4 3-4ZM7 10v4M5 12h4M16 11h.01M18 13h.01"/>') },
]
const steps = [
  ['Apply Online', 'Tell us about yourself, your skills, portfolio and availability through our online application.'],
  ['Get Vetted', "We'll review your application. If your profile is a match, we'll guide you through a short onboarding process."],
  ['Choose Your Projects', 'Once approved, you may receive project invitations relevant to your profile. Review the scope and terms, and decide whether to accept.'],
]
const faq = [
  ['Do I need professional experience?', 'Not necessarily. Junior creators and motivated newcomers are welcome to apply. Your skills, potential and portfolio matter.'],
  ['Can I combine this with my studies or another job?', 'Yes. Independent collaboration is designed to accommodate different schedules, subject to your availability and any agreed project commitments.'],
  ['Do I have to accept every project?', "No. You're free to review opportunities and decide whether they work for you."],
  ['How much can I earn?', "Payment depends on the project, its scope and the agreed commercial terms. You'll have the opportunity to share your rate expectations during the application process."],
  ['Can this lead to a full-time position?', 'Potentially. Some collaborations may evolve into recurring work or longer-term opportunities. Core Team and full-time positions depend on available roles, location, legal eligibility and business needs, and are never guaranteed.'],
]

// Shared with the build so this page's complete content is available without JavaScript.
export function independentPartnerBody() {
  return `<section class="ip-hero"><div><h1>Your skills.<br>Real games.<br>Your terms.</h1><p>Find paid game development opportunities, collaborate with independent creators, and choose projects that fit your life.</p>${applyButton()}</div><img src="/assets/images/IPkeyart.png" width="1536" height="1024" alt="An independent creator facing a city of tall architectural structures" fetchpriority="high" decoding="async"></section>
    <section class="ip-section ip-benefits"><header><h2>Work independently.<br>Create together.</h2><div><p>Flat Reality Partners connects independent game developers, artists, designers and creative professionals with project-based opportunities.</p><p>Join our Vetted Network and be considered for work that matches your skills, interests and availability.</p></div></header><div class="ip-benefit-grid">${benefits.map(item=>`<article>${item.icon}<h3>${item.title}</h3><p>${item.text}</p></article>`).join('')}</div></section>
    <section class="retainer-section retainer-models ip-how"><header><h2>How It Works</h2></header><div>${steps.map(([title,text],index)=>`<article><span aria-label="Step ${index+1}">0${index+1}</span><h3>${title}</h3><p>${text}</p></article>`).join('')}</div></section>
    <section class="ip-section ip-growth"><div class="ip-growth-card"><div><h2>Start independent.<br>Grow further.</h2><p>A great collaboration can open new doors.</p><p>Start with freelance projects, build professional relationships, and explore opportunities for recurring work or long-term production engagements.</p><p>As Flat Reality grows, selected partners may also be considered for opportunities within our Core Team, including full-time positions where available.</p><p class="ip-growth-note">Long-term and employment opportunities depend on available roles, location, legal eligibility and business needs. Joining the network does not guarantee a permanent position.</p></div><aside aria-label="Possible directions for collaboration"><p>Independent</p><span aria-hidden="true">↓</span><p>Long-Term</p><span aria-hidden="true">↓</span><p>Core Team</p><small>Possible paths.<br>Individual opportunities.</small></aside></div></section>
    <section class="ip-section ip-knowledge"><header><h2>A few things<br>worth knowing.</h2><div><p>Independent Partners collaborate with Flat Reality on a freelance, project-by-project basis.</p><p>Joining the network does not create an employment relationship or guarantee projects or income. Each paid engagement is agreed separately before work begins.</p><p>You'll need to meet the applicable legal and communication requirements to participate.</p></div></header><div class="ip-faq">${faq.map(([question,answer])=>`<details><summary><h3>${question}</h3><span aria-hidden="true">+</span></summary><div><p>${answer}</p></div></details>`).join('')}</div></section>
    <section class="ip-section ip-final"><div><div><h2>Good games<br>need good people.</h2><p>Your next collaboration could start here.</p></div>${applyButton(true,'footer')}</div></section>`
}

export function independentPartnerPage({header,footer}) {
  return `<div class="site partners independent-partner" id="top">${header(true)}<main class="page-surface">${independentPartnerBody()}</main>${footer()}</div>`
}
