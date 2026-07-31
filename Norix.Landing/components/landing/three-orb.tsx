'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Mesh } from 'three'

function OrbMesh() {
  const meshRef = useRef<Mesh>(null)

  useFrame((_state, delta) => {
    if (!meshRef.current) return
    meshRef.current.rotation.x += delta * 0.16
    meshRef.current.rotation.y += delta * 0.22
  })

  return (
    <mesh ref={meshRef}>
      <torusKnotGeometry args={[1.1, 0.24, 120, 12]} />
      <meshStandardMaterial color="#22d3a6" emissive="#080f19" metalness={0.74} roughness={0.18} />
    </mesh>
  )
}

export function ThreeOrb() {
  return (
    <div className="h-[260px] overflow-hidden rounded-3xl border border-white/10 bg-[#141a24]/55 shadow-[0_28px_90px_rgb(0_0_0/0.28)] backdrop-blur-2xl">
      <Canvas camera={{ position: [0, 0, 4.2], fov: 45 }}>
        <ambientLight intensity={0.9} />
        <pointLight position={[2, 2, 3]} intensity={2.8} color="#2563ff" />
        <pointLight position={[-3, -2, 2]} intensity={1.8} color="#22d3a6" />
        <pointLight position={[0, -3, 3]} intensity={0.55} color="#7c4dff" />
        <OrbMesh />
      </Canvas>
    </div>
  )
}
