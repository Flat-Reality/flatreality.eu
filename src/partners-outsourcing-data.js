import { caseStudyProjects, caseStudyPath } from './case-studies-data.js'
import media from './case-study-media.json' with { type: 'json' }

export const services = [
  {
    id: 'game-design-narrative',
    icon: '◇',
    title: 'Game Design & Narrative',
    shortDescription: 'Design meaningful gameplay systems, compelling mechanics and stories that shape the player experience.',
    fullDescription: 'We turn ideas into clear, usable design foundations—from the rules that shape play to the stories that give a project its voice.',
    deliverables: ['Game Design Documents', 'Systems Design', 'Narrative Design', 'Level Design', 'Balancing', 'Game Design Reviews'],
    relatedCaseStudies: [],
  },
  {
    id: 'unity-development-prototyping',
    icon: '⌘',
    title: 'Unity Development & Prototyping',
    shortDescription: 'From experimental prototypes to production-ready gameplay systems, we help bring interactive ideas to life.',
    fullDescription: 'Flexible Unity engineering support for testing a direction quickly, proving a concept and building dependable production systems.',
    deliverables: ['Unity Gameplay Programming', 'Gameplay Systems', 'UI Implementation', 'Development Tools', 'Rapid Prototyping', 'Vertical Slices', 'Debugging and Technical Support'],
    relatedCaseStudies: [],
  },
  {
    id: 'art-ui',
    icon: '✦',
    title: '2D Art & UI',
    shortDescription: "Create distinctive visual assets and interfaces that support your game's creative direction.",
    fullDescription: 'Visual development that supports the identity of the project and remains practical for the production pipeline.',
    deliverables: ['Concept Art', 'Character Art', 'Environment Art', 'Pixel Art', 'Sprites', 'UI Assets'],
    relatedCaseStudies: [],
  },
  {
    id: 'audio-sound',
    icon: '◖',
    title: 'Audio & Sound',
    shortDescription: 'Build atmosphere, identity and responsive audio experiences for your game.',
    fullDescription: 'Sound work shaped around the emotional tone and interactive needs of the experience, from individual effects to original music.',
    deliverables: ['Sound Effects', 'Ambient Audio', 'Interactive Audio', 'Audio Implementation', 'Original Music'],
    relatedCaseStudies: [],
  },
  {
    id: 'production-management',
    icon: '▦',
    title: 'Production Management',
    shortDescription: 'Keep your development organized with structured planning, coordination and transparent workflows.',
    fullDescription: 'Production support that makes scope, ownership and progress visible while fitting the way your team already works.',
    deliverables: ['Production Planning', 'Milestone Management', 'Task Coordination', 'Documentation', 'Workflow Design', 'Development Tracking'],
    relatedCaseStudies: [],
  },
  {
    id: 'inclusive-design-accessibility',
    icon: '🏳️‍🌈',
    iconLabel: 'LGBTQIA+ rainbow flag',
    title: 'Inclusive Design & Accessibility',
    shortDescription: 'Create more thoughtful and inclusive player experiences through accessible design, meaningful representation and considerate storytelling.',
    fullDescription: 'Practical consultation for teams that want to consider more players and handle representation with greater care—without making unsupported certification claims.',
    deliverables: ['Inclusive Game Design', 'Representation Reviews', 'Accessibility-oriented UX', 'Narrative Sensitivity Reviews', 'Inclusive Design Consultation'],
    relatedCaseStudies: [],
  },
]

export const additionalServices = [
  {
    id: 'implementation-support',
    icon: '⬡',
    title: 'Implementation Support',
    shortDescription: 'Hands-on help integrating Flat Reality technologies into your production.',
    fullDescription: 'Technical guidance and implementation help for Phantom UI, the Flat Reality SDK and related production workflows.',
    deliverables: ['Integration Planning', 'Technical Setup', 'Implementation Support', 'Workflow Guidance'],
    relatedCaseStudies: [],
  },
  {
    id: 'something-else',
    icon: '+',
    title: 'Something Else',
    shortDescription: 'Tell us about a request that does not fit neatly into one category.',
    fullDescription: 'Use this option for unusual, cross-disciplinary or early-stage requests.',
    deliverables: [],
    relatedCaseStudies: [],
  },
]

export const allServices = [...services, ...additionalServices]

const legacyCaseStudies = [
  { title: 'The Nick: Chapter 1', image: '/assets/images/TheNickCover.jpeg', url: 'https://app.notion.com/p/THE-NICK-CHAPTER-1-Case-34e81de178f380d28283c87b33664388' },
  { title: 'RAIN HEART', image: '/assets/images/RAINHEARTCover.jpg', url: 'https://app.notion.com/p/RAIN-HEART-Case-35181de178f380e5880bfd012e3eadaf?source=copy_link' },
  { title: 'DARK TIMES', image: '/assets/images/ChannelInterference.gif', url: 'https://app.notion.com/p/DARK-TIMES-Case-35181de178f38054a9e1e06f3e8f2edc?source=copy_link' },
  { title: 'GONE BY DAWN', image: '/assets/images/ChannelInterference.gif', url: 'https://app.notion.com/p/GONE-BY-DOWN-Case-35181de178f380f5a235ddab17df86e8?source=copy_link' },
  { title: 'CUP OR DIE', image: '/assets/images/ChannelInterference.gif', url: 'https://app.notion.com/p/CUP-OR-DIE-Case-35181de178f38089ac4cd8a5d81f6c4a?source=copy_link' },
  { title: 'Art Showcase', image: '/assets/images/MAD_GAMES_SHOW-SABADO-TARDE-2539-scaled.jpg', url: 'https://app.notion.com/p/Art-Showcase-34e81de178f3800fa5a8d92e07ce8776?source=copy_link' },
]

export const caseStudies = [
  ...caseStudyProjects.map(project => ({ title: project.title, image: media[project.slug]?.cover || '', url: caseStudyPath(project.slug), internal: true })),
  legacyCaseStudies.find(item => item.title === 'Art Showcase'),
]

// Original wording from the previous Flat Reality outsourcing page.
export const workflowSteps = [
  { title: 'Briefing', description: 'You share your vision, goals, and requirements.' },
  { title: 'Planning', description: 'We define scope, resources, timeline, and budget.' },
  { title: 'Creating', description: 'Early prototypes or drafts are created for feedback.' },
  { title: 'Iterations', description: 'Continuous improvements based on your feedback.' },
  { title: 'Launch', description: 'Final assets, documentation, or game ready for production. Follow-up support and work are possible.' },
]

export const collaborationModels = ['One-time Project', 'Production Module', 'Ongoing Support', 'Not Sure Yet']
export const projectStages = ['Concept / Idea', 'Prototype', 'In Production', 'Released / Live']
export const budgetRanges = ['Under €500', '€500–€2,000', '€2,000–€10,000', '€10,000+', 'Not Sure Yet']
export const timelines = ['As Soon As Possible', 'Within a Month', '1–3 Months', 'Flexible / Not Sure Yet']
