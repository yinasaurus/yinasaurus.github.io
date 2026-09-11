import { Float, useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { Box3, Group, MathUtils } from 'three'

export const MODEL = '/models/triceratops-final.glb'

/** Tweak if the imported mesh sits too big or small. Grounding is bbox-based. */
const SCALE = 0.006

/**
 * Base yaw on the wrapping group (not the tilt ref — useFrame overwrites that).
 * Cardinals: 0 | Math.PI / 2 (90°) | Math.PI (180°) | -Math.PI / 2 (-90°).
 * Mesh is long on +X; camera looks from +Z, so -90° maps +X → +Z (toward camera).
 */
const FACE_YAW = -Math.PI / 2

/** Sage on paper; a touch lighter on void so it doesn't recede. */
const COLOR_LIGHT = '#b5c9a5'
const COLOR_DARK = '#c5d4b8'

const POSE = {
  threeQuarter: { rotation: [0.04, -0.68, 0], position: [0.02, -0.02, 0] },
  front: { rotation: [0.02, 0.02, 0], position: [0, 0, 0] },
}

/**
 * Imported triceratops (`public/models/triceratops-final.glb`).
 * Face yaw + ground offset live on a wrapper so idle bob and cursor tilt
 * still compose on top of the corrected base orientation and feet-at-y=0.
 */
export function Yinasaurus({
  pointerRef,
  reducedMotion = false,
  pose = 'threeQuarter',
  isDark = false,
}) {
  const { scene } = useGLTF(MODEL)
  const tilt = useRef()
  const rest = POSE[pose] ?? POSE.threeQuarter

  const { model, groundY } = useMemo(() => {
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

    const probe = new Group()
    probe.rotation.y = FACE_YAW
    probe.scale.setScalar(SCALE)
    probe.add(clone)
    probe.updateMatrixWorld(true)
    const box = new Box3().setFromObject(probe)
    const nextGroundY = -box.min.y
    probe.remove(clone)

    if (import.meta.env.DEV) {
      console.info('[dino] FACE_YAW', FACE_YAW, `${(FACE_YAW * 180) / Math.PI}deg`, {
        scale: SCALE,
        boxMinY: box.min.y,
        groundY: nextGroundY,
      })
    }

    return { model: clone, groundY: nextGroundY }
  }, [isDark, scene])

  useFrame((_, delta) => {
    const pointer = pointerRef?.current ?? { x: 0, y: 0 }
    if (!tilt.current) return
    const targetY = reducedMotion ? 0 : pointer.x * 0.16
    const targetX = reducedMotion ? 0 : pointer.y * 0.07
    tilt.current.rotation.y = MathUtils.damp(tilt.current.rotation.y, targetY, 3, delta)
    tilt.current.rotation.x = MathUtils.damp(tilt.current.rotation.x, targetX, 3, delta)
  })

  return (
    <Float
      speed={reducedMotion ? 0 : 1.05}
      rotationIntensity={reducedMotion ? 0 : 0.05}
      floatIntensity={reducedMotion ? 0 : 0.18}
      floatingRange={[-0.025, 0.025]}
    >
      <group rotation={rest.rotation} position={rest.position}>
        <group ref={tilt}>
          <group
            rotation={[0, FACE_YAW, 0]}
            position={[0, groundY, 0]}
            scale={SCALE}
            dispose={null}
          >
            <primitive object={model} />
          </group>
        </group>
      </group>
    </Float>
  )
}

useGLTF.preload(MODEL)
