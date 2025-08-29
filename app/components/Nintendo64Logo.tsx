'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import TradingChart from './TradingChart'

export default function Nintendo64Logo({ heartClicks }: { heartClicks: number }) {
  const logoRef = useRef<THREE.Group>(null)
  const modelRef = useRef<THREE.Group>(null)
  const { scene } = useGLTF('/tsteve.glb')

  useFrame((state) => {
    if (logoRef.current) {
      logoRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
      logoRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.1
    }
    if (modelRef.current) {
      modelRef.current.rotation.x = state.clock.elapsedTime * 0.5
      modelRef.current.rotation.y = state.clock.elapsedTime * 0.3
      modelRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.2) * 0.1
    }
  })

  return (
    <group ref={logoRef}>
      {/* Trading Chart Background */}
      <TradingChart heartClicks={heartClicks} />
      
      {/* Main 3D model */}
      <primitive 
        ref={modelRef}
        object={scene} 
        position={[0, 0, 0]}
        scale={[1.5, 1.5, 1.5]}
      />

      {/* Space debris/asteroids */}
      <mesh position={[4, 2, -3]} rotation={[0, 0, Math.PI / 6]}>
        <dodecahedronGeometry args={[0.3]} />
        <meshStandardMaterial
          color="#666666"
          metalness={0.3}
          roughness={0.8}
        />
      </mesh>
      
      <mesh position={[-4, -1, -4]} rotation={[Math.PI / 3, 0, 0]}>
        <octahedronGeometry args={[0.2]} />
        <meshStandardMaterial
          color="#444444"
          metalness={0.2}
          roughness={0.9}
        />
      </mesh>

      <mesh position={[2, -3, -2]} rotation={[0, Math.PI / 4, 0]}>
        <icosahedronGeometry args={[0.25]} />
        <meshStandardMaterial
          color="#333333"
          metalness={0.1}
          roughness={0.95}
        />
      </mesh>

      {/* Distant stars as small spheres */}
      <mesh position={[8, 6, -10]}>
        <sphereGeometry args={[0.05]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-6, 8, -12]}>
        <sphereGeometry args={[0.03]} />
        <meshBasicMaterial color="#ffdddd" />
      </mesh>
      <mesh position={[10, -4, -8]}>
        <sphereGeometry args={[0.04]} />
        <meshBasicMaterial color="#ddddff" />
      </mesh>
    </group>
  )
}