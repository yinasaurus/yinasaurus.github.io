import { Float } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { MathUtils, Quaternion, Vector3 } from 'three'

/**
 * Chunky low-poly toy triceratops. Head, frill and horns are one mass — the
 * frill grows out of the skull, horn roots sit inside it. No spine plates.
 */

const C = {
  body: '#b7c89c',
  limb: '#9eaf84',
  cream: '#edd9b0',
  belly: '#ead7b0',
  eye: '#1b1712',
  highlight: '#f7f1e6',
  beak: '#8a7350',
}

const UP = new Vector3(0, 1, 0)
const EYE_SCALE = 0.08

const TAIL_PIVOT = [0, 0.2, -0.78]
const TAIL = [
  { p: [0, 0, 0], r: 0.36 },
  { p: [0, -0.08, -0.42], r: 0.26 },
  { p: [0, -0.16, -0.82], r: 0.14 },
  { p: [0, -0.2, -1.12], r: 0.05 },
]

const HEAD_PIVOT = [0, 0.52, 0.48]

const LEGS = [
  { side: 1, z: 0.28 },
  { side: -1, z: 0.28 },
  { side: 1, z: -0.3 },
  { side: -1, z: -0.3 },
]

function Bone({ from, to, r1, r2, radial = 6, color }) {
  const { position, quaternion, length } = useMemo(() => {
    const a = new Vector3().fromArray(from)
    const b = new Vector3().fromArray(to)
    const direction = new Vector3().subVectors(b, a)
    return {
      position: a.clone().add(b).multiplyScalar(0.5),
      quaternion: new Quaternion().setFromUnitVectors(UP, direction.clone().normalize()),
      length: direction.length(),
    }
  }, [from, to])

  return (
    <mesh position={position} quaternion={quaternion}>
      <cylinderGeometry args={[r2, r1, length, radial, 1]} />
      <meshStandardMaterial color={color} flatShading roughness={0.55} metalness={0} />
    </mesh>
  )
}

function Chain({ nodes, color, radial = 6 }) {
  return nodes.slice(0, -1).map((node, i) => (
    <Bone
      key={i}
      from={node.p}
      to={nodes[i + 1].p}
      r1={node.r}
      r2={nodes[i + 1].r}
      radial={radial}
      color={color}
    />
  ))
}

function Facet({ color, roughness = 0.55 }) {
  return <meshStandardMaterial color={color} flatShading roughness={roughness} metalness={0} />
}

/** Cone origin is the skull surface; most of the length sits outside. */
function Horn({ position, rotation, length, radius }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, length * 0.32, 0]}>
        <coneGeometry args={[radius, length, 5]} />
        <Facet color={C.cream} roughness={0.42} />
      </mesh>
    </group>
  )
}

export function Yinasaurus({ pointerRef, reducedMotion = false }) {
  const group = useRef()
  const headGroup = useRef()
  const tail = useRef()
  const leftEye = useRef()
  const rightEye = useRef()

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const pointer = pointerRef?.current ?? { x: 0, y: 0 }

    if (group.current) {
      const targetY = reducedMotion ? 0 : pointer.x * 0.18
      const targetX = reducedMotion ? 0 : pointer.y * 0.08
      group.current.rotation.y = MathUtils.damp(group.current.rotation.y, targetY, 3, delta)
      group.current.rotation.x = MathUtils.damp(group.current.rotation.x, targetX, 3, delta)
    }

    if (headGroup.current && !reducedMotion) {
      headGroup.current.rotation.y = MathUtils.damp(
        headGroup.current.rotation.y,
        pointer.x * 0.32,
        4,
        delta,
      )
      headGroup.current.rotation.x = MathUtils.damp(
        headGroup.current.rotation.x,
        pointer.y * 0.18,
        4,
        delta,
      )
    }

    if (tail.current && !reducedMotion) {
      tail.current.rotation.y = Math.sin(t * 1.3) * 0.1
      tail.current.rotation.x = Math.sin(t * 0.8) * 0.04
    }

    if (leftEye.current && rightEye.current) {
      const target = EYE_SCALE * (t % 4.4 > 4.2 ? 0.12 : 1)
      const scaleY = MathUtils.damp(leftEye.current.scale.y, target, 20, delta)
      leftEye.current.scale.y = scaleY
      rightEye.current.scale.y = scaleY
    }
  })

  return (
    <Float
      speed={reducedMotion ? 0 : 1.05}
      rotationIntensity={reducedMotion ? 0 : 0.06}
      floatIntensity={reducedMotion ? 0 : 0.28}
      floatingRange={[-0.04, 0.04]}
    >
      <group scale={0.78} rotation={[0.1, -0.95, 0]} position={[0.04, 0.02, 0]}>
        <group ref={group} dispose={null}>
          <mesh position={[0, 0.28, -0.06]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1.2, 0.88]}>
            <capsuleGeometry args={[0.4, 0.52, 4, 8]} />
            <Facet color={C.body} />
          </mesh>
          <mesh position={[0, 0.06, 0.02]} scale={[0.38, 0.18, 0.46]}>
            <sphereGeometry args={[1, 8, 6]} />
            <Facet color={C.belly} />
          </mesh>

          <Bone
            from={[0, 0.42, 0.2]}
            to={[0, 0.5, 0.42]}
            r1={0.24}
            r2={0.2}
            radial={6}
            color={C.body}
          />

          <group ref={tail} position={TAIL_PIVOT}>
            <mesh position={[0, 0.02, -0.08]} scale={[0.34, 0.26, 0.32]}>
              <sphereGeometry args={[1, 6, 4]} />
              <Facet color={C.body} />
            </mesh>
            <Chain nodes={TAIL} color={C.body} />
          </group>

          {LEGS.map(({ side, z }) => {
            const hip = [0.3 * side, 0.14, z]
            const ankle = [0.32 * side, -0.42, z + 0.02]
            return (
              <group key={`leg-${side}-${z}`}>
                <Bone from={hip} to={ankle} r1={0.2} r2={0.16} radial={5} color={C.limb} />
                <mesh position={[0.32 * side, -0.52, z + 0.08]} scale={[0.22, 0.1, 0.26]}>
                  <boxGeometry args={[1, 1, 1]} />
                  <Facet color={C.limb} />
                </mesh>
                {[-0.07, 0, 0.07].map((x) => (
                  <mesh
                    key={x}
                    position={[0.32 * side + x, -0.52, z + 0.22]}
                    scale={[0.07, 0.07, 0.1]}
                  >
                    <boxGeometry args={[1, 1, 1]} />
                    <Facet color={C.cream} />
                  </mesh>
                ))}
              </group>
            )
          })}

          <group ref={headGroup} position={HEAD_PIVOT}>
            {/* Skull */}
            <mesh position={[0, 0.06, 0.12]} scale={[0.46, 0.4, 0.4]}>
              <icosahedronGeometry args={[1, 1]} />
              <Facet color={C.body} />
            </mesh>
            {/* Collar filling the skull–frill join so the plate is not a gap. */}
            <mesh position={[0, 0.1, -0.02]} rotation={[0.32, 0, 0]} scale={[0.52, 0.28, 0.32]}>
              <icosahedronGeometry args={[1, 1]} />
              <Facet color={C.body} />
            </mesh>
            {/* Frill: one thick faceted shield, axis through the skull so it
                reads as the back of the head — not a floating ring. */}
            <mesh position={[0, 0.12, -0.04]} rotation={[Math.PI / 2 + 0.28, 0, 0]}>
              <cylinderGeometry args={[0.62, 0.84, 0.36, 12]} />
              <Facet color={C.body} />
            </mesh>

            {/* Short blunt snout fused to the front of the skull */}
            <mesh position={[0, -0.04, 0.4]} scale={[0.3, 0.24, 0.34]}>
              <icosahedronGeometry args={[1, 1]} />
              <Facet color={C.body} />
            </mesh>
            <mesh position={[0, -0.1, 0.66]} rotation={[0.4, 0, 0]} scale={[0.16, 0.08, 0.16]}>
              <boxGeometry args={[1, 1, 1]} />
              <Facet color={C.beak} roughness={0.62} />
            </mesh>

            <Horn
              position={[-0.22, 0.3, 0.22]}
              rotation={[0.55, 0, -0.16]}
              length={0.52}
              radius={0.09}
            />
            <Horn
              position={[0.22, 0.3, 0.22]}
              rotation={[0.55, 0, 0.16]}
              length={0.52}
              radius={0.09}
            />
            <Horn position={[0, 0.12, 0.48]} rotation={[0.95, 0, 0]} length={0.3} radius={0.07} />

            {[-0.2, 0.2].map((x, i) => (
              <group key={x} position={[x, 0.1, 0.26]}>
                <mesh ref={i === 0 ? leftEye : rightEye} scale={EYE_SCALE}>
                  <icosahedronGeometry args={[1, 1]} />
                  <meshStandardMaterial
                    color={C.eye}
                    flatShading
                    roughness={0.22}
                    metalness={0.15}
                  />
                </mesh>
                <mesh position={[x > 0 ? -0.018 : 0.018, 0.02, 0.032]} scale={0.02}>
                  <icosahedronGeometry args={[1, 0]} />
                  <meshStandardMaterial color={C.highlight} flatShading roughness={0.2} />
                </mesh>
              </group>
            ))}
          </group>
        </group>
      </group>
    </Float>
  )
}
