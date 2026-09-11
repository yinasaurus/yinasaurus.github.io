import { Float, PerspectiveCamera, useGLTF } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { CanvasTexture } from 'three'
import { useGlobalPointerRef } from '../../hooks/usePointerParallax'
import { Yinasaurus } from './Yinasaurus'

useGLTF.preload('/models/triceratops-v4.glb')

/**
 * All React Three Fiber setup lives here — camera, lights, shadow and the
 * render loop. `Yinasaurus` is the only thing you need to replace to change the
 * mascot itself.
 *
 * Props:
 *   isDark        — flips the lighting rig to match the site theme
 *   quality       — 'low' on mobile: fewer polygons, lower pixel ratio, no shards
 *   reducedMotion — freezes idle animation for `prefers-reduced-motion` users
 */
export default function MascotScene({ isDark = false, quality = 'high', reducedMotion = false }) {
  useGLTF('/models/triceratops-v4.glb')
  const wrapper = useRef(null)
  const pointerRef = useGlobalPointerRef(!reducedMotion)
  const dinoPose = useMemo(() => {
    if (typeof window === 'undefined') return 'threeQuarter'
    return new URLSearchParams(window.location.search).get('dino') === 'front'
      ? 'front'
      : 'threeQuarter'
  }, [])

  // Stop rendering entirely once the hero scrolls off screen. Without this the
  // GPU keeps drawing 60 frames a second of something nobody can see.
  const [frameloop, setFrameloop] = useState('always')
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

  const isLow = quality === 'low'

  return (
    <div ref={wrapper} className="h-full w-full">
      <Canvas
        frameloop={frameloop}
        // Cap the pixel ratio — retina displays would otherwise render 4x the
        // pixels for what is a handful of flat-shaded polygons.
        dpr={[1, isLow ? 1.5 : 2]}
        // Shadow maps are off; the shadow under the mascot is a painted
        // gradient (see `SoftShadow`), which is far cheaper.
        shadows={false}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        {/* Generous frame so head, tail and feet stay inside the canvas
            with breathing room at the default three-quarter pose. */}
        <FitCamera width={4.8} height={4.1} />

        {/* Warm, neutral rig so sage/cream read as themselves — a pink or
            violet rim was dyeing the horns. */}
        <ambientLight intensity={isDark ? 0.62 : 0.85} color={isDark ? '#f3efe6' : '#ffffff'} />

        <directionalLight
          position={[5, 6, 4]}
          intensity={isDark ? 2.1 : 2.4}
          color={isDark ? '#fff6e8' : '#fffaf0'}
        />

        <pointLight
          position={[-4, 1.5, -3]}
          intensity={isDark ? 14 : 10}
          distance={16}
          color={isDark ? '#e8d5b0' : '#f0e4c4'}
        />

        <Suspense fallback={null}>
          <Yinasaurus pointerRef={pointerRef} reducedMotion={reducedMotion} pose={dinoPose} />
        </Suspense>

        {!isLow && <Shards reducedMotion={reducedMotion} />}

        <SoftShadow isDark={isDark} />
      </Canvas>
    </div>
  )
}

/**
 * Sits the camera far enough back that a `width` x `height` box centred on the
 * origin always fits, whatever shape the canvas happens to be.
 *
 * Without this the mascot is framed correctly on a wide desktop canvas and runs
 * off both edges on a narrow phone one — a long animal is far more sensitive to
 * the container's aspect ratio than a round one was. The narrow FOV is what
 * keeps the facets from distorting at the edges of frame.
 */
function FitCamera({ width, height, fov = 32 }) {
  const size = useThree((state) => state.size)

  const distance = useMemo(() => {
    const halfFov = (fov * Math.PI) / 360
    const aspect = size.width / size.height
    const forHeight = height / 2 / Math.tan(halfFov)
    const forWidth = width / 2 / (Math.tan(halfFov) * aspect)
    return Math.max(forHeight, forWidth)
  }, [size, width, height, fov])

  return (
    <PerspectiveCamera makeDefault fov={fov} near={0.1} far={60} position={[0, 0.15, distance]} />
  )
}

/**
 * The soft puddle of shadow under the mascot.
 *
 * This is deliberately a painted radial gradient rather than drei's
 * `ContactShadows`: the camera looks at the scene almost horizontally, and a
 * real shadow plane at that angle smears across the whole lower canvas and
 * shows its own straight edges. A gradient sprite is guaranteed to fade out
 * cleanly, and costs one static texture instead of a depth pass every frame.
 */
function SoftShadow({ isDark }) {
  const texture = useMemo(() => {
    const size = 256
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    gradient.addColorStop(0, 'rgba(0,0,0,0.6)')
    gradient.addColorStop(0.4, 'rgba(0,0,0,0.26)')
    gradient.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)
    return new CanvasTexture(canvas)
  }, [])

  useEffect(() => () => texture.dispose(), [texture])

  return (
    <mesh position={[0.02, -0.44, 0.02]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.55, 1.15, 1]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={texture}
        transparent
        depthWrite={false}
        opacity={isDark ? 0.75 : 0.45}
        color={isDark ? '#000000' : '#2a1c4d'}
        toneMapped={false}
      />
    </mesh>
  )
}

/**
 * Angular crystal shards drifting around the mascot — the same faceted language
 * as the dinosaur itself. Desktop only; see `isLow` above.
 */
// Only three, tucked into the corners — the animal takes up most of the frame
// now, and any more of these start competing with it.
const SHARDS = [
  { position: [1.7, 1.55, -1.2], scale: 0.22, color: '#ffb020', shape: 'tetra' },
  { position: [-1.75, 1.35, -1], scale: 0.18, color: '#ff4d8d', shape: 'octa' },
  { position: [1.5, -1.35, 0.6], scale: 0.16, color: '#6c3bf4', shape: 'octa' },
]

function Shards({ reducedMotion }) {
  return (
    <group>
      {SHARDS.map((shard, i) => (
        <Float
          key={i}
          speed={reducedMotion ? 0 : 1 + i * 0.3}
          rotationIntensity={reducedMotion ? 0 : 0.9}
          floatIntensity={reducedMotion ? 0 : 1.5}
        >
          <mesh position={shard.position} scale={shard.scale} rotation={[i * 0.7, i * 1.1, 0]}>
            {shard.shape === 'tetra' && <tetrahedronGeometry args={[1, 0]} />}
            {shard.shape === 'octa' && <octahedronGeometry args={[1, 0]} />}
            {shard.shape === 'icosa' && <icosahedronGeometry args={[1, 0]} />}
            <meshStandardMaterial color={shard.color} flatShading roughness={0.45} metalness={0} />
          </mesh>
        </Float>
      ))}
    </group>
  )
}
