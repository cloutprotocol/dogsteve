'use client'

import { Suspense, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei'
import Nintendo64Logo from './Nintendo64Logo'

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-text">LOADING STEVE...</div>
      <div className="loading-dots">
        <span>●</span>
        <span>●</span>
        <span>●</span>
      </div>
    </div>
  )
}

export default function Scene({ heartClicks, heartJustClicked, joystickInput }: { heartClicks: number, heartJustClicked: boolean, joystickInput?: { x: number, y: number } }) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading time for the scene
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {isLoading && <LoadingScreen />}
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
        
        {/* Heart click spotlight on Steve */}
        <spotLight 
          position={[0, 2, 2]} 
          target-position={[0, 0, 0]}
          angle={0.6} 
          penumbra={0.5} 
          intensity={heartJustClicked ? 2 : 0}
          color="#ffaa00"
          castShadow
        />
        
        {/* Additional heart click effects */}
        <pointLight 
          position={[2, 1, 1]} 
          intensity={heartJustClicked ? 1.5 : 0}
          color="#ff6b6b"
          distance={5}
        />
        
        <pointLight 
          position={[-2, 1, 1]} 
          intensity={heartJustClicked ? 1.5 : 0}
          color="#ffaa00"
          distance={5}
        />
        
        <pointLight 
          position={[0, -1, 2]} 
          intensity={heartJustClicked ? 1 : 0}
          color="#00ff88"
          distance={4}
        />
        
        <Nintendo64Logo heartClicks={heartClicks} heartJustClicked={heartJustClicked} joystickInput={joystickInput} />
        <Environment preset="city" />
        
        <OrbitControls enablePan={false} enableZoom={false} />
      </Canvas>
    </div>
  )
}