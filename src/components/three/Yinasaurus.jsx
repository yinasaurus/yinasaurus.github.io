import { Float } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { MathUtils, Quaternion, Vector3 } from 'three'

/**
 * Toy triceratops: squat stance, a wide fan-shaped frill plate behind the
 * skull, two cream brow horns, cream snout / belly / front legs, and a
 * tapering tail that sits near the ground.
 */

const C = {
  body: '#b5c9a5',
  limb: '#9eb392',
  cream: '#e6d0a8',
  belly: '#ead9b4',
  eye: '#1c1814',
  mouth: '#6a5440',
}

const UP = new Vector3(0, 1, 0)
const EYE_SCALE = 0.09

const TAIL_PIVOT = [0, 0.16, -0.78]
const TAIL = [
  { p: [0, 0, 0], r: 0.3 },
  { p: [0, -0.06, -0.4], r: 0.22 },
  { p: [0, -0.16, -0.78], r: 0.14 },
  { p: [0.04, -0.24, -1.08], r: 0.08 },
  { p: [0.08, -0.2, -1.26], r: 0.05 },
]

const HEAD_PIVOT = [0, 0.46, 0.46]

const LEGS = [
  { side: 1, z: 0.34, front: true },
  { side: -1, z: 0.34, front: true },
  { side: 1, z: -0.34, front: false },
  { side: -1, z: -0.34, front: false },
]

const FRILL_SPIKES = 9
const FRILL_RX = 0.56
const FRILL_RY = 0.5

const POSE = {
  threeQuarter: { rotation: [0.04, -0.68, 0], position: [0.02, -0.02, 0] },
  front: { rotation: [0.02, 0.02, 0], position: [0, 0, 0] },
}

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
      <Facet color={color} />
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

function Leg({ side, z, front }) {
  const color = front ? C.cream : C.limb
  const x = 0.34 * side
  const kick = front ? 0.06 : -0.04
  return (
    <group>
      <mesh
        position={[x, 0.06, z]}
        rotation={[front ? 0.18 : 0.08, 0, 0.18 * side]}
        scale={[0.22, 0.32, 0.22]}
      >
        <boxGeometry args={[1, 1, 1]} />
        <Facet color={color} />
      </mesh>
      <mesh
        position={[x + 0.02 * side, -0.2, z + kick]}
        rotation={[front ? -0.08 : 0.12, 0, 0.06 * side]}
        scale={[0.18, 0.28, 0.18]}
      >
        <boxGeometry args={[1, 1, 1]} />
        <Facet color={color} />
      </mesh>
      <mesh position={[x + 0.02 * side, -0.36, z + kick + 0.06]} scale={[0.2, 0.1, 0.28]}>
        <boxGeometry args={[1, 1, 1]} />
        <Facet color={color} />
      </mesh>
    </group>
  )
}

function BrowHorn({ side }) {
  return (
    <group position={[0.17 * side, 0.22, 0.28]} rotation={[0.62, 0.05 * side, -0.2 * side]}>
      <mesh position={[0, 0.16, 0]}>
        <coneGeometry args={[0.095, 0.36, 5]} />
        <Facet color={C.cream} roughness={0.42} />
      </mesh>
      <mesh position={[0, 0.38, 0.04]} rotation={[0.32, 0, 0]}>
        <coneGeometry args={[0.052, 0.26, 5]} />
        <Facet color={C.cream} roughness={0.42} />
      </mesh>
    </group>
  )
}

/**
 * Isolated skull-plate. Lives only on the head group, behind the skull
 * sphere — never on the body capsule or spine. Local XY is the face of
 * the fan (forward/back). Spikes are children of this plate only.
 */
function Frill() {
  const spikes = useMemo(() => {
    const start = 0.06 * Math.PI
    const end = 0.94 * Math.PI
    return Array.from({ length: FRILL_SPIKES }, (_, i) => {
      const t = start + ((end - start) * i) / (FRILL_SPIKES - 1)
      return {
        t,
        x: Math.cos(t) * (FRILL_RX + 0.05),
        y: Math.sin(t) * (FRILL_RY + 0.05),
      }
    })
  }, [])

  return (
    <group position={[0, 0.26, -0.38]} rotation={[-0.12, 0, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[FRILL_RY, FRILL_RX, 0.1, 8]} />
        <Facet color={C.body} />
      </mesh>
      <mesh position={[0, 0, -0.055]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[FRILL_RY * 0.92, FRILL_RX * 0.92, 0.04, 8]} />
        <Facet color={C.limb} />
      </mesh>
      {spikes.map((spike) => (
        <mesh
          key={spike.t}
          position={[spike.x, spike.y, 0]}
          rotation={[0, 0, spike.t - Math.PI / 2]}
        >
          <coneGeometry args={[0.045, 0.11, 3]} />
          <Facet color={C.body} />
        </mesh>
      ))}
    </group>
  )
}

export function Yinasaurus({ pointerRef, reducedMotion = false, pose = 'threeQuarter' }) {
  const group = useRef()
  const headGroup = useRef()
  const tail = useRef()
  const leftEye = useRef()
  const rightEye = useRef()
  const rest = POSE[pose] ?? POSE.threeQuarter

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const pointer = pointerRef?.current ?? { x: 0, y: 0 }

    if (group.current) {
      const targetY = reducedMotion ? 0 : pointer.x * 0.16
      const targetX = reducedMotion ? 0 : pointer.y * 0.07
      group.current.rotation.y = MathUtils.damp(group.current.rotation.y, targetY, 3, delta)
      group.current.rotation.x = MathUtils.damp(group.current.rotation.x, targetX, 3, delta)
    }

    if (headGroup.current && !reducedMotion) {
      headGroup.current.rotation.y = MathUtils.damp(
        headGroup.current.rotation.y,
        pointer.x * 0.28,
        4,
        delta,
      )
      headGroup.current.rotation.x = MathUtils.damp(
        headGroup.current.rotation.x,
        pointer.y * 0.14,
        4,
        delta,
      )
    }

    if (tail.current && !reducedMotion) {
      tail.current.rotation.y = Math.sin(t * 1.15) * 0.08
      tail.current.rotation.x = Math.sin(t * 0.7) * 0.03
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
      rotationIntensity={reducedMotion ? 0 : 0.05}
      floatIntensity={reducedMotion ? 0 : 0.18}
      floatingRange={[-0.025, 0.025]}
    >
      <group scale={1.02} rotation={rest.rotation} position={rest.position}>
        <group ref={group} dispose={null}>
          <mesh position={[0, 0.22, -0.02]} rotation={[Math.PI / 2, 0, 0]} scale={[1.02, 1.08, 0.9]}>
            <capsuleGeometry args={[0.4, 0.46, 4, 8]} />
            <Facet color={C.body} />
          </mesh>
          <mesh position={[0, 0.05, 0.08]} scale={[0.4, 0.2, 0.48]}>
            <sphereGeometry args={[1, 8, 6]} />
            <Facet color={C.belly} />
          </mesh>

          <Bone
            from={[0, 0.36, 0.2]}
            to={[0, 0.44, 0.42]}
            r1={0.26}
            r2={0.22}
            radial={6}
            color={C.body}
          />

          <group ref={tail} position={TAIL_PIVOT}>
            <mesh position={[0, 0.02, -0.06]} scale={[0.34, 0.26, 0.32]}>
              <sphereGeometry args={[1, 6, 4]} />
              <Facet color={C.body} />
            </mesh>
            <Chain nodes={TAIL} color={C.body} radial={8} />
            <mesh position={[0.08, -0.2, -1.26]} scale={0.055}>
              <sphereGeometry args={[1, 8, 6]} />
              <Facet color={C.body} />
            </mesh>
          </group>

          {LEGS.map((leg) => (
            <Leg key={`leg-${leg.side}-${leg.z}`} {...leg} />
          ))}

          <group ref={headGroup} position={HEAD_PIVOT}>
            <mesh position={[0, 0.06, 0.08]} scale={[0.46, 0.42, 0.4]}>
              <sphereGeometry args={[1, 8, 6]} />
              <Facet color={C.body} />
            </mesh>

            <Frill />

            <mesh position={[0, -0.08, 0.34]} rotation={[0.2, 0, 0]} scale={[0.26, 0.2, 0.28]}>
              <icosahedronGeometry args={[1, 1]} />
              <Facet color={C.cream} />
            </mesh>
            <mesh position={[0, -0.1, 0.52]} rotation={[0.1, 0, 0]} scale={[0.07, 0.014, 0.03]}>
              <boxGeometry args={[1, 1, 1]} />
              <Facet color={C.mouth} roughness={0.7} />
            </mesh>

            <BrowHorn side={-1} />
            <BrowHorn side={1} />

            {[-0.155, 0.155].map((x, i) => (
              <mesh
                key={x}
                ref={i === 0 ? leftEye : rightEye}
                position={[x, 0.1, 0.34]}
                scale={EYE_SCALE}
              >
                <sphereGeometry args={[1, 10, 8]} />
                <meshStandardMaterial color={C.eye} roughness={0.35} metalness={0} />
              </mesh>
            ))}
          </group>
        </group>
      </group>
    </Float>
  )
}
