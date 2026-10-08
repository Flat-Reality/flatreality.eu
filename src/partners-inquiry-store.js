const KEY = 'fr_partners_inquiry_draft_v1'
const VERSION = 1
const MAX_AGE = 30 * 24 * 60 * 60 * 1000
let memoryDraft = null

const clean = value => typeof value === 'string' ? value : ''

export function emptyInquiry() {
  return {
    version: VERSION,
    selectedServices: [],
    collaborationModel: 'Not Sure Yet',
    projectStage: '',
    budgetRange: 'Not Sure Yet',
    timeline: '',
    projectDescription: '',
    name: '',
    organization: '',
    email: '',
    projectUrl: '',
    privacyAcknowledged: false,
    marketingConsent: false,
    currentStep: 1,
    updatedAt: Date.now(),
  }
}

export function getInquiryDraft() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || 'null')
    if (!parsed || parsed.version !== VERSION || Date.now() - Number(parsed.updatedAt || 0) > MAX_AGE) {
      localStorage.removeItem(KEY)
      return memoryDraft || emptyInquiry()
    }
    memoryDraft = {
      ...emptyInquiry(),
      ...parsed,
      selectedServices: [...new Set(Array.isArray(parsed.selectedServices) ? parsed.selectedServices.filter(id => typeof id === 'string') : [])],
      currentStep: Math.min(3, Math.max(1, Number(parsed.currentStep) || 1)),
      projectDescription: clean(parsed.projectDescription),
      name: clean(parsed.name),
      organization: clean(parsed.organization),
      email: clean(parsed.email),
      projectUrl: clean(parsed.projectUrl),
      budgetRange: clean(parsed.budgetRange) || 'Not Sure Yet',
      marketingConsent: parsed.marketingConsent === true,
    }
    return memoryDraft
  } catch {
    return memoryDraft || emptyInquiry()
  }
}

export function saveInquiryDraft(patch = {}) {
  const current = getInquiryDraft()
  const next = { ...current, ...patch, version: VERSION, updatedAt: Date.now() }
  if (patch.selectedServices) next.selectedServices = [...new Set(patch.selectedServices)]
  memoryDraft = next
  try { localStorage.setItem(KEY, JSON.stringify(next)) } catch {}
  window.dispatchEvent(new CustomEvent('fr-inquiry-change', { detail: next }))
  return next
}

export function mergeInquiryDraft(patch = {}) {
  const current = getInquiryDraft()
  const next = { ...current }
  Object.entries(patch).forEach(([key, value]) => {
    if (key === 'selectedServices') next.selectedServices = [...new Set([...(current.selectedServices || []), ...(value || [])])]
    else if (value !== '' && value !== null && value !== undefined) next[key] = value
  })
  return saveInquiryDraft(next)
}

export function toggleInquiryService(id) {
  const draft = getInquiryDraft()
  const selected = new Set(draft.selectedServices)
  selected.has(id) ? selected.delete(id) : selected.add(id)
  return saveInquiryDraft({ selectedServices: [...selected] })
}

export function clearInquiryDraft() {
  memoryDraft = null
  try { localStorage.removeItem(KEY) } catch {}
  window.dispatchEvent(new CustomEvent('fr-inquiry-change', { detail: emptyInquiry() }))
}

export function hasMeaningfulDraft(draft = getInquiryDraft()) {
  return Boolean(
    draft.selectedServices.length ||
    draft.projectDescription || draft.name || draft.organization || draft.email || draft.projectUrl ||
    draft.projectStage || draft.budgetRange || draft.timeline ||
    draft.collaborationModel !== 'Not Sure Yet' || draft.currentStep > 1
  )
}
