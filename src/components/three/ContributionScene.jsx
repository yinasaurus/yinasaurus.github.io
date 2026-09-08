import { Canvas, useThree } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Color, Object3D, Vector3 } from 'three'

/**
 * One instanced cube per day — a real 7 × ~52 GitHub calendar, not a strip.
 *
 * Weeks run along +X, Sunday→Saturday along +Z. The camera sits at a game-board
 * isometric (~40° elevation, slight yaw) so cube heights read in 3D. Empty days
 * still get a short dim cube so the rectangle never falls apart.
 */

const STEP = 0.86
const CUBE = 0.74
const EMPTY_H = 0.2
const MAX_H = 3.4
const ELEVATION = (42 * Math.PI) / 180
const YAW = (28 * Math.PI) / 180
const DIST = 56
const FRUSTUM_PAD = 1.2
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
 * frame and was fighting the framing. `manual` stops R3F from resetting the
 * frustum to pixel units on resize, which was cropping the year grid.
 */
function CalendarCamera({ weeks }) {
  const camera = useThree((state) => state.camera)
  const size = useThree((state) => state.size)
  const invalidate = useThree((state) => state.invalidate)
  const scratch = useMemo(() => new Vector3(), [])

  useLayoutEffect(() => {
    if (size.width < 1 || size.height < 1) return

    const minX = -CUBE / 2
    const maxX = Math.max(weeks - 1, 0) * STEP + CUBE / 2
    const minZ = -CUBE / 2
    const maxZ = 6 * STEP + CUBE / 2
    const cx = (minX + maxX) / 2
    const cz = (minZ + maxZ) / 2

    const xOff = Math.sin(YAW) * Math.cos(ELEVATION) * DIST
    const y = Math.sin(ELEVATION) * DIST
    const zOff = Math.cos(YAW) * Math.cos(ELEVATION) * DIST

    camera.position.set(cx + xOff, y, cz + zOff)
    camera.up.set(0, 1, 0)
    camera.lookAt(cx, MAX_H * 0.3, cz)
    camera.updateMatrixWorld()

    // Contain the full grid AABB in view, whatever the canvas aspect is.
    const corners = [
      [minX, 0, minZ],
      [maxX, 0, minZ],
      [minX, 0, maxZ],
      [maxX, 0, maxZ],
      [minX, MAX_H, minZ],
      [maxX, MAX_H, minZ],
      [minX, MAX_H, maxZ],
      [maxX, MAX_H, maxZ],
    ]
    let minCx = Infinity
    let maxCx = -Infinity
    let minCy = Infinity
    let maxCy = -Infinity
    for (const [x, y0, z] of corners) {
      scratch.set(x, y0, z).applyMatrix4(camera.matrixWorldInverse)
      minCx = Math.min(minCx, scratch.x)
      maxCx = Math.max(maxCx, scratch.x)
      minCy = Math.min(minCy, scratch.y)
      maxCy = Math.max(maxCy, scratch.y)
    }

    const worldW = Math.max(maxCx - minCx, 0.01) * FRUSTUM_PAD
    const worldH = Math.max(maxCy - minCy, 0.01) * FRUSTUM_PAD
    const aspect = size.width / size.height
    let halfW = worldW / 2
    let halfH = worldH / 2
    if (aspect > worldW / worldH) {
      halfW = halfH * aspect
    } else {
      halfH = halfW / aspect
    }

    const midX = (minCx + maxCx) / 2
    const midY = (minCy + maxCy) / 2
    camera.manual = true
    camera.left = midX - halfW
    camera.right = midX + halfW
    camera.top = midY + halfH
    camera.bottom = midY - halfH
    camera.near = 0.1
    camera.far = 250
    camera.zoom = 1
    camera.updateProjectionMatrix()
    invalidate()
  }, [camera, invalidate, scratch, size, weeks])

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
      <meshStandardMaterial roughness={0.38} metalness={0} />
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
    <div ref={wrapper} className="relative h-full w-full overflow-hidden">
      <Canvas
        frameloop={frameloop}
        dpr={[1, 1.75]}
        shadows={false}
        orthographic
        camera={{ manual: true, near: 0.1, far: 250, zoom: 1 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        onPointerMissed={() => setHover(null)}
      >
        <CalendarCamera weeks={weeks} />
        <ambientLight intensity={isDark ? 0.38 : 0.55} />
        <directionalLight position={[22, 28, 18]} intensity={isDark ? 2.4 : 2.7} />
        <directionalLight position={[-14, 10, 16]} intensity={isDark ? 0.55 : 0.7} />
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

/** Sunday-aligned YTD rectangle so empty weekdays don't leave holes. */
function fillGrid(days) {
  if (!days.length) return days
  const counts = new Map(days.map((day) => [day.date, day.count]))
  const times = days.map((day) => new Date(`${day.date}T00:00:00`))
  const year = new Date(Math.min(...times)).getFullYear()

  const start = new Date(year, 0, 1)
  start.setDate(start.getDate() - start.getDay())
  const end = new Date(Math.max(...times))
  end.setDate(end.getDate() + (6 - end.getDay()))

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
