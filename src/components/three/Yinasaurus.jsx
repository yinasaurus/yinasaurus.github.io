import { Float } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { MathUtils, Quaternion, Vector3 } from 'three'

/**
 * The mascot — a chunky low-poly toy triceratops.
 *
 * Head + frill is almost as large as the body. The frill is a back-tilted
 * octagonal plate (not a thin edge-on disc) so it reads from the hero camera.
 *
 * To swap the mascot, replace this component; camera, lights and cursor
 * tracking in `MascotScene` stay as they are.
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

const HEAD_PIVOT = [0, 0.58, 0.5]

const LEGS = [
  { side: 1, z: 0.28 },
  { side: -1, z: 0.28 },
  { side: 1, z: -0.3 },
  { side: -1, z: -0.3 },
]

const FRILL_SPIKES = Array.from({ length: 11 }, (_, i) => {
  const theta = -1.2 + (i / 10) * 2.4
  return { theta }
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
      {/* Three-quarter so the frill face, snout and tail all leave the silhouette. */}
      <group scale={0.78} rotation={[0.1, -0.95, 0]} position={[0.04, 0.02, 0]}>
        <group ref={group} dispose={null}>
          <mesh position={[0, 0.28, -0.02]} scale={[0.62, 0.5, 0.7]}>
            <icosahedronGeometry args={[1, 1]} />
            <Facet color={C.body} />
          </mesh>
          <mesh position={[0, 0.06, 0.02]} scale={[0.42, 0.22, 0.5]}>
            <icosahedronGeometry args={[1, 0]} />
            <Facet color={C.belly} />
          </mesh>

          <Bone
            from={[0, 0.44, 0.22]}
            to={[0, 0.54, 0.44]}
            r1={0.2}
            r2={0.16}
            radial={6}
            color={C.body}
          />

          <group ref={tail} position={TAIL_PIVOT}>
            <mesh position={[0, 0.02, -0.08]} scale={[0.34, 0.3, 0.32]}>
              <icosahedronGeometry args={[1, 0]} />
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
            {/* Skull — its own mass, smaller than the frill */}
            <mesh position={[0, 0.06, 0.04]} scale={[0.4, 0.36, 0.32]}>
              <icosahedronGeometry args={[1, 1]} />
              <Facet color={C.body} />
            </mesh>

            {/* Short blunt snout that actually leaves the skull */}
            <mesh position={[0, -0.04, 0.46]} scale={[0.26, 0.2, 0.36]}>
              <icosahedronGeometry args={[1, 1]} />
              <Facet color={C.body} />
            </mesh>
            <mesh position={[0, -0.12, 0.74]} rotation={[0.4, 0, 0]} scale={[0.15, 0.08, 0.16]}>
              <boxGeometry args={[1, 1, 1]} />
              <Facet color={C.beak} roughness={0.62} />
            </mesh>

            {/* Frill: wide octagonal plate, tilted so the fan faces the camera */}
            <group position={[0, 0.28, -0.28]} rotation={[1.05, 0, 0]}>
              <mesh>
                <cylinderGeometry args={[1.02, 1.1, 0.16, 8]} />
                <Facet color={C.body} />
              </mesh>
              <mesh>
                <torusGeometry args={[1.06, 0.08, 5, 10]} />
                <Facet color={C.cream} roughness={0.42} />
              </mesh>
              {FRILL_SPIKES.map((spike, i) => (
                <mesh
                  key={i}
                  position={[Math.sin(spike.theta) * 1.12, 0.02, Math.cos(spike.theta) * 1.12]}
                  rotation={[0, spike.theta, 0]}
                >
                  <coneGeometry args={[0.09, 0.18, 3]} />
                  <Facet color={C.cream} roughness={0.42} />
                </mesh>
              ))}
            </group>

            {/* Two long brow horns */}
            <Horn
              position={[-0.18, 0.36, 0.16]}
              rotation={[0.42, 0, -0.2]}
              length={0.62}
              radius={0.095}
            />
            <Horn
              position={[0.18, 0.36, 0.16]}
              rotation={[0.42, 0, 0.2]}
              length={0.62}
              radius={0.095}
            />
            {/* Shorter nose horn, sitting on the snout */}
            <Horn position={[0, 0.1, 0.58]} rotation={[0.95, 0, 0]} length={0.3} radius={0.07} />

            {[-0.2, 0.2].map((x, i) => (
              <group key={x} position={[x, 0.1, 0.28]}>
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
