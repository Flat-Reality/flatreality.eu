export const retainerCategories = [
  'Art',
  'Programming',
  'Game Design & Narrative',
  'Sound & Music',
  'Production',
  'Inclusive Design & Accessibility',
]

export const retainerTabs = [
  { id: 'specialist', label: 'Specialists' },
  { id: 'team', label: 'Teams' },
  { id: 'capacity', label: 'Capacity' },
]

// Public catalogue only. Availability is intentionally unknown until Workspace supplies it.
export const retainerOfferings = [
  { id: 'concept-artist', type: 'specialist', category: 'Art', title: 'Concept Artist', description: 'Visual development and production-ready direction for characters, environments and key moments.', tags: ['Concept Art', 'Sketching', 'Art Direction'], availability: 'unknown' },
  { id: 'ui-artist', type: 'specialist', category: 'Art', title: 'UI Artist', description: 'Readable, expressive interface assets designed for real production constraints.', tags: ['UI Art', 'UX Support', 'Production Assets'], availability: 'unknown' },
  { id: 'unity-developer', type: 'specialist', category: 'Programming', title: 'Unity Developer', description: 'Gameplay, tools and systems engineering for Unity productions.', tags: ['Unity', 'Gameplay', 'Tools'], availability: 'unknown' },
  { id: 'game-designer', type: 'specialist', category: 'Game Design & Narrative', title: 'Game Designer', description: 'Systems, mechanics, balancing and documentation that keep production moving.', tags: ['Systems Design', 'Balancing', 'Documentation'], availability: 'unknown' },
  { id: 'narrative-designer', type: 'specialist', category: 'Game Design & Narrative', title: 'Narrative Designer', description: 'Narrative structure and implementation shaped around the player experience.', tags: ['Narrative', 'Dialogue', 'Implementation'], availability: 'unknown' },
  { id: 'sound-designer', type: 'specialist', category: 'Sound & Music', title: 'Sound Designer', description: 'Responsive sound and atmosphere for interactive experiences.', tags: ['Sound Design', 'Implementation', 'Atmosphere'], availability: 'unknown' },
  { id: 'producer', type: 'specialist', category: 'Production', title: 'Producer', description: 'Planning, coordination and transparent production workflows.', tags: ['Planning', 'Coordination', 'Delivery'], availability: 'unknown' },
  { id: 'accessibility-consultant', type: 'specialist', category: 'Inclusive Design & Accessibility', title: 'Inclusive Design Consultant', description: 'Practical accessibility and representation support for games and interactive products.', tags: ['Accessibility', 'UX Review', 'Representation'], availability: 'unknown' },
  { id: 'art-production-pod', type: 'team', category: 'Art', title: 'Art Production Pod', description: 'A coordinated visual production unit for concept, UI and asset delivery.', tags: ['Art Direction', 'Concept Art', 'UI Art'], roles: ['Art direction', 'Concept art', 'UI art'], availability: 'unknown' },
  { id: 'gameplay-systems-pod', type: 'team', category: 'Programming', title: 'Gameplay Systems Pod', description: 'A coordinated Unity and design unit for dependable gameplay systems.', tags: ['Unity', 'Game Design', 'Production'], roles: ['Unity development', 'Game design', 'Production'], availability: 'unknown' },
  { id: 'narrative-design-pod', type: 'team', category: 'Game Design & Narrative', title: 'Narrative Design Pod', description: 'A coordinated team for narrative design, dialogue and implementation support.', tags: ['Narrative', 'Dialogue', 'Implementation'], roles: ['Narrative design', 'Game design', 'Implementation'], availability: 'unknown' },
  { id: 'cross-disciplinary-team', type: 'team', category: 'Production', title: 'Cross-Disciplinary Production Team', description: 'A tailored production group coordinated as one Flat Reality delivery unit.', tags: ['Production', 'Design', 'Development'], roles: ['Production', 'Design', 'Development'], availability: 'unknown' },
  { id: 'art-production-capacity', type: 'capacity', category: 'Art', title: 'Art Production Capacity', description: 'Flexible visual development capacity for a changing art backlog.', tags: ['Concept Art', 'UI Art', 'Production'], availability: 'unknown' },
  { id: 'flexible-unity-capacity', type: 'capacity', category: 'Programming', title: 'Flexible Unity Capacity', description: 'Reserved Unity development time that can move with your technical backlog.', tags: ['Unity', 'Gameplay', 'Technical Support'], availability: 'unknown' },
  { id: 'design-capacity', type: 'capacity', category: 'Game Design & Narrative', title: 'Game Design Capacity', description: 'Ongoing systems and narrative design capacity for evolving production needs.', tags: ['Systems', 'Narrative', 'Balancing'], availability: 'unknown' },
  { id: 'audio-capacity', type: 'capacity', category: 'Sound & Music', title: 'Audio Production Capacity', description: 'Flexible sound design, music and implementation support.', tags: ['Audio', 'Music', 'Implementation'], availability: 'unknown' },
  { id: 'production-capacity', type: 'capacity', category: 'Production', title: 'Production Capacity', description: 'Additional planning and coordination capacity for milestones and delivery.', tags: ['Planning', 'Coordination', 'Workflows'], availability: 'unknown' },
  { id: 'inclusive-capacity', type: 'capacity', category: 'Inclusive Design & Accessibility', title: 'Inclusive Design Capacity', description: 'Ongoing accessibility-oriented UX and representation review support.', tags: ['Accessibility', 'UX', 'Review'], availability: 'unknown' },
]

export const engagementModels = [
  { id: 'dedicated-specialist', title: 'Dedicated Specialist', description: 'Reserved capacity in a defined specialization.' },
  { id: 'production-team', title: 'Production Team', description: 'A coordinated team spanning multiple professional roles.' },
  { id: 'flexible-capacity', title: 'Flexible Capacity', description: 'An agreed amount of time for changing tasks and backlog.' },
]

export const experienceLevels = [
  { id: 'junior', label: 'Junior' }, { id: 'middle', label: 'Middle' }, { id: 'senior', label: 'Senior' }, { id: 'lead', label: 'Lead' },
]

export const capacityOptions = ['20 hours / month', '40 hours / month', '80 hours / month', '160 hours / month', 'Custom']
export const durationOptions = ['1 month', '3 months', '6 months', 'Custom']
export const preferredStartOptions = ['As Soon As Possible', 'Within a Month', 'Flexible / Not Sure Yet', 'Specific Date']

export function getRetainerOfferings() {
  return retainerOfferings.filter(item => item.published !== false)
}

export async function loadRetainerOfferings() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/retainer_offerings?select=id,type,category,title,description,tags,roles,availability,checked_at,reason_code&order=category.asc,title.asc`, {
      headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}` },
    })
    if (!response.ok) return getRetainerOfferings()
    const rows = await response.json()
    if (!Array.isArray(rows) || !rows.length) return getRetainerOfferings()
    retainerOfferings.splice(0, retainerOfferings.length, ...rows.map(item => ({
      ...item,
      tags: Array.isArray(item.tags) ? item.tags : [],
      roles: Array.isArray(item.roles) ? item.roles : [],
      checkedAt: item.checked_at || '',
      reasonCode: item.reason_code || '',
      published: true,
    })))
  } catch {
    // Static catalogue remains available when the public projection is offline.
  }
  return getRetainerOfferings()
}

export function findRetainerOffering(id) {
  return retainerOfferings.find(item => item.id === id)
}
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from './lib/supabase-config.js'

