import { Float, useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { MathUtils } from 'three'

const MODEL = '/models/triceratops_lowpoly.glb'

/** Tweak these if the imported mesh sits too big, small, or off-center. */
const SCALE = 0.006
const POSITION = [0, -0.45, 0]
const ROTATION = [0, Math.PI / 2, 0]

/** Sage on paper; a touch lighter on void so it doesn't recede. */
const COLOR_LIGHT = '#b5c9a5'
const COLOR_DARK = '#c5d4b8'

const POSE = {
  threeQuarter: { rotation: [0.04, -0.68, 0], position: [0.02, -0.02, 0] },
  front: { rotation: [0.02, 0.02, 0], position: [0, 0, 0] },
}

/**
 * Imported triceratops (`public/models/triceratops_lowpoly.glb`).
 * Named parts (body, head, frill, horns, legs, tail, …) stay on the cloned
 * scene — `scene.traverse((obj) => console.log(obj.name))` to inspect.
 *
 * Idle bob is the Float wrapper. Cursor tilt is the inner group. Mouth wipe
 * to /projects is unchanged (overlay in MouthWipe, not this mesh).
 */
export function Yinasaurus({
  pointerRef,
  reducedMotion = false,
  pose = 'threeQuarter',
  isDark = false,
}) {
  const { scene } = useGLTF(MODEL)
  const model = useMemo(() => {
    const clone = scene.clone(true)
    const hex = isDark ? COLOR_DARK : COLOR_LIGHT
    clone.traverse((obj) => {
      if (!obj.isMesh) return
      const source = Array.isArray(obj.material) ? obj.material[0] : obj.material
      const mat = source.clone()
      mat.color.set(hex)
      mat.flatShading = true
      mat.roughness = 0.58
      mat.metalness = 0
      mat.toneMapped = false
      mat.needsUpdate = true
      obj.material = mat
    })
    return clone
  }, [isDark, scene])
  const group = useRef()
  const rest = POSE[pose] ?? POSE.threeQuarter

  useFrame((_, delta) => {
    const pointer = pointerRef?.current ?? { x: 0, y: 0 }
    if (!group.current) return
    const targetY = reducedMotion ? 0 : pointer.x * 0.16
    const targetX = reducedMotion ? 0 : pointer.y * 0.07
    group.current.rotation.y = MathUtils.damp(group.current.rotation.y, targetY, 3, delta)
    group.current.rotation.x = MathUtils.damp(group.current.rotation.x, targetX, 3, delta)
  })

  return (
    <Float
      speed={reducedMotion ? 0 : 1.05}
      rotationIntensity={reducedMotion ? 0 : 0.05}
      floatIntensity={reducedMotion ? 0 : 0.18}
      floatingRange={[-0.025, 0.025]}
    >
      <group scale={SCALE} rotation={rest.rotation} position={rest.position}>
        <group ref={group} position={POSITION} rotation={ROTATION} dispose={null}>
          <primitive object={model} />
        </group>
      </group>
    </Float>
  )
}

useGLTF.preload(MODEL)
