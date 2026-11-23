import { services, workflowSteps } from '../src/partners-outsourcing-data.js'

export function publicContent(escape, news) {
  const games = `
    <article>
      <h3>The Nick: Chapter 1</h3>
      <img src="/assets/images/TheNickCover.jpeg" alt="The Nick: Chapter 1 cover artwork">
      <p>A meta-horror experience from Flat Reality.</p>
      <a href="https://thenick.flatreality.eu/">Visit The Nick</a>
    </article>
    <article>
      <h3>RAIN HEART</h3>
      <img src="/assets/images/RAINHEARTCover.jpg" alt="RAIN HEART cover artwork">
      <p>A psychological horror game about identity.</p>
      <a href="https://rainheart.flatreality.eu/">Visit RAIN HEART</a>
      <a href="/rainheart/healthcare/">Health and content warning</a>
    </article>`

  const capabilities = services.map(service => `
    <article>
      <h3>${escape(service.title)}</h3>
      <p>${escape(service.shortDescription)}</p>
      <p>${escape(service.fullDescription)}</p>
      <ul>${service.deliverables.map(item => `<li>${escape(item)}</li>`).join('')}</ul>
    </article>`).join('')
  const process = workflowSteps.map(step => `<li><strong>${escape(step.title)}</strong> — ${escape(step.description)}</li>`).join('')
  const latest = news ? `<section><h2>Latest news from Flat Reality Channel</h2>${news}</section>` : ''

  return {
    studio: `<main>
      <h1>Flat Reality</h1>
      <p>Founded in 2019, Flat Reality is an independent European game studio based in Madrid, Spain. We create expressive games through gameplay, atmosphere, music and narrative.</p>
      <img src="/assets/images/FlatRealityCover.png" alt="Flat Reality studio cover artwork">
      <nav aria-label="Primary"><a href="/games/">Games</a><a href="/channel/">FR Channel</a><a href="/partners/">Flat Reality Partners</a></nav>
      <section><h2>Games made by Flat Reality</h2>${games}</section>
      ${latest}
    </main>`,
    games: `<main><h1>Games by Flat Reality</h1>${games}</main>`,
    partners: `<main>
      <h1>Flat Reality Partners</h1>
      <p>Flat Reality Partners is the B2B division of Flat Reality. We help game studios and creative teams with game development, Unity tools and production support through defined deliverables, production modules and ongoing collaboration.</p>
      <nav aria-label="Partner services"><a href="/partners/outsourcing/">Outsourcing and capabilities</a><a href="/partners/outsourcing/retainer-plus/">Retainer Plus</a><a href="/partners/case-studies/">Case studies</a><a href="/partners/network/independent-partner/">Independent Partner network</a></nav>
      <section><h2>Game development capabilities</h2>${capabilities}</section>
      <p>Contact <a href="mailto:contact@flatreality.eu">contact@flatreality.eu</a>.</p>
    </main>`,
    outsourcing: `<main>
      <h1>Game Development Outsourcing</h1>
      <p>Flat Reality Partners offers flexible game development and production support for defined deliverables, production modules and ongoing collaboration.</p>
      <nav aria-label="Outsourcing"><a href="/partners/outsourcing/new-inquiry/">Start a Project</a><a href="/partners/outsourcing/retainer-plus/">Retainer Plus</a><a href="/partners/case-studies/">Case studies</a></nav>
      <section><h2>Our Capabilities</h2>${capabilities}</section>
      <section><h2>How We Work</h2><ol>${process}</ol></section>
      <section><h2>Powered by Technology</h2><img src="/assets/images/PartnersTechnologyBackground.png" alt="Illustration for Flat Reality development technology"><p>Flat Reality Partners builds tools including Phantom UI and the Flat Reality SDK and offers implementation support.</p></section>
    </main>`
  }
}
