// Spectrum team. Two lists feed the moving showcase in the Team section:
//
//   LEADERSHIP  the four core roles. Shown first, larger, with a yellow "Leadership" tag.
//   MEMBERS     everyone else. Empty on purpose: nothing here is invented, add your real members below.
//
// To add a member:
//   1. Put their photo in  src/assets/team/members/  (jpg, jpeg, png or webp, portrait works best).
//   2. Add one line to MEMBERS, using the photo's file name:
//        { id: 'jane-doe', name: 'Jane Doe', role: 'Designer', photo: 'jane-doe.jpg' },
//      Optional extras, shown in the profile popup only when you provide them:
//        bio: 'One or two sentences about them.',
//        links: [{ label: 'LinkedIn', href: 'https://linkedin.com/in/...' }],
//   A member with no photo gets a coloured initials tile instead. Photos display in a 4:5 portrait frame,
//   cropped from the top, so a head-and-shoulders photo with some room above the head works best.
//
// To swap a leader's photo, replace the file in src/assets/team/ (keep the name) or point `photo` at a new import.
import president from '../assets/team/president.jpg'
import vicePresident from '../assets/team/vice-president.jpg'
import treasurer from '../assets/team/treasurer.jpg'
import technicalLead from '../assets/team/technical-lead.jpg'

export const LEADERSHIP = [
  { id: 'president', role: 'President', name: 'Om Gupta', photo: president },
  { id: 'vice-president', role: 'Vice President', name: 'Ankit Timilsena', photo: vicePresident },
  { id: 'treasurer', role: 'Treasurer', name: 'Manish Kumar Shah', photo: treasurer },
  { id: 'technical-lead', role: 'Technical Lead', name: 'Michael Shah', photo: technicalLead },
].map(m => ({ ...m, leader: true }))

export const MEMBERS = [
  // { id: 'jane-doe', name: 'Jane Doe', role: 'Designer', photo: 'jane-doe.jpg' },
]

// Every image in src/assets/team/members/ is bundled automatically; `photo` above is looked up by file name.
const MEMBER_PHOTOS = import.meta.glob('../assets/team/members/*.{jpg,jpeg,png,webp}', { eager: true, import: 'default' })
const photoFor = file => {
  if (!file) return undefined
  const url = MEMBER_PHOTOS[`../assets/team/members/${file}`]
  if (!url && import.meta.env.DEV) console.warn(`[team] photo "${file}" was not found in src/assets/team/members/`)
  return url
}

export const initials = name => name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()

export const TEAM = [...LEADERSHIP, ...MEMBERS.map(m => ({ ...m, photo: photoFor(m.photo) }))]
