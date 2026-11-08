// Source of truth: what the site actually publishes today. Anything not published is answered honestly as "not yet available".
import { FORM, SOCIALS } from '../../data/links'
const L = (label, href, external) => ({ label, href, external })
const I = [
  { keys: ['what is spectrum', 'about', 'spectrum', 'club', 'mission', 'purpose', 'vision', 'story'], mood: 'happy', links: [L('About Spectrum', '#about')],
    text: 'Spectrum is a creative technology club that brings together people with different perspectives, technical interests and ideas. Our vision is a community where diverse perspectives meet technology, creativity and collaboration. The tagline says it all: “Different Perspectives. Limitless Impact.”' },
  { keys: ['domain', 'domains', 'explore', 'perspective', 'perspectives', 'think differently', 'build together', 'explore technology', 'create impact', 'values', 'focus'], mood: 'excited', links: [L('Our Perspectives', '#perspectives')],
    text: 'Spectrum looks at things through four perspectives: Think Differently, Build Together, Explore Technology and Create Impact. Open the Perspectives section to read about each one.' },
  { keys: ['event', 'events', 'upcoming', 'audition', 'auditions', 'schedule'], mood: 'excited', links: [L('Events', '#events'), L('Register for auditions', FORM, true)],
    text: 'Right now the event is Spectrum’s founding crew and junior core auditions, beginning 17 November. You’ll find the poster and registration form in the Events section. I don’t have any other event details, so I won’t guess.' },
  { keys: ['team', 'members', 'leader', 'leadership', 'people', 'who runs', 'president', 'treasurer', 'technical lead'], mood: 'happy', links: [L('Our Team', '#team')],
    text: 'Spectrum’s leadership team: Om Gupta (President), Ankit Timilsena (Vice President), Manish Kumar Shah (Treasurer) and Michael Shah (Technical Lead).' },
  { keys: ['join', 'membership', 'sign up', 'apply', 'become', 'register', 'how can i'], mood: 'excited', links: [L('Register for auditions', FORM, true), L('Join Spectrum', '#join')],
    text: 'Spectrum is holding founding crew and junior core auditions, beginning 17 November. You can register through the official Google Form. I don’t have any other membership details yet.' },
  { keys: ['contact', 'email', 'phone', 'instagram', 'linkedin', 'twitter', 'youtube', 'social', 'follow', 'reach'], mood: 'happy', links: SOCIALS.map(s => L(s.name, s.href, true)),
    text: 'You can follow Spectrum on Instagram, X, LinkedIn and YouTube. I don’t have an email address or phone number to share.' },
  { keys: ['who are you', 'your name', 'buddy', 'mascot'], mood: 'happy', links: [], text: 'I’m your Spectrum buddy, the club’s mascot. I can only share what’s published on this site.' },
  { keys: ['hi', 'hello', 'hey', 'yo'], mood: 'happy', links: [], text: 'Hi! Ask me about Spectrum, our perspectives, the auditions, the team, or how to join.' },
  { keys: ['thanks', 'thank you'], mood: 'happy', links: [], text: 'Happy to help!' },
]
export const SUGGESTED = ['What is Spectrum?', 'What are the four perspectives?', 'What events are coming up?', 'Who is on the team?', 'How can I join Spectrum?']
const BY = {
  about: ['What is Spectrum?', 'What are the four perspectives?'], perspectives: ['What are the four perspectives?', 'What is Spectrum?'],
  events: ['What events are coming up?', 'How can I join Spectrum?'], team: ['Who is on the team?', 'How can I join Spectrum?'],
  join: ['How can I join Spectrum?', 'Where can I follow Spectrum?'],
}
export const suggestionsFor = s => [...new Set([...(BY[s] || []), ...SUGGESTED])].slice(0, 5) // current section's questions first
const FALLBACK = { text: 'I don’t have that information yet. I only know what’s published on this site. You can ask about Spectrum, our perspectives, the auditions, the team or joining.', links: [], mood: 'confused' }
export function localAnswer(q) {
  const s = ' ' + q.toLowerCase().replace(/[^a-z0-9 ]/g, ' ') + ' '
  let best = null, top = 0
  for (const it of I) { let n = 0; for (const k of it.keys) if (s.includes(' ' + k + ' ')) n += k.includes(' ') ? 3 : 2; if (n > top) { top = n; best = it } }
  return best ? { text: best.text, links: best.links, mood: best.mood } : FALLBACK
}
// Swap point for a real AI: call your own backend endpoint here (API keys must stay server-side), keep this return shape.
export async function respond(q) { await new Promise(r => setTimeout(r, 650 + Math.random() * 450)); return localAnswer(q) }
