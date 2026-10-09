const KEY = 'fr_retainer_inquiry_draft_v1'
export const CONTACT_KEY = 'fr_partners_contact_profile_v1'
const VERSION = 1
const MAX_AGE = 30 * 24 * 60 * 60 * 1000

const clean = value => typeof value === 'string' ? value : ''

export function emptyRetainerDraft() {
  const profile = getContactProfile()
  return {
    version: VERSION,
    mode: '',
    selectedOfferingIds: [],
    offeringQuantities: {},
    experienceLevels: {},
    engagementModel: '',
    monthlyCapacity: '',
    customMonthlyCapacity: '',
    duration: '',
    customDuration: '',
    preferredStart: '',
    specificStartDate: '',
    budgetRange: 'Not Sure Yet',
    projectDescription: '',
    name: profile.name,
    organization: profile.organization,
    email: profile.email,
    projectUrl: profile.projectUrl,
    privacyAcknowledged: false,
    marketingConsent: false,
    currentStep: 1,
    updatedAt: Date.now(),
  }
}

export function getContactProfile() {
  const empty = { name: '', organization: '', email: '', projectUrl: '', updatedAt: 0 }
  try {
    const parsed = JSON.parse(localStorage.getItem(CONTACT_KEY) || 'null')
    if (!parsed || Date.now() - Number(parsed.updatedAt || 0) > MAX_AGE) {
      localStorage.removeItem(CONTACT_KEY)
      return empty
    }
    return { name: clean(parsed.name), organization: clean(parsed.organization), email: clean(parsed.email), projectUrl: clean(parsed.projectUrl), updatedAt: Number(parsed.updatedAt) || 0 }
  } catch { return empty }
}

export function saveContactProfile(profile = {}) {
  const next = { ...getContactProfile(), ...profile, updatedAt: Date.now() }
  try { localStorage.setItem(CONTACT_KEY, JSON.stringify(next)) } catch {}
  return next
}

export function clearContactProfile() {
  try { localStorage.removeItem(CONTACT_KEY) } catch {}
}

export function getRetainerDraft() {
  const empty = emptyRetainerDraft()
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || 'null')
    if (!parsed || parsed.version !== VERSION || Date.now() - Number(parsed.updatedAt || 0) > MAX_AGE) {
      localStorage.removeItem(KEY)
      return empty
    }
    return {
      ...empty,
      ...parsed,
      selectedOfferingIds: [...new Set(Array.isArray(parsed.selectedOfferingIds) ? parsed.selectedOfferingIds.filter(id => typeof id === 'string') : [])],
      offeringQuantities: parsed.offeringQuantities && typeof parsed.offeringQuantities === 'object' ? parsed.offeringQuantities : {},
      experienceLevels: parsed.experienceLevels && typeof parsed.experienceLevels === 'object' ? parsed.experienceLevels : {},
      currentStep: Math.min(4, Math.max(1, Number(parsed.currentStep) || 1)),
    }
  } catch { return empty }
}

export function saveRetainerDraft(patch = {}) {
  const current = getRetainerDraft()
  const next = { ...current, ...patch, version: VERSION, updatedAt: Date.now() }
  if (patch.selectedOfferingIds) next.selectedOfferingIds = [...new Set(patch.selectedOfferingIds)]
  try { localStorage.setItem(KEY, JSON.stringify(next)) } catch {}
  window.dispatchEvent(new CustomEvent('fr-retainer-change', { detail: next }))
  return next
}

export function clearRetainerDraft() {
  try { localStorage.removeItem(KEY) } catch {}
  window.dispatchEvent(new CustomEvent('fr-retainer-change', { detail: emptyRetainerDraft() }))
}

export function hasMeaningfulRetainerDraft(draft = getRetainerDraft()) {
  return Boolean(draft.mode || draft.selectedOfferingIds.length || draft.projectDescription || draft.engagementModel || draft.currentStep > 1)
}
