'use client'

import { useRef, useState, useCallback, useEffect } from 'react'

interface JoystickProps {
  onMove: (x: number, y: number) => void
  size?: number
  className?: string
}

export default function Joystick({ onMove, size = 80, className = '' }: JoystickProps) {
  const joystickRef = useRef<HTMLDivElement>(null)
  const knobRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleStart = useCallback((clientX: number, clientY: number) => {
    if (!joystickRef.current) return
    
    setIsDragging(true)
    const rect = joystickRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const deltaX = clientX - centerX
    const deltaY = clientY - centerY
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const maxDistance = (size - 20) / 2
    
    let x = deltaX
    let y = deltaY
    
    if (distance > maxDistance) {
      x = (deltaX / distance) * maxDistance
      y = (deltaY / distance) * maxDistance
    }
    
    setPosition({ x, y })
    
    // Normalize values to -1 to 1 range
    const normalizedX = x / maxDistance
    const normalizedY = -y / maxDistance // Invert Y for intuitive up/down
    onMove(normalizedX, normalizedY)
  }, [size, onMove])

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging || !joystickRef.current) return
    
    const rect = joystickRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const deltaX = clientX - centerX
    const deltaY = clientY - centerY
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const maxDistance = (size - 20) / 2
    
    let x = deltaX
    let y = deltaY
    
    if (distance > maxDistance) {
      x = (deltaX / distance) * maxDistance
      y = (deltaY / distance) * maxDistance
    }
    
    setPosition({ x, y })
    
    // Normalize values to -1 to 1 range
    const normalizedX = x / maxDistance
    const normalizedY = -y / maxDistance // Invert Y for intuitive up/down
    onMove(normalizedX, normalizedY)
  }, [isDragging, size, onMove])

  const handleEnd = useCallback(() => {
    setIsDragging(false)
    setPosition({ x: 0, y: 0 })
    onMove(0, 0)
  }, [onMove])

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    handleStart(e.clientX, e.clientY)
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    handleMove(e.clientX, e.clientY)
  }, [handleMove])

  const handleMouseUp = useCallback(() => {
    handleEnd()
  }, [handleEnd])

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    handleStart(touch.clientX, touch.clientY)
  }

  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    if (touch) {
      handleMove(touch.clientX, touch.clientY)
    }
  }, [handleMove])

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    e.preventDefault()
    handleEnd()
  }, [handleEnd])

  // Add global event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('touchmove', handleTouchMove, { passive: false })
      document.addEventListener('touchend', handleTouchEnd, { passive: false })
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.removeEventListener('touchmove', handleTouchMove)
        document.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd])

  return (
    <div 
      ref={joystickRef}
      className={`joystick ${className}`}
      style={{
        width: size,
        height: size,
        position: 'relative',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '50%',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        touchAction: 'none'
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div
        ref={knobRef}
        className="joystick-knob"
        style={{
          width: 20,
          height: 20,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          border: '2px solid rgba(255, 255, 255, 1)',
          borderRadius: '50%',
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
          cursor: 'inherit'
        }}
      />
    </div>
  )
}