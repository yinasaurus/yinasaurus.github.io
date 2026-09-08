import { Float } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { MathUtils, Quaternion, Vector3 } from 'three'

/**
 * The mascot — a chunky low-poly toy triceratops.
 *
 * Quadrupedal, large frilled head, three tan horns. `Bone` is the thin
 * connector for neck, legs and tail. Head and torso are scaled icosahedrons
 * so the facets stay visible.
 *
 * To swap the mascot, replace this component; camera, lights and cursor
 * tracking in `MascotScene` stay as they are.
 */

const C = {
  body: '#7f8f72',
  limb: '#6e7d62',
  cream: '#d8c7a2',
  belly: '#cfc09a',
  eye: '#1b1712',
  highlight: '#f3eee4',
  beak: '#6a5a42',
}

const UP = new Vector3(0, 1, 0)
const EYE_SCALE = 0.085

const TAIL_PIVOT = [0, 0.14, -0.58]
const TAIL = [
  { p: [0, 0, 0], r: 0.3 },
  { p: [0, -0.08, -0.36], r: 0.2 },
  { p: [0, -0.16, -0.64], r: 0.07 },
]

const HEAD_PIVOT = [0, 0.56, 0.58]

const LEGS = [
  { side: 1, z: 0.3 },
  { side: -1, z: 0.3 },
  { side: 1, z: -0.28 },
  { side: -1, z: -0.28 },
]

// Cream studs around the top and sides of the frill rim.
const FRILL_SPIKES = Array.from({ length: 9 }, (_, i) => {
  const theta = -1.05 + (i / 8) * 2.1
  return {
    x: Math.sin(theta) * 0.78,
    y: Math.cos(theta) * 0.7 + 0.08,
    z: -0.5,
    rotZ: -theta,
  }
})

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

function Horn({ position, rotation, length, radius }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, length * 0.48, 0]}>
        <coneGeometry args={[radius, length, 5]} />
        <Facet color={C.cream} roughness={0.48} />
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
      <group scale={0.82} rotation={[0.08, -0.72, 0]} position={[0.06, 0.04, 0]}>
        <group ref={group} dispose={null}>
          {/* ---- Torso: compact barrel, not a T-rex upright mass ---- */}
          <mesh position={[0, 0.3, 0.02]} scale={[0.72, 0.56, 0.8]}>
            <icosahedronGeometry args={[1, 1]} />
            <Facet color={C.body} />
          </mesh>
          <mesh position={[0, 0.1, 0.04]} scale={[0.5, 0.26, 0.58]}>
            <icosahedronGeometry args={[1, 0]} />
            <Facet color={C.belly} />
          </mesh>

          {/* ---- Neck: short and thick into the frill ---- */}
          <Bone
            from={[0, 0.46, 0.28]}
            to={[0, 0.54, 0.52]}
            r1={0.22}
            r2={0.18}
            radial={6}
            color={C.body}
          />

          {/* ---- Tail: short, thick, hanging low ---- */}
          <group ref={tail} position={TAIL_PIVOT}>
            <Chain nodes={TAIL} color={C.body} />
          </group>

          {/* ---- Four matching pillar legs ---- */}
          {LEGS.map(({ side, z }) => {
            const hip = [0.34 * side, 0.16, z]
            const ankle = [0.36 * side, -0.42, z + 0.02]
            return (
              <group key={`leg-${side}-${z}`}>
                <Bone from={hip} to={ankle} r1={0.2} r2={0.16} radial={5} color={C.limb} />
                <mesh position={[0.36 * side, -0.52, z + 0.08]} scale={[0.22, 0.1, 0.26]}>
                  <boxGeometry args={[1, 1, 1]} />
                  <Facet color={C.limb} />
                </mesh>
                {[-0.07, 0, 0.07].map((x) => (
                  <mesh
                    key={x}
                    position={[0.36 * side + x, -0.52, z + 0.22]}
                    scale={[0.07, 0.07, 0.1]}
                  >
                    <boxGeometry args={[1, 1, 1]} />
                    <Facet color={C.cream} />
                  </mesh>
                ))}
              </group>
            )
          })}

          {/* ---- Head: skull + blunt snout + frill + three horns ---- */}
          <group ref={headGroup} position={HEAD_PIVOT}>
            <mesh position={[0, 0.1, 0]} scale={[0.52, 0.46, 0.4]}>
              <icosahedronGeometry args={[1, 1]} />
              <Facet color={C.body} />
            </mesh>

            <mesh position={[0, -0.04, 0.36]} scale={[0.3, 0.24, 0.3]}>
              <icosahedronGeometry args={[1, 1]} />
              <Facet color={C.body} />
            </mesh>

            {/* Beak wedge at the front of the snout */}
            <mesh position={[0, -0.12, 0.58]} rotation={[0.35, 0, 0]} scale={[0.16, 0.09, 0.14]}>
              <boxGeometry args={[1, 1, 1]} />
              <Facet color={C.beak} roughness={0.62} />
            </mesh>

            {/* Frill: flattened plate sitting behind the skull */}
            <mesh position={[0, 0.16, -0.36]} rotation={[0.35, 0, 0]} scale={[0.92, 0.84, 0.18]}>
              <icosahedronGeometry args={[1, 1]} />
              <Facet color={C.body} />
            </mesh>

            {FRILL_SPIKES.map((spike, i) => (
              <mesh
                key={i}
                position={[spike.x, spike.y, spike.z]}
                rotation={[0.55, 0, spike.rotZ]}
                scale={[0.09, 0.14, 0.07]}
              >
                <coneGeometry args={[1, 1, 3]} />
                <Facet color={C.cream} roughness={0.48} />
              </mesh>
            ))}

            {/* Brow horns — longer, leaning forward */}
            <Horn
              position={[-0.2, 0.34, 0.1]}
              rotation={[0.72, 0, -0.22]}
              length={0.52}
              radius={0.068}
            />
            <Horn
              position={[0.2, 0.34, 0.1]}
              rotation={[0.72, 0, 0.22]}
              length={0.52}
              radius={0.068}
            />
            {/* Nose horn — shorter */}
            <Horn position={[0, 0.04, 0.46]} rotation={[1.15, 0, 0]} length={0.22} radius={0.05} />

            {[-0.2, 0.2].map((x, i) => (
              <group key={x} position={[x, 0.12, 0.24]}>
                <mesh ref={i === 0 ? leftEye : rightEye} scale={EYE_SCALE}>
                  <icosahedronGeometry args={[1, 1]} />
                  <meshStandardMaterial
                    color={C.eye}
                    flatShading
                    roughness={0.22}
                    metalness={0.15}
                  />
                </mesh>
                <mesh position={[x > 0 ? -0.02 : 0.02, 0.022, 0.036]} scale={0.022}>
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
