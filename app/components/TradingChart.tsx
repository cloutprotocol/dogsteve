'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function TradingChart({ heartClicks }: { heartClicks: number }) {
  const chartRef = useRef<THREE.Group>(null)
  
  const chartData = useMemo(() => {
    const bars: Array<{ x: number, y: number, height: number }> = []
    
    for (let i = 0; i < 20; i++) {
      const x = (i - 10) * 0.3
      const baseY = -1.5
      const height = 0.2
      
      bars.push({ x, y: baseY, height })
    }
    
    return { bars }
  }, [])

  useFrame(() => {
    if (chartRef.current) {
      chartRef.current.children.forEach((child, i) => {
        if (child instanceof THREE.Mesh && i < chartData.bars.length) {
          // Calculate how many bars should be filled based on heartClicks
          const barsToFill = Math.floor((heartClicks / 100) * 20)
          const shouldFill = i < barsToFill
          
          // Progressive height - each bar gets taller than the previous
          const progressMultiplier = shouldFill ? (i + 1) / 20 : 0
          const baseHeight = shouldFill ? 0.3 + (heartClicks / 100) * 2.5 * progressMultiplier : 0.2
          const variation = shouldFill ? Math.sin(Date.now() * 0.001 + i * 0.5) * 0.2 : 0
          const newHeight = Math.max(0.1, baseHeight + variation)
          
          child.scale.y = newHeight
          child.position.y = -1.5 + newHeight / 2
          
          // Change color based on fill state
          if (child.material instanceof THREE.MeshStandardMaterial) {
            child.material.color.setHex(shouldFill ? 0x00ff88 : 0x004422)
            child.material.opacity = shouldFill ? 0.9 : 0.3
          }
        }
      })
    }
  })

  return (
    <group ref={chartRef} position={[0, 0, -3]}>
      {chartData.bars.map((bar, i) => (
        <mesh key={i} position={[bar.x, bar.y + bar.height / 2, 0]}>
          <boxGeometry args={[0.15, bar.height, 0.1]} />
          <meshStandardMaterial
            color="#00ff88"
            metalness={0.3}
            roughness={0.4}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
      
      {/* Grid lines */}
      <mesh position={[0, -1.5, -0.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 4]} />
        <meshBasicMaterial
          color="#004422"
          transparent
          opacity={0.2}
          wireframe
        />
      </mesh>
    </group>
  )
}