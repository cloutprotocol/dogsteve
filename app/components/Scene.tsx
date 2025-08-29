'use client'

import { Suspense, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'
import Nintendo64Logo from './Nintendo64Logo'
import PlanetarySystem from './PlanetarySystem'
import StevePhysics from './StevePhysics'
import Hearts3D from './Hearts3D'
import CameraController from './CameraController'
import { ErrorBoundary } from './ErrorBoundary'

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

function NotificationOverlay({ message }: { message: string }) {
  return (
    <div className="notification-overlay">
      <div className="notification-text">{message}</div>
    </div>
  )
}

export default function Scene({ heartClicks, heartJustClicked, joystickInput, notification, level, isLevelingUp, hearts }: { heartClicks: number, heartJustClicked: boolean, joystickInput?: { x: number, y: number }, notification?: string, level: number, isLevelingUp: boolean, hearts?: Array<{ id: number, x: number, y: number }> }) {
  const [isLoading, setIsLoading] = useState(true)
  const [levelUpInProgress, setLevelUpInProgress] = useState(false)
  const [stevePosition, setStevePosition] = useState(new THREE.Vector3(0, 0, 0))

  useEffect(() => {
    // Simulate loading time for the scene
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (isLevelingUp) {
      setLevelUpInProgress(true)
    }
  }, [isLevelingUp])

  const handleLevelUpComplete = () => {
    setLevelUpInProgress(false)
  }

  const handleStevePositionChange = (position: THREE.Vector3) => {
    try {
      if (position && typeof position.y === 'number' && !isNaN(position.y)) {
        setStevePosition(position.clone())
      }
    } catch (error) {
      console.warn('Position update error:', error)
    }
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {isLoading && <LoadingScreen />}
      {notification && <NotificationOverlay message={notification} />}
      <ErrorBoundary>
        <Canvas
          camera={{ 
            position: [0, 0, 4], // Initial camera position - will be controlled by CameraController
            fov: 50 
          }}
          gl={{ antialias: true }}
          style={{ background: 'radial-gradient(ellipse at center, #0a0a1a 0%, #000000 70%, #000000 100%)' }}
        >
        {/* Dynamic lighting based on current planet */}
        <ambientLight intensity={0.1 + level * 0.01} />
        <directionalLight position={[10, 10, 5]} intensity={0.6} color="#ffffff" />
        
        {/* Single atmospheric light that changes based on level */}
        <pointLight 
          position={[0, 5, 2]} 
          color={
            level === 1 ? "#4A90E2" :  // Earth - blue
            level === 2 ? "#CD5C5C" :  // Mars - red
            level === 3 ? "#D2691E" :  // Jupiter - orange
            level === 4 ? "#FAD5A5" :  // Saturn - gold
            level === 5 ? "#4FD0E7" :  // Uranus - cyan
            level === 6 ? "#4169E1" :  // Neptune - blue
            "#A0522D"  // Pluto - brown (level 7+)
          }
          intensity={
            level === 1 ? 0.5 :
            level === 2 ? 0.4 :
            level === 3 ? 0.6 :
            level === 4 ? 0.5 :
            level === 5 ? 0.4 :
            level === 6 ? 0.4 :
            0.3
          }
        />
        
        {/* Distant space ambience */}
        <pointLight position={[-20, 10, -20]} color="#ffffff" intensity={0.1} />
        <pointLight position={[20, -10, -30]} color="#ffdddd" intensity={0.05} />
        
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
        
        {/* Planetary background system */}
        <PlanetarySystem 
          level={level} 
          isLevelingUp={levelUpInProgress} 
          stevePosition={new THREE.Vector3(0, 0, 0)} 
        />
        
        {/* Camera controller that follows Steve */}
        <CameraController stevePosition={stevePosition} level={level} />
        
        {/* Steve with physics */}
        <StevePhysics 
          level={level} 
          isLevelingUp={levelUpInProgress}
          onLevelUpComplete={handleLevelUpComplete}
          heartJustClicked={heartJustClicked}
          onPositionChange={handleStevePositionChange}
        >
          <Nintendo64Logo heartClicks={heartClicks} heartJustClicked={heartJustClicked} joystickInput={joystickInput} isLevelingUp={levelUpInProgress} />
        </StevePhysics>
        
        {/* 3D Hearts */}
        {hearts && <Hearts3D hearts={hearts} />}
        
        <Environment preset="night" />
        </Canvas>
      </ErrorBoundary>
    </div>
  )
}