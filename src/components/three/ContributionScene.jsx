import { Canvas, useThree } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Color, Object3D, OrthographicCamera } from 'three'

/**
 * One instanced cube per day — a real 7 × ~52 GitHub calendar, not a strip.
 *
 * Weeks run along +X, Sunday→Saturday along +Z. The camera sits almost
 * overhead with a short isometric tilt so all seven rows stay visible. Empty
 * days still get a short dim cube so the rectangle never falls apart.
 */

const STEP = 1
const CUBE = 0.92
const EMPTY_H = 0.32
const MAX_H = 1.4
const LEVELS = ['#d4cfc4', '#17c79a', '#6c3bf4', '#ffb020', '#ff4d8d']
const LEVELS_DARK = ['#3a3348', '#17c79a', '#8b6cff', '#ffb020', '#ff4d8d']

function levelIndex(count, max) {
  if (count <= 0) return 0
  if (max <= 1) return 2
  const t = count / max
  if (t < 0.25) return 1
  if (t < 0.5) return 2
  if (t < 0.75) return 3
  return 4
}

function cubeHeight(count, max) {
  if (count <= 0) return EMPTY_H
  return EMPTY_H + 0.12 + (count / Math.max(max, 1)) * (MAX_H - EMPTY_H - 0.12)
}

/**
 * Own the camera. drei's <OrthographicCamera> writes its `position` prop every
 * frame and was fighting the framing, which left us looking along the grid
 * instead of down at it.
 */
function CalendarCamera({ weeks }) {
  const set = useThree((state) => state.set)
  const size = useThree((state) => state.size)
  const camera = useMemo(() => new OrthographicCamera(-1, 1, 1, -1, 0.1, 80), [])

  useLayoutEffect(() => {
    set({ camera })
  }, [camera, set])

  useLayoutEffect(() => {
    const gridW = Math.max(weeks, 1) * STEP
    const gridD = 7 * STEP
    const cx = (weeks - 1) * STEP * 0.5
    const cz = 3 * STEP
    const y = 70
    const zOff = 5

    // Straight-on from above the Saturday edge. Weeks run across the screen,
    // the seven days run down it — the same rectangle as GitHub's 2D graph.
    camera.position.set(cx, y, cz + zOff)
    camera.up.set(0, 1, 0)
    camera.lookAt(cx, 0, cz)

    const tilt = Math.atan(zOff / y)
    const projW = gridW
    const projH = gridD * Math.cos(tilt) + MAX_H
    const pad = 1.2
    const scale = Math.min(size.width / (projW * pad), size.height / (projH * pad))
    camera.left = -(size.width / scale) / 2
    camera.right = size.width / scale / 2
    camera.top = size.height / scale / 2
    camera.bottom = -(size.height / scale) / 2
    camera.updateProjectionMatrix()
  }, [camera, size, weeks])

  return null
}

function Cubes({ days, max, isDark, onHover }) {
  const mesh = useRef()
  const dummy = useMemo(() => new Object3D(), [])
  const color = useMemo(() => new Color(), [])
  const palette = isDark ? LEVELS_DARK : LEVELS

  useLayoutEffect(() => {
    const node = mesh.current
    if (!node) return
    days.forEach((day, index) => {
      const height = cubeHeight(day.count, max)
      dummy.position.set(day.week * STEP, height / 2, day.dow * STEP)
      dummy.scale.set(CUBE, height, CUBE)
      dummy.updateMatrix()
      node.setMatrixAt(index, dummy.matrix)
      color.set(palette[levelIndex(day.count, max)])
      node.setColorAt(index, color)
    })
    node.instanceMatrix.needsUpdate = true
    if (node.instanceColor) node.instanceColor.needsUpdate = true
  }, [days, max, dummy, color, palette])

  return (
    <instancedMesh
      ref={mesh}
      args={[null, null, days.length]}
      onPointerMove={(event) => {
        event.stopPropagation()
        const day = days[event.instanceId]
        if (day) onHover(day, event)
      }}
      onPointerOut={() => onHover(null)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={0.5} metalness={0} />
    </instancedMesh>
  )
}

export default function ContributionScene({
  days,
  isDark = false,
  reducedMotion = false,
}) {
  const wrapper = useRef(null)
  const [frameloop, setFrameloop] = useState('always')
  const [hover, setHover] = useState(null)

  useEffect(() => {
    const node = wrapper.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => setFrameloop(entry.isIntersecting ? 'always' : 'never'),
      { threshold: 0 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const grid = useMemo(() => fillGrid(days), [days])
  const max = useMemo(() => Math.max(1, ...grid.map((day) => day.count)), [grid])
  const weeks = useMemo(() => Math.max(1, ...grid.map((day) => day.week + 1)), [grid])

  const onHover = (day, event) => {
    if (!day) {
      setHover(null)
      return
    }
    const bounds = wrapper.current?.getBoundingClientRect()
    if (!bounds || !event) return
    setHover({
      day,
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    })
  }

  return (
    <div ref={wrapper} className="relative h-full w-full">
      <Canvas
        frameloop={frameloop}
        dpr={[1, 1.75]}
        shadows={false}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        onPointerMissed={() => setHover(null)}
      >
        <CalendarCamera weeks={weeks} />
        <ambientLight intensity={isDark ? 0.7 : 0.95} />
        <directionalLight position={[8, 18, 6]} intensity={isDark ? 1.8 : 2.1} />
        <Cubes days={grid} max={max} isDark={isDark} onHover={reducedMotion ? () => {} : onHover} />
      </Canvas>

      {hover && (
        <div
          className="pointer-events-none absolute z-10 border-2 border-ink bg-paper px-2.5 py-1.5 font-mono text-[0.65rem] tracking-wide text-ink shadow-hard-sm dark:border-bone dark:bg-slab dark:text-bone"
          style={{ left: hover.x + 12, top: hover.y - 12 }}
        >
          <span className="text-punch">{hover.day.count}</span>
          {hover.day.count === 1 ? ' contribution' : ' contributions'}
          <span className="text-ink/40 dark:text-bone/40"> · </span>
          {formatDate(hover.day.date)}
        </div>
      )}
    </div>
  )
}

/** Every day in the span gets a cell, including zeros, Sunday-aligned. */
function fillGrid(days) {
  if (!days.length) return days
  const counts = new Map(days.map((day) => [day.date, day.count]))
  const times = days.map((day) => new Date(`${day.date}T00:00:00`))
  const first = new Date(Math.min(...times))
  const start = new Date(first.getFullYear(), 0, 1)
  const end = new Date(Math.max(...times))

  const grid = []
  let week = 0
  for (const cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    const dow = cursor.getDay()
    if (dow === 0 && grid.length > 0) week += 1
    const date = toIso(cursor)
    grid.push({ date, count: counts.get(date) ?? 0, week, dow })
  }
  return grid
}

function toIso(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatDate(iso) {
  const date = new Date(`${iso}T00:00:00`)
  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
