import { Float } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { MathUtils, Quaternion, Vector3 } from 'three'

/**
 * The mascot — a chunky low-poly toy T-rex.
 *
 * Each body part is a separate mass with a gap or a thin connector between
 * them, so the silhouette reads as head / neck / torso / arms / tail / legs
 * rather than one fused blob. `Bone` is the thin connector (neck, limbs,
 * tail segments). Head and torso are scaled icosahedrons.
 *
 * To swap the mascot, replace this component; camera, lights and cursor
 * tracking in `MascotScene` stay as they are.
 */

const C = {
  body: '#17c79a',
  limb: '#0fa77f',
  plateA: '#ff4d8d',
  plateB: '#ffb020',
  eye: '#171225',
  highlight: '#f5f2ec',
  nostril: '#0d3d32',
}

const UP = new Vector3(0, 1, 0)
const EYE_SCALE = 0.12

const TAIL_PIVOT = [0, 0.16, -0.62]
const TAIL = [
  { p: [0, 0, 0], r: 0.32 },
  { p: [0, 0.06, -0.48], r: 0.24 },
  { p: [0, 0.2, -0.95], r: 0.14 },
  { p: [0, 0.34, -1.38], r: 0.05 },
]

const HEAD_PIVOT = [0, 0.92, 0.78]

const BODY_PLATES = [
  { z: 0.12, y: 0.74, h: 0.15, color: C.plateB },
  { z: -0.12, y: 0.7, h: 0.14, color: C.plateA },
  { z: -0.34, y: 0.6, h: 0.12, color: C.plateB },
]

const HEAD_PLATES = [
  { z: -0.16, y: 0.5, h: 0.13, color: C.plateA },
  { z: 0.06, y: 0.46, h: 0.12, color: C.plateB },
]

const TAIL_PLATES = [
  { z: -0.2, y: 0.32, h: 0.12, color: C.plateA },
  { z: -0.55, y: 0.3, h: 0.11, color: C.plateB },
  { z: -0.9, y: 0.32, h: 0.09, color: C.plateA },
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

function Plate({ z, y, h, color }) {
  return (
    <mesh position={[0, y, z]} rotation={[0.18, 0, 0]}>
      <coneGeometry args={[0.075, h, 3]} />
      <meshStandardMaterial color={color} flatShading roughness={0.5} metalness={0} />
    </mesh>
  )
}

function Facet({ color, roughness = 0.55 }) {
  return <meshStandardMaterial color={color} flatShading roughness={roughness} metalness={0} />
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
      {/* Scaled down so head, tail and feet stay inside the canvas with
          breathing room. Three-quarter yaw so the tail leaves the body. */}
      <group scale={0.68} rotation={[0.02, -0.92, 0]} position={[0.1, 0.02, 0]}>
        <group ref={group} dispose={null}>
          {/* ---- Torso: compact, does not swallow the head or tail ---- */}
          <mesh position={[0, 0.18, 0]} scale={[0.68, 0.54, 0.52]}>
            <icosahedronGeometry args={[1, 1]} />
            <Facet color={C.body} />
          </mesh>

          {BODY_PLATES.map((plate, i) => (
            <Plate key={i} {...plate} />
          ))}

          {/* ---- Neck: thinner and longer than the masses it joins, so the
               head sits as its own piece instead of melting into the torso ---- */}
          <Bone
            from={[0, 0.48, 0.32]}
            to={[0, 0.86, 0.7]}
            r1={0.16}
            r2={0.12}
            radial={6}
            color={C.body}
          />

          {/* ---- Tail: starts behind the torso, thick → point, slightly up ---- */}
          <group ref={tail} position={TAIL_PIVOT}>
            <Chain nodes={TAIL} color={C.body} />
            {TAIL_PLATES.map((plate, i) => (
              <Plate key={i} {...plate} />
            ))}
          </group>

          {/* ---- Legs: upper + lower + foot, stubby but readable ---- */}
          {[1, -1].map((side) => (
            <group key={`leg-${side}`}>
              <Bone
                from={[0.3 * side, -0.2, 0.02]}
                to={[0.34 * side, -0.52, 0.1]}
                r1={0.22}
                r2={0.18}
                radial={5}
                color={C.limb}
              />
              <Bone
                from={[0.34 * side, -0.52, 0.1]}
                to={[0.34 * side, -0.82, 0.14]}
                r1={0.18}
                r2={0.15}
                radial={5}
                color={C.limb}
              />
              <mesh position={[0.34 * side, -0.9, 0.26]} scale={[0.24, 0.11, 0.34]}>
                <boxGeometry args={[1, 1, 1]} />
                <Facet color={C.limb} />
              </mesh>
              {[-0.07, 0.07].map((x) => (
                <mesh
                  key={x}
                  position={[0.34 * side + x, -0.88, 0.46]}
                  scale={[0.075, 0.085, 0.12]}
                >
                  <boxGeometry args={[1, 1, 1]} />
                  <Facet color={C.limb} />
                </mesh>
              ))}
            </group>
          ))}

          {/* ---- Arms: outside the torso, tucked forward at the chest ---- */}
          {[1, -1].map((side) => (
            <group key={`arm-${side}`}>
              <Bone
                from={[0.6 * side, 0.24, 0.18]}
                to={[0.78 * side, 0.08, 0.46]}
                r1={0.13}
                r2={0.1}
                radial={5}
                color={C.limb}
              />
              <Bone
                from={[0.78 * side, 0.08, 0.46]}
                to={[0.68 * side, 0.16, 0.66]}
                r1={0.1}
                r2={0.07}
                radial={4}
                color={C.limb}
              />
            </group>
          ))}

          {/* ---- Head: cranium + a snout that actually sticks out ---- */}
          <group ref={headGroup} position={HEAD_PIVOT}>
            <mesh position={[0, 0.1, -0.06]} scale={[0.5, 0.44, 0.38]}>
              <icosahedronGeometry args={[1, 1]} />
              <Facet color={C.body} />
            </mesh>

            {/* Short wide muzzle — a different mass from the cranium, not a cone */}
            <mesh position={[0, -0.04, 0.4]} scale={[0.3, 0.24, 0.38]}>
              <icosahedronGeometry args={[1, 1]} />
              <Facet color={C.body} />
            </mesh>
            <mesh position={[0, -0.06, 0.62]} scale={[0.2, 0.16, 0.18]}>
              <icosahedronGeometry args={[1, 0]} />
              <Facet color={C.body} />
            </mesh>

            <mesh position={[0, -0.12, 0.72]} scale={[0.18, 0.022, 0.03]}>
              <boxGeometry args={[1, 1, 1]} />
              <Facet color={C.nostril} roughness={0.7} />
            </mesh>

            {[-0.07, 0.07].map((x) => (
              <mesh key={x} position={[x, -0.02, 0.74]} scale={0.03}>
                <icosahedronGeometry args={[1, 0]} />
                <Facet color={C.nostril} roughness={0.7} />
              </mesh>
            ))}

            {HEAD_PLATES.map((plate, i) => (
              <Plate key={i} {...plate} />
            ))}

            {[-0.28, 0.28].map((x, i) => (
              <group key={x} position={[x, 0.18, 0.2]}>
                <mesh ref={i === 0 ? leftEye : rightEye} scale={EYE_SCALE}>
                  <icosahedronGeometry args={[1, 1]} />
                  <meshStandardMaterial
                    color={C.eye}
                    flatShading
                    roughness={0.22}
                    metalness={0.2}
                  />
                </mesh>
                <mesh position={[x > 0 ? -0.028 : 0.028, 0.034, 0.05]} scale={0.032}>
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
