'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface Heart3DProps {
  hearts: Array<{ id: number, x: number, y: number }>
}

// Create a simple heart texture using canvas
function createHeartTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  
  if (ctx) {
    // Clear canvas
    ctx.clearRect(0, 0, 64, 64)
    
    // Draw heart shape
    ctx.fillStyle = '#ff6b6b'
    ctx.font = '48px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('♥', 32, 32)
  }
  
  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

export default function Hearts3D({ hearts }: Heart3DProps) {
  const heartsGroupRef = useRef<THREE.Group>(null)
  
  // Use simple plane geometry with heart texture
  const heartGeometry = useMemo(() => new THREE.PlaneGeometry(0.6, 0.6), [])
  const heartTexture = useMemo(() => createHeartTexture(), [])
  
  useFrame((state) => {
    if (!heartsGroupRef.current) return
    
    try {
      // Remove expired hearts first
      const currentTime = Date.now()
      const childrenToRemove: THREE.Object3D[] = []
      
      heartsGroupRef.current.children.forEach((heartMesh, index) => {
        if (heartMesh instanceof THREE.Mesh) {
          // Calculate age of this heart
          const birthTime = heartMesh.userData.birthTime || currentTime
          const age = (currentTime - birthTime) / 2000 // 2 second lifetime
          
          if (age >= 1) {
            // Mark for removal
            childrenToRemove.push(heartMesh)
          } else {
            // Animate the heart
            // Floating animation - move upward over time
            const startY = heartMesh.userData.startY || 0
            heartMesh.position.y = startY + age * 2 // Float upward
            
            // Gentle side-to-side drift
            const startX = heartMesh.userData.startX || 0
            heartMesh.position.x = startX + Math.sin(state.clock.elapsedTime * 2 + index) * 0.1
            
            // Pulsing scale
            const pulse = 1 + Math.sin(state.clock.elapsedTime * 4 + index) * 0.1
            heartMesh.scale.setScalar(pulse * 0.6)
            
            // Fade out over time
            if (heartMesh.material instanceof THREE.MeshBasicMaterial) {
              heartMesh.material.opacity = Math.max(0, 1 - age)
            }
            
            // Billboard effect - always face camera
            heartMesh.lookAt(state.camera.position)
          }
        }
      })
      
      // Remove expired hearts
      childrenToRemove.forEach(child => {
        heartsGroupRef.current?.remove(child)
        if (child instanceof THREE.Mesh && child.material instanceof THREE.Material) {
          child.material.dispose()
        }
      })
      
    } catch (error) {
      console.warn('Hearts3D animation error:', error)
    }
  })

  return (
    <group ref={heartsGroupRef}>
      {hearts.slice(0, 6).map((heart) => { // Limit to 6 hearts max
        // Convert screen percentage to 3D world coordinates
        const worldX = (heart.x - 50) * 0.04 // Convert 0-100% to world coords
        const worldY = (50 - heart.y) * 0.03 // Invert Y and convert
        const worldZ = Math.random() * 0.5 // Random depth but closer to camera
        
        // Create individual material for each heart with texture
        const material = new THREE.MeshBasicMaterial({
          map: heartTexture,
          transparent: true,
          opacity: 1,
          side: THREE.DoubleSide,
          alphaTest: 0.1
        })
        
        return (
          <mesh
            key={heart.id}
            geometry={heartGeometry}
            material={material}
            position={[worldX, worldY, worldZ]}
            userData={{ 
              birthTime: Date.now(),
              startX: worldX,
              startY: worldY
            }}
          />
        )
      })}
    </group>
  )
}