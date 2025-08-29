'use client'

import { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface StevePhysicsProps {
  level: number
  isLevelingUp: boolean
  children: React.ReactNode
  onLevelUpComplete: () => void
  heartJustClicked?: boolean
  onPositionChange?: (position: THREE.Vector3) => void
}

export default function StevePhysics({ level, isLevelingUp, children, onLevelUpComplete, heartJustClicked, onPositionChange }: StevePhysicsProps) {
  const steveRef = useRef<THREE.Group>(null)
  const trailRef = useRef<THREE.Mesh>(null)
  const [velocity, setVelocity] = useState({ y: 0 })
  const [targetY, setTargetY] = useState(0)
  const [isJumping, setIsJumping] = useState(false)
  const [isFlicking, setIsFlicking] = useState(false)
  const [currentY, setCurrentY] = useState(0)
  const [showTrail, setShowTrail] = useState(false)
  
  // Level-based Y positions (base positions for each level)
  const levelYPositions = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] // Base Y positions for each level

  // Create persistent geometry and materials to avoid Three.js errors
  const trailGeometry = useMemo(() => new THREE.CylinderGeometry(0.3, 0.6, 4, 8), [])
  const flickMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: "#00ff88",
    transparent: true,
    opacity: 0.3,
    emissive: "#00ff88",
    emissiveIntensity: 0.2
  }), [])
  const jumpMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: "#00ff88",
    transparent: true,
    opacity: 0.4,
    emissive: "#00ff88",
    emissiveIntensity: 0.3
  }), [])

  // Handle level up jumps
  useEffect(() => {
    try {
      if (isLevelingUp && level > 1 && level <= levelYPositions.length) {
        // Prevent multiple simultaneous level ups
        if (!isJumping && !isFlicking) {
          const newTargetY = levelYPositions[level - 1] || 0
          setTargetY(newTargetY)
          setVelocity({ y: 3 + (level * 0.2) }) // Reduced jump velocity
          setIsJumping(true)
        }
      }
    } catch (error) {
      console.warn('StevePhysics useEffect error:', error)
      // Reset to safe state on error
      setIsJumping(false)
      setVelocity({ y: 0 })
    }
  }, [isLevelingUp, level, isJumping, isFlicking])

  // Handle heart click flicking
  useEffect(() => {
    if (heartJustClicked && !isJumping) {
      // Add upward velocity for flicking
      setVelocity(prev => ({ y: prev.y + 2.5 })) // Flick upward
      setIsFlicking(true)
    }
  }, [heartJustClicked, isJumping])

  useFrame((state, delta) => {
    try {
      if (steveRef.current) {
        const baseY = levelYPositions[level - 1] || 0
        
        // Physics simulation for both jumping and flicking
        if (isJumping || isFlicking) {
          const gravity = -12 // Gravity constant
          const newVelocityY = velocity.y + gravity * delta
          const newY = currentY + newVelocityY * delta
          
          // Update Steve's position
          steveRef.current.position.y = newY
          setCurrentY(newY)
          setVelocity({ y: newVelocityY })
          
          // Show trail when moving upward
          const shouldShowTrail = newVelocityY > 0
          setShowTrail(shouldShowTrail)
          
          // Update trail position and material - always below Steve
          if (trailRef.current && shouldShowTrail) {
            trailRef.current.position.set(0, newY - 2.5, 0) // Further below Steve
            trailRef.current.material = isFlicking ? flickMaterial : jumpMaterial
            trailRef.current.visible = true
          } else if (trailRef.current) {
            trailRef.current.visible = false
          }
          
          // Notify camera of position change
          if (onPositionChange) {
            onPositionChange(new THREE.Vector3(0, newY, 0))
          }
          
          // Handle level-up landing
          if (isJumping && newY >= targetY && newVelocityY <= 0) {
            steveRef.current.position.y = targetY
            setCurrentY(targetY)
            setIsJumping(false)
            setVelocity({ y: 0 })
            setShowTrail(false)
            onLevelUpComplete()
          }
          
          // Handle flicking - land back at base level
          if (isFlicking && newY <= baseY && newVelocityY <= 0) {
            steveRef.current.position.y = baseY
            setCurrentY(baseY)
            setIsFlicking(false)
            setVelocity({ y: 0 })
            setShowTrail(false)
          }
          
          // Safety check - if Steve goes too high, reset him
          if (newY > 20) {
            console.warn('Steve went too high, resetting position')
            steveRef.current.position.y = baseY
            setCurrentY(baseY)
            setIsJumping(false)
            setIsFlicking(false)
            setVelocity({ y: 0 })
            setShowTrail(false)
            if (isJumping) onLevelUpComplete()
          }
        } else {
          // Gentle floating motion when not in physics mode
          const floatY = baseY + Math.sin(state.clock.elapsedTime * 1.2) * 0.1
          steveRef.current.position.y = floatY
          setCurrentY(floatY)
          setShowTrail(false)
          
          // Hide trail when not in physics mode
          if (trailRef.current) {
            trailRef.current.visible = false
          }
          
          // Notify camera of position change
          if (onPositionChange) {
            onPositionChange(new THREE.Vector3(0, floatY, 0))
          }
        }
      }
    } catch (error) {
      console.warn('StevePhysics useFrame error:', error)
      // Reset to safe state
      setIsJumping(false)
      setIsFlicking(false)
      setVelocity({ y: 0 })
    }
  })

  // Initialize current Y position
  useEffect(() => {
    const baseY = levelYPositions[level - 1] || 0
    setCurrentY(baseY)
    setTargetY(baseY)
  }, [level])

  // Cleanup effect to dispose materials
  useEffect(() => {
    return () => {
      try {
        trailGeometry.dispose()
        flickMaterial.dispose()
        jumpMaterial.dispose()
      } catch (error) {
        console.warn('Material disposal error:', error)
      }
    }
  }, [])

  return (
    <>
      <group ref={steveRef}>
        {children}
      </group>
      
      {/* Persistent trail effect - visibility controlled by state */}
      <mesh 
        ref={trailRef}
        geometry={trailGeometry}
        material={flickMaterial}
        visible={showTrail}
        position={[0, currentY - 2.5, 0]}
      />
    </>
  )
}