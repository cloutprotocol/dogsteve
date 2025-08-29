'use client'

import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface CameraControllerProps {
  stevePosition: THREE.Vector3
  level: number
}

export default function CameraController({ stevePosition, level }: CameraControllerProps) {
  const { camera } = useThree()
  const targetPosition = useRef(new THREE.Vector3(0, 0, 4))
  const lookAtTarget = useRef(new THREE.Vector3(0, 0, 0))
  
  useFrame((state, delta) => {
    try {
      // Only update if we have a valid position
      if (stevePosition && typeof stevePosition.y === 'number') {
        // Calculate target camera position based on Steve's position
        const targetY = Math.max(0, stevePosition.y + 0.5) // Slightly above Steve, never below 0
        const targetZ = Math.max(3, 4 + stevePosition.y * 0.1) // Pull back camera as Steve goes higher, minimum distance
        
        targetPosition.current.set(0, targetY, targetZ)
        lookAtTarget.current.set(stevePosition.x, stevePosition.y, stevePosition.z)
        
        // Smooth camera movement with bounds checking
        if (camera.position && targetPosition.current) {
          camera.position.lerp(targetPosition.current, Math.min(delta * 2, 0.1)) // Slower, more stable following
        }
        
        // Always look at Steve with bounds checking
        if (lookAtTarget.current && typeof lookAtTarget.current.y === 'number') {
          camera.lookAt(lookAtTarget.current)
        }
      }
    } catch (error) {
      console.warn('CameraController error:', error)
      // Reset to safe position on error
      camera.position.set(0, 0, 4)
      camera.lookAt(0, 0, 0)
    }
  })
  
  return null // This component doesn't render anything
}