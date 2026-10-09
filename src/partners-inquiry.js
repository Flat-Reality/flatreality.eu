import { PARTNERS_INQUIRY_ENDPOINT, SUPABASE_PUBLISHABLE_KEY } from './lib/supabase-config.js'
import { additionalServices, allServices, budgetRanges, collaborationModels, projectStages, services, timelines } from './partners-outsourcing-data.js'
import { clearInquiryDraft, emptyInquiry, getInquiryDraft, hasMeaningfulDraft, saveInquiryDraft } from './partners-inquiry-store.js'
import { saveContactProfile } from './retainer-plus-store.js'

let controller
const arrow = '<span aria-hidden="true">→</span>'
const escapeHtml = value => String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char])

function optionButton(value, group, selected = false) {
  return `<button class="inquiry-option ${selected ? 'selected' : ''}" type="button" data-option-group="${group}" data-option-value="${escapeHtml(value)}" aria-pressed="${selected}"><span>${escapeHtml(value)}</span><i aria-hidden="true">✓</i></button>`
}

function serviceOption(service, selected = false) {
  return `<button class="inquiry-service-option ${selected ? 'selected' : ''}" type="button" data-inquiry-service="${service.id}" aria-pressed="${selected}"><span class="inquiry-service-option__icon" ${service.iconLabel ? `role="img" aria-label="${service.iconLabel}"` : 'aria-hidden="true"'}>${service.icon}</span><b>${escapeHtml(service.title)}</b><i aria-hidden="true">✓</i></button>`
}

function budgetSlider(selected) {
  const index = Math.max(0, budgetRanges.indexOf(selected))
  return `<div class="inquiry-budget"><output data-budget-value>${escapeHtml(budgetRanges[index])}</output><input name="budgetIndex" type="range" min="0" max="${budgetRanges.length - 1}" step="1" value="${index}" aria-label="Approximate budget"><div class="inquiry-budget__ticks" aria-hidden="true">${budgetRanges.map(() => '<i></i>').join('')}</div><div class="inquiry-budget__labels" aria-hidden="true">${budgetRanges.map(value => `<span>${escapeHtml(value)}</span>`).join('')}</div></div>`
}

export function inquiryPage() {
  const draft = getInquiryDraft()
  const serviceOptions = [...services, ...additionalServices].map(item => serviceOption(item, draft.selectedServices.includes(item.id))).join('')
  return `<div class="inquiry-builder" data-inquiry-builder>
    <div class="inquiry-builder__top"><a href="/partners/outsourcing/" data-route aria-label="Return to Outsourcing"><img src="/assets/logos/LogoBlackTransparent.png" alt=""><span>Flat Reality <b>Partners</b></span></a><button type="button" data-exit-inquiry>Close</button></div>
    <section class="inquiry-welcome" data-inquiry-welcome hidden><div><img src="/assets/logos/LogoBlackTransparent.png" alt=""><h1>Welcome back!</h1><p>Your inquiry is right where you left it.</p><button class="inquiry-primary" type="button" data-continue-draft>Continue Your Inquiry ${arrow}</button><button class="inquiry-text-button" type="button" data-start-over>Start Over</button><small>Your unfinished inquiry is stored on this device for up to 30 days.</small></div></section>
    <main class="inquiry-shell" data-inquiry-shell>
      <header class="inquiry-progress"><span data-step-label>Step ${draft.currentStep} of 3</span><div><i data-progress-line style="--progress:${draft.currentStep / 3}"></i></div></header>
      <form data-inquiry-form novalidate>
        <section class="inquiry-step" data-inquiry-step="1" tabindex="-1"><h1>What do you need help with?</h1><p>Select all that apply.</p><div class="inquiry-services">${serviceOptions}</div><fieldset><legend>How would you like to collaborate?</legend><div class="inquiry-options inquiry-options--four">${collaborationModels.map(value => optionButton(value, 'collaborationModel', draft.collaborationModel === value)).join('')}</div><aside class="inquiry-retainer-note" data-retainer-note ${draft.collaborationModel === 'Ongoing Support' ? '' : 'hidden'}><b>Retainer Plus might be a good fit.</b><p>For continuous production needs, you may want to explore our long-term collaboration offering.</p></aside></fieldset><output class="inquiry-error" data-step-error="1" aria-live="polite"></output><footer><span></span><button class="inquiry-primary" type="button" data-next-step>Continue ${arrow}</button></footer></section>

        <section class="inquiry-step" data-inquiry-step="2" tabindex="-1" hidden><h1>Tell us about your project.</h1><fieldset><legend>What stage is your project at?</legend><div class="inquiry-options inquiry-options--four">${projectStages.map(value => optionButton(value, 'projectStage', draft.projectStage === value)).join('')}</div></fieldset><fieldset><legend>What's your approximate budget?</legend>${budgetSlider(draft.budgetRange)}</fieldset><fieldset><legend>When would you like to get started?</legend><div class="inquiry-options inquiry-options--four">${timelines.map(value => optionButton(value, 'timeline', draft.timeline === value)).join('')}</div></fieldset><output class="inquiry-error" data-step-error="2" aria-live="polite"></output><footer><button class="inquiry-back" type="button" data-back-step>Back</button><button class="inquiry-primary" type="button" data-next-step>Continue ${arrow}</button></footer></section>

        <section class="inquiry-step" data-inquiry-step="3" tabindex="-1" hidden><h1>Almost there.</h1><p>Just a few more details and we're ready to hear from you.</p><div class="inquiry-fields"><label class="inquiry-fields__wide"><span>Project Description</span><textarea name="projectDescription" rows="8" maxlength="6000" required placeholder="Tell us about your game, your goals, or the challenge you'd like us to help with.">${escapeHtml(draft.projectDescription)}</textarea></label><label><span>Your Name</span><input name="name" maxlength="120" required value="${escapeHtml(draft.name)}"></label><label><span>Studio / Organization <small>Optional</small></span><input name="organization" maxlength="160" value="${escapeHtml(draft.organization)}"></label><label><span>Email Address</span><input name="email" type="email" maxlength="254" required value="${escapeHtml(draft.email)}"></label><label><span>Optional Project Link</span><input name="projectUrl" type="url" maxlength="500" placeholder="https://" value="${escapeHtml(draft.projectUrl)}"></label><label class="inquiry-honeypot" aria-hidden="true"><span>Website</span><input name="company_website" tabindex="-1" autocomplete="off"></label></div><section class="inquiry-summary"><h2>Inquiry Summary</h2><dl data-inquiry-summary></dl><button type="button" data-edit-inquiry>Edit selections</button></section><div class="inquiry-consents"><label class="inquiry-privacy"><input name="privacyAcknowledged" type="checkbox" required ${draft.privacyAcknowledged ? 'checked' : ''}><span>I have read the <a href="/privacy/" target="_blank" rel="noopener">Flat Reality Privacy Policy</a> and understand how my inquiry data will be processed.</span></label><label class="inquiry-privacy"><input name="marketingConsent" type="checkbox" ${draft.marketingConsent ? 'checked' : ''}><span>I would like to receive marketing news about opportunities for Flat Reality Partners. <small>Optional. You can unsubscribe at any time.</small></span></label></div><p class="inquiry-device-note">Your unfinished inquiry may be saved locally on this device for up to 30 days. It is removed after successful submission.</p><output class="inquiry-error" data-step-error="3" aria-live="polite"></output><footer><button class="inquiry-back" type="button" data-back-step>Back</button><button class="inquiry-primary" type="submit">Send Inquiry ${arrow}</button></footer></section>
      </form>
    </main>
    <section class="inquiry-success" data-inquiry-success tabindex="-1" hidden><img src="/assets/logos/LogoBlackTransparent.png" alt=""><h1>Inquiry sent.</h1><p>Thank you. Your request is safely with Flat Reality Partners.</p><b data-inquiry-reference></b><a class="inquiry-primary" href="/partners/" data-route>Back to FR Partners ${arrow}</a></section>
    <div class="inquiry-confirm" data-start-over-confirm hidden><div role="dialog" aria-modal="true" aria-labelledby="start-over-title"><h2 id="start-over-title">Start over?</h2><p>This removes the unfinished inquiry stored on this device.</p><button class="inquiry-primary" type="button" data-confirm-start-over>Start Over</button><button class="inquiry-text-button" type="button" data-cancel-start-over>Keep My Draft</button></div></div>
  </div>`
}

function validStep(state, step) {
  if (step === 1 && !state.selectedServices.length) return 'Choose at least one service to continue.'
  if (step === 2 && (!state.projectStage || !state.budgetRange || !state.timeline)) return 'Choose one answer in each group to continue.'
  return ''
}

export function initInquiry() {
  controller?.abort()
  controller = new AbortController()
  const { signal } = controller
  const root = document.querySelector('[data-inquiry-builder]')
  if (!root) return
  root.querySelectorAll('.header[data-header]').forEach(node => node.remove())
  let state = getInquiryDraft()
  const form = root.querySelector('[data-inquiry-form]')
  const shell = root.querySelector('[data-inquiry-shell]')
  const welcome = root.querySelector('[data-inquiry-welcome]')
  const success = root.querySelector('[data-inquiry-success]')
  const directEntry = sessionStorage.getItem('fr_inquiry_direct_entry') === '1'
  sessionStorage.removeItem('fr_inquiry_direct_entry')

  const persist = patch => { state = saveInquiryDraft(patch); return state }
  const updateSummary = () => {
    const names = state.selectedServices.map(id => allServices.find(item => item.id === id)?.title).filter(Boolean)
    root.querySelector('[data-inquiry-summary]').innerHTML = `<div><dt>Selected Services</dt><dd>${names.map(escapeHtml).join(', ') || 'None selected'}</dd></div><div><dt>Collaboration Model</dt><dd>${escapeHtml(state.collaborationModel || 'Not Sure Yet')}</dd></div><div><dt>Current Stage</dt><dd>${escapeHtml(state.projectStage || 'Not selected')}</dd></div><div><dt>Budget</dt><dd>${escapeHtml(state.budgetRange || 'Not selected')}</dd></div><div><dt>Timeline</dt><dd>${escapeHtml(state.timeline || 'Not selected')}</dd></div>`
  }
  const showStep = (step, focus = true) => {
    state = persist({ currentStep: step })
    root.querySelectorAll('[data-inquiry-step]').forEach(section => { section.hidden = Number(section.dataset.inquiryStep) !== step })
    root.querySelector('[data-step-label]').textContent = `Step ${step} of 3`
    root.querySelector('[data-progress-line]').style.setProperty('--progress', step / 3)
    updateSummary()
    scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
    if (focus) setTimeout(() => root.querySelector(`[data-inquiry-step="${step}"]`)?.focus(), 20)
  }
  const syncControls = () => {
    root.querySelectorAll('[data-inquiry-service]').forEach(button => {
      const active = state.selectedServices.includes(button.dataset.inquiryService)
      button.classList.toggle('selected', active)
      button.setAttribute('aria-pressed', String(active))
    })
    root.querySelectorAll('[data-option-group]').forEach(button => {
      const active = state[button.dataset.optionGroup] === button.dataset.optionValue
      button.classList.toggle('selected', active)
      button.setAttribute('aria-pressed', String(active))
    })
    root.querySelector('[data-retainer-note]').hidden = state.collaborationModel !== 'Ongoing Support'
    updateSummary()
  }

  root.querySelectorAll('[data-inquiry-service]').forEach(button => button.addEventListener('click', () => {
    const selected = new Set(state.selectedServices)
    selected.has(button.dataset.inquiryService) ? selected.delete(button.dataset.inquiryService) : selected.add(button.dataset.inquiryService)
    persist({ selectedServices: [...selected] })
    syncControls()
  }, { signal }))
  root.querySelectorAll('[data-option-group]').forEach(button => button.addEventListener('click', () => { persist({ [button.dataset.optionGroup]: button.dataset.optionValue }); syncControls() }, { signal }))
  const budgetInput = root.querySelector('[name="budgetIndex"]')
  budgetInput.addEventListener('input', () => {
    const budgetRange = budgetRanges[Number(budgetInput.value)]
    root.querySelector('[data-budget-value]').textContent = budgetRange
    persist({ budgetRange })
    updateSummary()
  }, { signal })
  root.querySelectorAll('[data-next-step]').forEach(button => button.addEventListener('click', () => {
    const step = Number(button.closest('[data-inquiry-step]').dataset.inquiryStep)
    const error = validStep(state, step)
    root.querySelector(`[data-step-error="${step}"]`).textContent = error
    if (!error) showStep(step + 1)
  }, { signal }))
  root.querySelectorAll('[data-back-step]').forEach(button => button.addEventListener('click', () => showStep(Number(button.closest('[data-inquiry-step]').dataset.inquiryStep) - 1), { signal }))
  root.querySelector('[data-edit-inquiry]').addEventListener('click', () => showStep(1), { signal })

  let inputTimer
  form.addEventListener('input', () => {
    clearTimeout(inputTimer)
    inputTimer = setTimeout(() => {
      const data = new FormData(form)
      persist({ projectDescription: String(data.get('projectDescription') || ''), name: String(data.get('name') || ''), organization: String(data.get('organization') || ''), email: String(data.get('email') || ''), projectUrl: String(data.get('projectUrl') || ''), privacyAcknowledged: Boolean(data.get('privacyAcknowledged')), marketingConsent: Boolean(data.get('marketingConsent')) })
    }, 280)
  }, { signal })

  form.addEventListener('submit', async event => {
    event.preventDefault()
    const errorNode = root.querySelector('[data-step-error="3"]')
    errorNode.textContent = ''
    if (!form.reportValidity()) return
    const data = new FormData(form)
    state = persist({ projectDescription: String(data.get('projectDescription') || '').trim(), name: String(data.get('name') || '').trim(), organization: String(data.get('organization') || '').trim(), email: String(data.get('email') || '').trim(), projectUrl: String(data.get('projectUrl') || '').trim(), privacyAcknowledged: Boolean(data.get('privacyAcknowledged')), marketingConsent: Boolean(data.get('marketingConsent')) })
    const submit = form.querySelector('[type="submit"]')
    submit.disabled = true
    submit.textContent = 'Sending…'
    try {
      const response = await fetch(PARTNERS_INQUIRY_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: SUPABASE_PUBLISHABLE_KEY },
        body: JSON.stringify({
          name: state.name,
          organization: state.organization,
          email: state.email,
          project_url: state.projectUrl,
          project_description: state.projectDescription,
          selected_services: state.selectedServices,
          collaboration_model: state.collaborationModel,
          project_stage: state.projectStage,
          budget_range: state.budgetRange,
          timeline: state.timeline,
          source_page: 'Flat Reality Partners / Outsourcing',
          privacy_acknowledged: state.privacyAcknowledged,
          privacy_notice_version: '2026-10-08',
          marketing_consent: state.marketingConsent,
          company_website: String(data.get('company_website') || ''),
        }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok || !result.saved || !result.inquiry_id) throw new Error(result.error || 'The inquiry could not be saved. Please try again.')
      saveContactProfile({ name: state.name, organization: state.organization, email: state.email, projectUrl: state.projectUrl })
      clearInquiryDraft()
      shell.hidden = true
      success.hidden = false
      root.querySelector('[data-inquiry-reference]').textContent = `Reference: ${result.reference || result.inquiry_id}`
      success.focus()
    } catch (error) {
      errorNode.textContent = error.message || 'The inquiry could not be sent. Your draft is still safe on this device.'
    } finally {
      submit.disabled = false
      submit.innerHTML = `Send Inquiry ${arrow}`
    }
  }, { signal })

  const confirm = root.querySelector('[data-start-over-confirm]')
  root.querySelector('[data-start-over]').addEventListener('click', () => { confirm.hidden = false; confirm.querySelector('[data-confirm-start-over]').focus() }, { signal })
  root.querySelector('[data-cancel-start-over]').addEventListener('click', () => { confirm.hidden = true }, { signal })
  root.querySelector('[data-confirm-start-over]').addEventListener('click', () => {
    clearInquiryDraft()
    state = emptyInquiry()
    confirm.hidden = true
    welcome.hidden = true
    shell.hidden = false
    location.reload()
  }, { signal })
  root.querySelector('[data-continue-draft]').addEventListener('click', () => { welcome.hidden = true; shell.hidden = false; showStep(state.currentStep) }, { signal })
  root.querySelector('[data-exit-inquiry]').addEventListener('click', () => { history.pushState({}, '', '/partners/outsourcing/'); window.dispatchEvent(new PopStateEvent('popstate')) }, { signal })
  root.addEventListener('click', event => {
    if (event.target.closest('[data-continue-draft]')) { welcome.hidden = true; shell.hidden = false; showStep(state.currentStep) }
  }, { signal })

  if (hasMeaningfulDraft(state) && !directEntry) { welcome.hidden = false; shell.hidden = true }
  else showStep(state.currentStep, false)
  syncControls()
  root.dataset.inquiryReady = 'true'
}
