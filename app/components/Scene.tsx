'use client'

import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei'
import Nintendo64Logo from './Nintendo64Logo'

export default function Scene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 4], fov: 50 }}
      gl={{ antialias: true }}
      style={{ background: 'radial-gradient(ellipse at center, #0a0a1a 0%, #000000 70%, #000000 100%)' }}
    >
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <pointLight position={[-10, -10, -10]} color="#4a90e2" intensity={0.3} />
      <pointLight position={[15, 5, -5]} color="#ff6b6b" intensity={0.2} />
      <pointLight position={[-5, -15, 10]} color="#ffffff" intensity={0.1} />
      
      <Nintendo64Logo />
      
      <Environment preset="city" />
      <OrbitControls enablePan={false} enableZoom={false} />
    </Canvas>
  )
}