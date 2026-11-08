/**
 * Dot Field: halftone membrane that reacts to swipes and clicks.
 * @author @dorianbaffier  @license MIT  @website https://kokonutui.com  @github https://github.com/kokonut-labs/kokonutui
 * Ported from the Kokonut UI TypeScript/Tailwind original to plain JS + CSS (classes in styles.css).
 * Changes: it is a background layer, so pointer listeners sit on its parent (the hero) and it takes no children;
 * the mascot's glow warms the dots near it (see paint()).
 */
import { useEffect, useRef } from 'react'
import { scene } from '../store'

const NOISE_SCALE = 240, NOISE_SPEED = .07, TONE_STEP = 3, IDLE_FRAME_MS = 33
const ANCHOR = 26, COUPLING = 340, DAMPING = 2.4, STEP = 1 / 120
const POINTER_RADIUS = 72, POINTER_GAIN = 14, POINTER_MAX_SPEED = 2600, POINTER_PART = .45
const SHOCK_SPEED = 620, SHOCK_WIDTH = 34, SHOCK_FORCE = 5200, SHOCK_LIFE = 1.3
const COMPRESSION_GAIN = 3, BUCKETS = 10, REST_SPEED = 2, REST_OFFSET = .15

/** Seeded 3D gradient noise (Ken Perlin's improved noise), about -1 to 1. */
function createNoise(seed) {
  const p = Array.from({ length: 256 }, (_, i) => i)
  let state = seed >>> 0 || 1
  const random = () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296 }
  for (let i = 255; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [p[i], p[j]] = [p[j], p[i]] }
  const perm = new Uint8Array(512)
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255]
  const fade = t => t * t * t * (t * (t * 6 - 15) + 10), lerp = (a, b, t) => a + (b - a) * t
  const grad = (hash, x, y, z) => {
    const h = hash & 15, u = h < 8 ? x : y
    let v = z
    if (h < 4) v = y; else if (h === 12 || h === 14) v = x
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v)
  }
  return (x, y, z) => {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255, Z = Math.floor(z) & 255
    const fx = x - Math.floor(x), fy = y - Math.floor(y), fz = z - Math.floor(z)
    const u = fade(fx), v = fade(fy), w = fade(fz)
    const A = perm[X] + Y, AA = perm[A] + Z, AB = perm[A + 1] + Z, B = perm[X + 1] + Y, BA = perm[B] + Z, BB = perm[B + 1] + Z
    return lerp(
      lerp(lerp(grad(perm[AA], fx, fy, fz), grad(perm[BA], fx - 1, fy, fz), u), lerp(grad(perm[AB], fx, fy - 1, fz), grad(perm[BB], fx - 1, fy - 1, fz), u), v),
      lerp(lerp(grad(perm[AA + 1], fx, fy, fz - 1), grad(perm[BA + 1], fx - 1, fy, fz - 1), u), lerp(grad(perm[AB + 1], fx, fy - 1, fz - 1), grad(perm[BB + 1], fx - 1, fy - 1, fz - 1), u), v),
      w)
  }
}

/** The grid of dots and the state of every spring, in flat arrays. */
function createField(width, height, spacing) {
  const cols = Math.ceil(width / spacing) + 3, rows = Math.ceil(height / spacing) + 3, size = cols * rows
  return {
    cols, rows, spacing, originX: (width - (cols - 1) * spacing) / 2, originY: (height - (rows - 1) * spacing) / 2,
    tone: new Float32Array(size), coarse: new Float32Array((Math.ceil((cols - 1) / TONE_STEP) + 1) * (Math.ceil((rows - 1) / TONE_STEP) + 1)),
    ox: new Float32Array(size), oy: new Float32Array(size), vx: new Float32Array(size), vy: new Float32Array(size), ax: new Float32Array(size), ay: new Float32Array(size),
  }
}

/** Idle halftone: noise sampled on every TONE_STEP-th dot and blended in between. */
function sampleTone(field, noise, time) {
  const { cols, rows, spacing, originX, originY, tone, coarse } = field
  const z = time * NOISE_SPEED, step = spacing * TONE_STEP
  const coarseCols = Math.ceil((cols - 1) / TONE_STEP) + 1, coarseRows = Math.ceil((rows - 1) / TONE_STEP) + 1
  for (let j = 0; j < coarseRows; j++) {
    const ny = (originY + j * step) / NOISE_SCALE
    for (let i = 0; i < coarseCols; i++) {
      const nx = (originX + i * step) / NOISE_SCALE
      const n = noise(nx, ny, z) * .75 + noise(nx * 2.1 + 9.3, ny * 2.1 + 3.7, z * 1.3) * .25
      coarse[j * coarseCols + i] = Math.min(1, Math.max(0, .5 + n * 1.1))
    }
  }
  for (let j = 0; j < rows; j++) {
    const cj = Math.min(Math.floor(j / TONE_STEP), coarseRows - 2), fy = j / TONE_STEP - cj
    for (let i = 0; i < cols; i++) {
      const ci = Math.min(Math.floor(i / TONE_STEP), coarseCols - 2), fx = i / TONE_STEP - ci, a = cj * coarseCols + ci
      const top = coarse[a] + (coarse[a + 1] - coarse[a]) * fx
      const bottom = coarse[a + coarseCols] + (coarse[a + coarseCols + 1] - coarse[a + coarseCols]) * fx
      tone[j * cols + i] = top + (bottom - top) * fy
    }
  }
}

/** Sum of the four neighbours; past the border counts as a still dot. */
function neighbours(values, field, i, j) {
  const { cols, rows } = field, k = j * cols + i
  let sum = 0
  if (i > 0) sum += values[k - 1]
  if (i < cols - 1) sum += values[k + 1]
  if (j > 0) sum += values[k - cols]
  if (j < rows - 1) sum += values[k + cols]
  return sum
}

/** Spring force on every dot: back to rest, towards neighbours (waves travel), damping. */
function accelerate(field) {
  const { cols, rows, ox, oy, vx, vy, ax, ay } = field
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const k = j * cols + i, sx = neighbours(ox, field, i, j), sy = neighbours(oy, field, i, j)
    ax[k] += -ANCHOR * ox[k] + COUPLING * (sx - 4 * ox[k]) - DAMPING * vx[k]
    ay[k] += -ANCHOR * oy[k] + COUPLING * (sy - 4 * oy[k]) - DAMPING * vy[k]
  }
}

/** A ring travelling out from each click, shoving the dots it crosses. */
function applyShocks(field, shocks) {
  const { cols, rows, spacing, originX, originY, ax, ay } = field
  for (const shock of shocks) {
    const reach = shock.age * SHOCK_SPEED, fade = 1 - shock.age / SHOCK_LIFE, force = SHOCK_FORCE * (shock.power || 1) * fade * fade
    const outer = reach + SHOCK_WIDTH, inner = Math.max(0, reach - SHOCK_WIDTH)
    const i0 = Math.max(0, Math.floor((shock.x - outer - originX) / spacing)), i1 = Math.min(cols - 1, Math.ceil((shock.x + outer - originX) / spacing))
    const j0 = Math.max(0, Math.floor((shock.y - outer - originY) / spacing)), j1 = Math.min(rows - 1, Math.ceil((shock.y + outer - originY) / spacing))
    for (let j = j0; j <= j1; j++) {
      const dy = originY + j * spacing - shock.y
      for (let i = i0; i <= i1; i++) {
        const dx = originX + i * spacing - shock.x, dist = Math.hypot(dx, dy)
        if (dist < inner || dist > outer || dist === 0) continue
        const band = 1 - Math.abs(dist - reach) / SHOCK_WIDTH, k = j * cols + i
        ax[k] += (dx / dist) * force * band; ay[k] += (dy / dist) * force * band
      }
    }
  }
}

/** The pointer hands part of its velocity to the dots near the path it took since the last frame. */
function applyPointer(field, pointer, dt) {
  const segX = pointer.x - pointer.lastX, segY = pointer.y - pointer.lastY
  pointer.lastX = pointer.x; pointer.lastY = pointer.y
  const length = Math.hypot(segX, segY)
  if (!pointer.inside || length < .5 || dt <= 0) return false
  const speed = Math.min(length / dt, POINTER_MAX_SPEED), pvx = (segX / length) * speed, pvy = (segY / length) * speed
  const { cols, rows, spacing, originX, originY, vx, vy } = field
  const startX = pointer.x - segX, startY = pointer.y - segY
  const i0 = Math.max(0, Math.floor((Math.min(startX, pointer.x) - POINTER_RADIUS - originX) / spacing)), i1 = Math.min(cols - 1, Math.ceil((Math.max(startX, pointer.x) + POINTER_RADIUS - originX) / spacing))
  const j0 = Math.max(0, Math.floor((Math.min(startY, pointer.y) - POINTER_RADIUS - originY) / spacing)), j1 = Math.min(rows - 1, Math.ceil((Math.max(startY, pointer.y) + POINTER_RADIUS - originY) / spacing))
  const lengthSq = length * length, gain = Math.min(1, POINTER_GAIN * dt)
  for (let j = j0; j <= j1; j++) {
    const py = originY + j * spacing
    for (let i = i0; i <= i1; i++) {
      const px = originX + i * spacing
      const t = Math.min(1, Math.max(0, ((px - startX) * segX + (py - startY) * segY) / lengthSq))
      const awayX = px - startX - segX * t, awayY = py - startY - segY * t, dist = Math.hypot(awayX, awayY)
      if (dist >= POINTER_RADIUS) continue
      const falloff = 1 - dist / POINTER_RADIUS, k = j * cols + i, amount = gain * falloff * falloff
      const side = dist > 0 ? (speed * POINTER_PART) / dist : 0
      vx[k] += (pvx + awayX * side - vx[k]) * amount; vy[k] += (pvy + awayY * side - vy[k]) * amount
    }
  }
  return true
}

/** One fixed physics step. Returns whether anything is still moving. */
function integrate(field, shocks, h) {
  const { ox, oy, vx, vy, ax, ay } = field
  ax.fill(0); ay.fill(0)
  applyShocks(field, shocks); accelerate(field)
  let moving = false
  for (let k = 0; k < ox.length; k++) {
    vx[k] += ax[k] * h; vy[k] += ay[k] * h; ox[k] += vx[k] * h; oy[k] += vy[k] * h
    if (!moving && (Math.abs(vx[k]) > REST_SPEED || Math.abs(vy[k]) > REST_SPEED || Math.abs(ox[k]) > REST_OFFSET || Math.abs(oy[k]) > REST_OFFSET)) moving = true
  }
  return moving
}

/** How much the membrane is squeezed (+) or stretched (-) at one dot. */
function compression(field, i, j) {
  const { cols, rows, spacing, ox, oy } = field, k = j * cols + i
  const left = i > 0 ? ox[k - 1] : 0, right = i < cols - 1 ? ox[k + 1] : 0, up = j > 0 ? oy[k - cols] : 0, down = j < rows - 1 ? oy[k + cols] : 0
  return -(right - left + down - up) / (2 * spacing)
}

/** Draw every dot; sizes snap to a few steps and each step is one path. */
function draw(ctx, field, size, moving) {
  const { cols, rows, spacing, originX, originY, tone, ox, oy } = field, maxRadius = spacing * .42
  const paths = Array.from({ length: BUCKETS }, () => new Path2D()), filled = new Uint8Array(BUCKETS)
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const k = j * cols + i
    let amount = .12 + .6 * tone[k]
    if (moving) amount *= 1 + COMPRESSION_GAIN * compression(field, i, j)
    const bucket = Math.round(Math.min(1, Math.max(0, amount)) * (BUCKETS - 1))
    if (bucket === 0) continue
    const radius = (maxRadius * bucket) / (BUCKETS - 1), x = originX + i * spacing + ox[k], y = originY + j * spacing + oy[k], path = paths[bucket]
    path.moveTo(x + radius, y); path.arc(x, y, radius, 0, Math.PI * 2); filled[bucket] = 1
  }
  ctx.clearRect(0, 0, size.width, size.height)
  ctx.fillStyle = size.color
  for (let b = 1; b < BUCKETS; b++) if (filled[b]) { ctx.globalAlpha = .2 + (.32 * b) / (BUCKETS - 1); ctx.fill(paths[b]) }
  ctx.globalAlpha = 1
}

export default function DotField({ spacing = 16, interactive = true, seed = 7 }) {
  const rootRef = useRef(), canvasRef = useRef()
  useEffect(() => {
    const root = rootRef.current, canvas = canvasRef.current, ctx = canvas?.getContext('2d'), host = root?.parentElement
    if (!(root && canvas && ctx && host)) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const noise = createNoise(seed), gap = Math.max(6, spacing), size = { width: 0, height: 0, color: '' }, stage = document.querySelector('.stage')
    let field = createField(0, 0, gap)
    const pointer = { x: 0, y: 0, lastX: 0, lastY: 0, inside: false }, extra = { x: 0, y: 0, lastX: 0, lastY: 0, inside: false }, shocks = [] // extra = the draggable mascot acting as a second pointer
    let time = 0, last = 0, lastTone = 0, carry = 0, stirring = false, awake = false, raf = 0, visible = true, spot = 0

    const paint = moving => { // original draw + the mascot's glow warming the dots around it
      draw(ctx, field, size, moving)
      if (spot > .02) { // soft yellow spotlight under the cursor (tints only where dots exist)
        const g = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 150)
        g.addColorStop(0, `rgba(255,207,26,${(.6 * spot).toFixed(3)})`); g.addColorStop(1, 'rgba(255,207,26,0)')
        ctx.globalCompositeOperation = 'source-atop'; ctx.fillStyle = g; ctx.fillRect(0, 0, size.width, size.height); ctx.globalCompositeOperation = 'source-over'
      }
      const gl = scene.glow || 0
      if (gl > .02 && stage) {
        const s = stage.getBoundingClientRect(), r = canvas.getBoundingClientRect(), cx = s.left + s.width / 2 - r.left, cy = s.top + s.height / 2 - r.top
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 340)
        g.addColorStop(0, `rgba(255,207,26,${(.9 * gl).toFixed(3)})`); g.addColorStop(1, 'rgba(255,207,26,0)')
        ctx.globalCompositeOperation = 'source-atop'; ctx.fillStyle = g; ctx.fillRect(0, 0, size.width, size.height); ctx.globalCompositeOperation = 'source-over' // tints only where dots exist
      }
    }
    const resize = () => {
      const rect = canvas.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, gap >= 20 ? 1.5 : 2)
      size.width = rect.width; size.height = rect.height
      canvas.width = Math.round(size.width * dpr); canvas.height = Math.round(size.height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      size.color = getComputedStyle(canvas).color
      field = createField(size.width, size.height, gap); sampleTone(field, noise, time); awake = false
    }
    const physics = dt => {
      const pushed = applyPointer(field, pointer, dt) | applyPointer(field, extra, dt)
      carry = Math.min(carry + dt, STEP * 6)
      while (carry >= STEP) {
        carry -= STEP
        for (const shock of shocks) shock.age += STEP
        while (shocks.length > 0 && shocks[0].age > SHOCK_LIFE) shocks.shift()
        stirring = integrate(field, shocks, STEP)
      }
      if (!(pushed || stirring || shocks.length > 0)) { field.ox.fill(0); field.oy.fill(0); field.vx.fill(0); field.vy.fill(0); awake = false } // settled: physics sleeps
    }
    const frame = now => {
      raf = 0
      if (!visible) return
      const dt = last ? Math.min((now - last) / 1000, .05) : 0
      last = now; time += dt
      const wasAwake = awake
      if (awake) physics(dt)
      spot += ((pointer.inside && !reduceMotion ? 1 : 0) - spot) * .15
      const toneDue = now - lastTone >= (gap >= 20 ? 50 : IDLE_FRAME_MS) // lighter idle drift on mobile
      if (toneDue) { sampleTone(field, noise, time); lastTone = now }
      if (wasAwake || toneDue) paint(wasAwake)
      raf = requestAnimationFrame(frame)
    }
    const start = () => { if (!raf && visible && !reduceMotion) { last = 0; raf = requestAnimationFrame(frame) } }
    const wake = () => { if (!awake) { awake = true; carry = 0; stirring = true } start() }

    resize(); paint(false); canvas.style.opacity = '1'; start()
    const redraw = () => { resize(); paint(false) }
    const resizeObserver = new ResizeObserver(redraw); resizeObserver.observe(canvas)
    let dprQuery = null
    const watchDpr = () => { dprQuery?.removeEventListener('change', onDpr); dprQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`); dprQuery.addEventListener('change', onDpr) }
    const onDpr = () => { redraw(); watchDpr() }
    watchDpr()
    let onScreen = true
    const updateVisible = () => { visible = onScreen && document.visibilityState === 'visible'; if (visible) start() } // no drawing while scrolled away or tab hidden
    const intersection = new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; updateVisible() }); intersection.observe(root)
    document.addEventListener('visibilitychange', updateVisible)
    const colorTimer = window.setInterval(() => { if (!visible) return; const next = getComputedStyle(canvas).color; if (next !== size.color) { size.color = next; if (reduceMotion) paint(false) } }, 500)

    const local = e => { const rect = canvas.getBoundingClientRect(); return { x: e.clientX - rect.left, y: e.clientY - rect.top } }
    const onMove = e => {
      const point = local(e)
      if (!pointer.inside) { pointer.lastX = point.x; pointer.lastY = point.y; pointer.inside = true }
      pointer.x = point.x; pointer.y = point.y
      if (Math.abs(pointer.x - pointer.lastX) > .5 || Math.abs(pointer.y - pointer.lastY) > .5) wake()
    }
    const onLeave = () => { pointer.inside = false }
    const onDown = e => { // clicks on links, buttons and controls are not meant for the field
      if (e.button !== 0 || e.target.closest("a, button, input, textarea, select, label, [role='button']")) return
      const point = local(e)
      pointer.x = point.x; pointer.y = point.y; pointer.lastX = point.x; pointer.lastY = point.y; pointer.inside = true
      shocks.push({ ...point, age: 0 }); if (shocks.length > 3) shocks.shift()
      wake()
    }
    const onShock = e => { const r = canvas.getBoundingClientRect(), d = e.detail; shocks.push({ x: d.x - r.left, y: d.y - r.top, age: 0, power: d.power || 1 }); if (shocks.length > 3) shocks.shift(); wake() } // mascot touched: ripple around it
    const onStir = e => { // mascot dragged: dots near it respond to its movement
      const d = e.detail; if (d.end) { extra.inside = false; return }
      const r = canvas.getBoundingClientRect(), x = d.x - r.left, y = d.y - r.top
      if (!extra.inside) { extra.lastX = x; extra.lastY = y; extra.inside = true }
      extra.x = x; extra.y = y; wake()
    }
    if (!reduceMotion) { addEventListener('dotfield-shock', onShock); addEventListener('dotfield-stir', onStir) }
    if (interactive && !reduceMotion) { host.addEventListener('pointermove', onMove); host.addEventListener('pointerleave', onLeave); host.addEventListener('pointerdown', onDown) }
    return () => {
      cancelAnimationFrame(raf); resizeObserver.disconnect(); dprQuery?.removeEventListener('change', onDpr); intersection.disconnect()
      document.removeEventListener('visibilitychange', updateVisible); window.clearInterval(colorTimer)
      removeEventListener('dotfield-shock', onShock); removeEventListener('dotfield-stir', onStir)
      host.removeEventListener('pointermove', onMove); host.removeEventListener('pointerleave', onLeave); host.removeEventListener('pointerdown', onDown)
    }
  }, [spacing, interactive, seed])
  return <div ref={rootRef} className="dotfield-root" aria-hidden="true"><canvas ref={canvasRef} className="dotfield-canvas" /></div>
}
