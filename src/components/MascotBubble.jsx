import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { bot } from '../mascotFx'
const quiet = () => { try { return sessionStorage.getItem('spectrum-quiet') === '1' } catch { return false } }
// The assistant's single speech bubble, attached above the floating mascot.
export default function MascotBubble() {
  const [b, setB] = useState(null), [show, setShow] = useState(false), cur = useRef({ prio: 0, until: 0 }), timer = useRef()
  useEffect(() => {
    const on = ({ text, ms, prio, hint }) => {
      const now = performance.now()
      if (bot.chatOpen || (prio < 3 && quiet())) return // no bubbles over an open chat; dismiss mutes suggestions
      if (now < cur.current.until && prio < cur.current.prio) return // never stack or override something more important
      cur.current = { prio, until: now + ms }; setB({ text, hint }); setShow(true); bot.hint = !!hint
      clearTimeout(timer.current); timer.current = setTimeout(() => { setShow(false); bot.hint = false }, ms)
    }
    bot.lis.add(on); return () => { bot.lis.delete(on); clearTimeout(timer.current) }
  }, [])
  const dismiss = () => { try { sessionStorage.setItem('spectrum-quiet', '1') } catch {} clearTimeout(timer.current); cur.current.until = 0; bot.hint = false; setShow(false) }
  return <div className={'bubble glass' + (show ? ' on' : '')} role="status" aria-live="polite">
    {b && <><span>{b.text}</span>{b.hint && <small>{b.hint}</small>}</>}
    <button type="button" className="bubble-x" aria-label="Dismiss and mute suggestions" tabIndex={show ? 0 : -1} onClick={dismiss}><X size={12} /></button></div>
}
