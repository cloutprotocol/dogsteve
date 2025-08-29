'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Planet data for levels 1-10 (expanded to cover all levels)
const PLANETS = [
  { name: 'Earth', color: '#4A90E2', size: 4, distance: 15, atmosphere: '#87CEEB' },      // Level 1
  { name: 'Mars', color: '#CD5C5C', size: 3, distance: 15, atmosphere: '#FF6B47' },       // Level 2
  { name: 'Jupiter', color: '#D2691E', size: 7, distance: 15, atmosphere: '#FFB347' },    // Level 3
  { name: 'Saturn', color: '#FAD5A5', size: 6, distance: 15, atmosphere: '#FFEFD5' },     // Level 4
  { name: 'Uranus', color: '#4FD0E7', size: 4.5, distance: 15, atmosphere: '#87CEEB' },  // Level 5
  { name: 'Neptune', color: '#4169E1', size: 4.5, distance: 15, atmosphere: '#6495ED' }, // Level 6
  { name: 'Pluto', color: '#A0522D', size: 2, distance: 15, atmosphere: '#D2B48C' },     // Level 7
  { name: 'Kepler-452b', color: '#2E8B57', size: 4, distance: 15, atmosphere: '#90EE90' }, // Level 8
  { name: 'Proxima Centauri b', color: '#8B0000', size: 3.5, distance: 15, atmosphere: '#FF4500' }, // Level 9
  { name: 'Trappist-1e', color: '#4B0082', size: 5, distance: 15, atmosphere: '#9370DB' } // Level 10
]

interface PlanetarySystemProps {
  level: number
  isLevelingUp: boolean
  stevePosition: THREE.Vector3
}

export default function PlanetarySystem({ level, isLevelingUp, stevePosition }: PlanetarySystemProps) {
  const planetRef = useRef<THREE.Group>(null)
  const atmosphereRef = useRef<THREE.Mesh>(null)
  
  // Get current planet based on level (1-10)
  const currentPlanet = useMemo(() => {
    const planetIndex = Math.max(0, Math.min(level - 1, PLANETS.length - 1))
    return PLANETS[planetIndex]
  }, [level])

  useFrame((state) => {
    if (!planetRef.current) return
    
    try {
      const currentTime = state.clock.elapsedTime
      
      // Gentle rotation of the entire planet system
      planetRef.current.rotation.y = currentTime * 0.05
      
      // Planet self-rotation
      const planetMesh = planetRef.current.children[0] as THREE.Mesh
      if (planetMesh) {
        planetMesh.rotation.y = currentTime * 0.3
      }
      
      // Atmosphere pulsing effect
      if (atmosphereRef.current?.material instanceof THREE.MeshBasicMaterial) {
        const pulse = 0.2 + Math.sin(currentTime * 1.5) * 0.1
        atmosphereRef.current.material.opacity = pulse
      }
      
      // Gentle floating motion for the planet
      planetRef.current.position.y = Math.sin(currentTime * 0.8) * 0.3
      
    } catch (error) {
      console.warn('PlanetarySystem frame update error:', error)
    }
  })

  return (
    <>
      {/* Current Planet Only */}
      <group ref={planetRef} position={[0, 0, -currentPlanet.distance]}>
        {/* Main Planet */}
        <mesh>
          <sphereGeometry args={[currentPlanet.size, 64, 64]} />
          <meshStandardMaterial
            color={currentPlanet.color}
            metalness={0.1}
            roughness={0.7}
          />
        </mesh>
        
        {/* Atmosphere Glow */}
        <mesh ref={atmosphereRef}>
          <sphereGeometry args={[currentPlanet.size * 1.3, 32, 32]} />
          <meshBasicMaterial
            color={currentPlanet.atmosphere}
            transparent
            opacity={0.2}
            side={THREE.BackSide}
          />
        </mesh>
        
        {/* Saturn's Rings (Level 4) */}
        {currentPlanet.name === 'Saturn' && (
          <>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[currentPlanet.size * 1.4, currentPlanet.size * 2.0, 64]} />
              <meshStandardMaterial
                color="#D4AF37"
                transparent
                opacity={0.8}
                side={THREE.DoubleSide}
              />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[currentPlanet.size * 2.2, currentPlanet.size * 2.6, 64]} />
              <meshStandardMaterial
                color="#B8860B"
                transparent
                opacity={0.6}
                side={THREE.DoubleSide}
              />
            </mesh>
          </>
        )}
      </group>
      
      {/* Static Stars Background */}
      {useMemo(() => 
        Array.from({ length: 150 }).map((_, i) => {
          // Generate consistent star positions
          const seed = i * 137.5 // Golden angle for good distribution
          const x = Math.sin(seed) * 200
          const y = Math.cos(seed) * 200
          const z = -80 - (i % 60) * 3
          const size = 0.05 + (i % 4) * 0.05
          
          return (
            <mesh
              key={`star-${i}`}
              position={[x, y, z]}
            >
              <sphereGeometry args={[size]} />
              <meshBasicMaterial 
                color="#ffffff" 
                transparent
                opacity={0.6 + Math.random() * 0.4}
              />
            </mesh>
          )
        }), []
      )}
    </>
  )
}