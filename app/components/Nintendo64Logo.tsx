'use client'

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import TradingChart from './TradingChart'

export default function Nintendo64Logo({ heartClicks, heartJustClicked, joystickInput }: { heartClicks: number, heartJustClicked?: boolean, joystickInput?: { x: number, y: number } }) {
  const logoRef = useRef<THREE.Group>(null)
  const modelRef = useRef<THREE.Group>(null)
  const { scene } = useGLTF('/tsteve.glb')
  const rotationRef = useRef({ x: 0, y: 0 })

  // Apply shader effect to all meshes in the model
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          // Store original material
          if (!(child.userData as any).originalMaterial) {
            (child.userData as any).originalMaterial = child.material.clone()
          }
        }
      })
    }
  }, [scene])

  useFrame((state) => {
    if (logoRef.current) {
      logoRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
      logoRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.1
    }
    if (modelRef.current) {
      // Keep the floating motion regardless of control mode
      modelRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.2) * 0.1
      
      // Use joystick input for orbit-style rotation or fall back to automatic rotation
      if (joystickInput && (joystickInput.x !== 0 || joystickInput.y !== 0)) {
        // Manual orbit control with joystick
        // Apply exponential scaling - faster at the edges
        const xIntensity = Math.sign(joystickInput.x) * Math.pow(Math.abs(joystickInput.x), 2) * 0.08
        const yIntensity = Math.sign(joystickInput.y) * Math.pow(Math.abs(joystickInput.y), 2) * 0.08
        
        rotationRef.current.y += xIntensity // Horizontal rotation
        rotationRef.current.x += yIntensity // Vertical rotation
        
        // Clamp vertical rotation to prevent flipping
        rotationRef.current.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, rotationRef.current.x))
        
        modelRef.current.rotation.x = rotationRef.current.x
        modelRef.current.rotation.y = rotationRef.current.y
      } else {
        // Automatic rotation when not being controlled
        modelRef.current.rotation.x = state.clock.elapsedTime * 0.5
        modelRef.current.rotation.y = state.clock.elapsedTime * 0.3
        // Update rotation ref to match automatic rotation
        rotationRef.current.x = state.clock.elapsedTime * 0.5
        rotationRef.current.y = state.clock.elapsedTime * 0.3
      }

      // Apply progressive glow effect based on heart clicks
      if (scene) {
        scene.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
            // Base glow that increases with heart clicks
            const chargeLevel = heartClicks / 100
            const baseGlow = chargeLevel * 0.5
            
            // Explosion effect at 100%
            const isFullyCharged = heartClicks >= 100
            const explosionIntensity = isFullyCharged ? 2 + Math.sin(state.clock.elapsedTime * 10) * 1.5 : 0
            
            // Heart click pulse effect
            const pulseIntensity = heartJustClicked ? 1 + Math.sin(state.clock.elapsedTime * 20) * 0.8 : 0
            
            // Combine all effects
            const totalIntensity = baseGlow + explosionIntensity + pulseIntensity
            
            if (totalIntensity > 0) {
              // Progressive color: blue -> purple -> pink -> white
              const red = Math.min(1, 0.2 + chargeLevel * 1.5 + explosionIntensity * 0.3)
              const green = Math.min(1, 0.1 + explosionIntensity * 0.5)
              const blue = Math.min(1, 0.8 - chargeLevel * 0.3 + explosionIntensity * 0.2)
              
              child.material.emissive.setRGB(red * totalIntensity, green * totalIntensity, blue * totalIntensity)
              child.material.emissiveIntensity = totalIntensity
              
              // Scale effect for explosion
              if (isFullyCharged && modelRef.current) {
                const scaleBoost = 1 + Math.sin(state.clock.elapsedTime * 5) * 0.1
                modelRef.current.scale.setScalar(1.5 * scaleBoost)
              } else if (modelRef.current) {
                modelRef.current.scale.setScalar(1.5)
              }
            } else {
              child.material.emissive.setRGB(0, 0, 0)
              child.material.emissiveIntensity = 0
            }
          }
        })
      }
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