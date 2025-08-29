'use client'

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import TradingChart from './TradingChart'

export default function Nintendo64Logo({ heartClicks, heartJustClicked, joystickInput, isLevelingUp }: { heartClicks: number, heartJustClicked?: boolean, joystickInput?: { x: number, y: number }, isLevelingUp?: boolean }) {
  const logoRef = useRef<THREE.Group>(null)
  const modelRef = useRef<THREE.Group>(null)
  const { scene } = useGLTF('/tsteve.glb')
  const rotationRef = useRef({ x: 0, y: 0 })
  const isUpdatingMaterials = useRef(false)
  
  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      if (scene) {
        scene.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material) {
            // Restore original materials on cleanup
            const originalMaterial = (child.userData as any).originalMaterial
            if (originalMaterial) {
              child.material = originalMaterial
            }
          }
        })
      }
    }
  }, [scene])

  // Apply shader effect to all meshes in the model - optimized with better error handling
  useEffect(() => {
    if (!scene) return
    
    try {
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          // Store original material safely
          if (!(child.userData as any).originalMaterial) {
            (child.userData as any).originalMaterial = child.material.clone()
          }
          
          // Ensure material has proper emissive properties
          if (child.material instanceof THREE.MeshStandardMaterial) {
            // Initialize emissive properties safely
            try {
              if (!child.material.emissive) {
                child.material.emissive = new THREE.Color(0, 0, 0)
              }
              if (typeof child.material.emissiveIntensity !== 'number') {
                child.material.emissiveIntensity = 0
              }
              // Mark as initialized
              (child.userData as any).materialInitialized = true
            } catch (matError) {
              console.warn('Material property initialization failed:', matError)
            }
          }
        }
      })
    } catch (error) {
      console.warn('Material initialization error:', error)
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

      // Simplified material updates to prevent Three.js errors - skip during level transitions
      if (scene && !isUpdatingMaterials.current && !isLevelingUp && (heartJustClicked || heartClicks >= 100)) {
        isUpdatingMaterials.current = true
        
        // Use setTimeout to defer material updates and prevent render conflicts
        setTimeout(() => {
          try {
            // Calculate effects once
            const isFullyCharged = heartClicks >= 100
            const explosionIntensity = isFullyCharged ? 2 : 0
            const pulseIntensity = heartJustClicked ? 1.5 : 0
            const totalIntensity = explosionIntensity + pulseIntensity
            
            if (totalIntensity > 0 && scene) {
              // Pre-calculate colors
              const red = explosionIntensity > 0 ? 0.5 : 0
              const green = pulseIntensity > 0 ? 1 : 0.5
              const blue = explosionIntensity > 0 ? 0.5 : 0
              
              scene.traverse((child) => {
                try {
                  if (child instanceof THREE.Mesh && 
                      child.material instanceof THREE.MeshStandardMaterial &&
                      child.material.emissive &&
                      (child.userData as any).materialInitialized) {
                    
                    // Safely update emissive properties with validation
                    if (child.material.emissive && typeof child.material.emissive.setRGB === 'function') {
                      child.material.emissive.setRGB(red * totalIntensity, green * totalIntensity, blue * totalIntensity)
                      child.material.emissiveIntensity = totalIntensity
                    }
                  }
                } catch (childError) {
                  // Silently skip problematic children
                }
              })
              
              // Scale effect for explosion
              if (modelRef.current) {
                const scaleBoost = isFullyCharged ? 1.1 : 1
                modelRef.current.scale.setScalar(1.5 * scaleBoost)
              }
            }
          } catch (error) {
            console.warn('Material update deferred error:', error)
          } finally {
            isUpdatingMaterials.current = false
          }
        }, 0)
      } else if (scene && !heartJustClicked && heartClicks < 100 && !isUpdatingMaterials.current && !isLevelingUp) {
        // Reset materials when no effects are active - also deferred
        setTimeout(() => {
          try {
            if (scene) {
              scene.traverse((child) => {
                try {
                  if (child instanceof THREE.Mesh && 
                      child.material instanceof THREE.MeshStandardMaterial &&
                      child.material.emissive &&
                      (child.userData as any).materialInitialized) {
                    
                    if (child.material.emissive && typeof child.material.emissive.setRGB === 'function') {
                      child.material.emissive.setRGB(0, 0, 0)
                      child.material.emissiveIntensity = 0
                    }
                  }
                } catch (childError) {
                  // Silently skip problematic children
                }
              })
            }
            if (modelRef.current) {
              modelRef.current.scale.setScalar(1.5)
            }
          } catch (error) {
            console.warn('Material reset deferred error:', error)
          }
        }, 0)
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