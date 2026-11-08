import { useEffect, useRef, useState } from 'react'
import { X, Send, Volume2, VolumeX, RotateCcw } from 'lucide-react'
import { bot } from '../../mascotFx'
import { respond, suggestionsFor } from './knowledge'
import { sound, blip } from './sound'

export default function ChatPanel({ onClose, onReset, moved, section, closing }) {
  const chips = suggestionsFor(section)
  const [msgs, setMsgs] = useState([{ id: 0, role: 'bot', text: 'Hi! I’m your Spectrum buddy. Ask me about the club, or pick a question below.' }])
  const [busy, setBusy] = useState(false), [val, setVal] = useState(''), [snd, setSnd] = useState(sound.on)
  const input = useRef(), log = useRef(), id = useRef(1)
  useEffect(() => {
    input.current?.focus()
    const k = e => e.key === 'Escape' && onClose()
    addEventListener('keydown', k); return () => { removeEventListener('keydown', k); bot.release() }
  }, [onClose])
  useEffect(() => { log.current?.scrollTo({ top: log.current.scrollHeight, behavior: 'smooth' }) }, [msgs, busy])
  const ask = async q => {
    q = q.trim(); if (!q || busy) return
    setMsgs(m => [...m, { id: id.current++, role: 'user', text: q }]); setVal(''); setBusy(true); bot.play('thinking'); blip(520)
    let r
    try { r = await respond(q) } catch { r = { text: 'Hmm, something went wrong on my side. Please try again in a moment.', links: [], mood: 'confused' } }
    setMsgs(m => [...m, { id: id.current++, role: 'bot', ...r }]); setBusy(false); bot.release(); bot.play(r.mood || 'happy'); blip(760)
  }
  const toggleSound = () => { sound.on = !sound.on; setSnd(sound.on); blip(660) }
  return <section id="ask-spectrum" className={'chat' + (closing ? ' out' : '')} role="dialog" aria-label="Ask Spectrum">
    <header className="chat-head">
      <div><h2>Ask Spectrum</h2><p>Your friendly club guide</p></div>
      <div className="tools">
        {moved && <button type="button" className="ic" aria-label="Reset mascot position" onClick={onReset}><RotateCcw size={15} /></button>}
        <button type="button" className="ic" aria-pressed={snd} aria-label={snd ? 'Turn sound off' : 'Turn sound on'} onClick={toggleSound}>{snd ? <Volume2 size={15} /> : <VolumeX size={15} />}</button>
        <button type="button" className="ic" aria-label="Close chat" onClick={onClose}><X size={15} /></button>
      </div>
    </header>
    <div className="chat-log" ref={log} role="log" aria-live="polite">
      {msgs.map(m => <div key={m.id} className={'msg ' + m.role}><span>{m.text}</span>
        {m.links?.length > 0 && <div className="links">{m.links.map(l => <a key={l.href} href={l.href} {...(l.external ? { target: '_blank', rel: 'noopener noreferrer' } : { onClick: () => innerWidth < 640 && onClose() })}>{l.label} →</a>)}</div>}</div>)}
      {busy && <div className="msg bot typing" role="status" aria-label="Spectrum is typing"><i /><i /><i /></div>}
    </div>
    <div className="chips">{chips.map(q => <button key={q} type="button" disabled={busy} onClick={() => ask(q)}>{q}</button>)}</div>
    <form className="chat-form" onSubmit={e => { e.preventDefault(); ask(val) }}>
      <input ref={input} value={val} onChange={e => setVal(e.target.value)} onFocus={() => !busy && bot.play('listening')} onBlur={() => bot.release()} placeholder="Ask about Spectrum…" aria-label="Your question" maxLength={200} />
      <button type="submit" aria-label="Send" disabled={busy || !val.trim()}><Send size={16} /></button>
    </form>
  </section>
}
