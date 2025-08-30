'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Scene from './components/Scene'
import Joystick from './components/Joystick'
import PsychedelicBackground from './components/PsychedelicBackground'

export default function Home() {

  const [hearts, setHearts] = useState<Array<{ id: number, x: number, y: number }>>([])
  const [notification, setNotification] = useState('')
  const [heartClicks, setHeartClicks] = useState(0)
  const [heartJustClicked, setHeartJustClicked] = useState(false)
  const [level, setLevel] = useState(1) // Start at level 1 (Earth)
  const [totalHeartClicks, setTotalHeartClicks] = useState(0)
  const [joystickInput, setJoystickInput] = useState({ x: 0, y: 0 })
  const [isLevelingUp, setIsLevelingUp] = useState(false)

  // Update level based on total clicks
  useEffect(() => {
    const newLevel = Math.max(1, Math.floor(totalHeartClicks / 100) + 1) // Start at level 1
    if (newLevel !== level && newLevel > level) {
      setIsLevelingUp(true)
      setLevel(newLevel)
      // Show level up notification
      setNotification(`LEVEL ${newLevel}!`)
      setTimeout(() => {
        setNotification('')
        setIsLevelingUp(false)
      }, 3000) // Longer duration for physics animation
    }
  }, [totalHeartClicks, level])

  // Single persistent AudioContext
  const audioContextRef = useRef<AudioContext | null>(null)
  
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    
    // Resume context if suspended (browser autoplay policy)
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume()
    }
    
    return audioContextRef.current
  }, [])

  // Audio synthesis functions
  const playTone = useCallback((frequency: number, duration: number = 0.1, type: OscillatorType = 'sine') => {
    try {
      const audioContext = getAudioContext()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
      oscillator.type = type
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + duration)
    } catch (error) {
      console.log('Audio playback failed:', error)
    }
  }, [getAudioContext])

  const playHeartSound = useCallback(() => {
    // Cute heart sound - rising tone
    playTone(440, 0.1, 'sine')
    setTimeout(() => playTone(660, 0.1, 'sine'), 50)
  }, [playTone])

  const playButtonSound = useCallback(() => {
    // Classic button beep
    playTone(800, 0.05, 'square')
  }, [playTone])

  const playCopySound = useCallback(() => {
    // Success sound - three ascending tones
    playTone(523, 0.1, 'triangle') // C
    setTimeout(() => playTone(659, 0.1, 'triangle'), 100) // E
    setTimeout(() => playTone(784, 0.15, 'triangle'), 200) // G
  }, [playTone])

  const playExplosionSound = useCallback(() => {
    // Epic explosion sound when reaching 100
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        playTone(200 + Math.random() * 400, 0.3, 'sawtooth')
      }, i * 50)
    }
  }, [playTone])

  const handleHeartClick = useCallback(() => {
    setHeartJustClicked(true)
    setTimeout(() => setHeartJustClicked(false), 500)
    
    // Generate minimal hearts for better performance
    const heartCount = 2 // Only 2 hearts per click
    const timestamp = Date.now()
    const newHearts = Array.from({ length: heartCount }, (_, i) => ({
      id: timestamp + i,
      x: Math.random() * 60 + 20, // 20% to 80% of container width
      y: Math.random() * 60 + 20  // 20% to 80% of container height
    }))
    
    setHearts(prev => {
      // Strict limit on total hearts
      const maxHearts = 6 // Maximum 6 hearts total
      const combined = [...prev, ...newHearts]
      return combined.length > maxHearts ? combined.slice(-maxHearts) : combined
    })
    
    // Increment total clicks (never resets)
    setTotalHeartClicks(prev => prev + 1)
    
    setHeartClicks(prev => {
      const newCount = prev + 1
      
      // Check if we should level up
      if (newCount >= 100) {
        playExplosionSound() // Epic explosion at 100
        return 0 // Reset after 100 clicks
      } else {
        playHeartSound() // Cute heart sound
        return newCount
      }
    })
    
    // Auto-cleanup hearts after 2 seconds
    setTimeout(() => {
      setHearts(prev => prev.filter(heart => !newHearts.find(h => h.id === heart.id)))
    }, 2000)
  }, [playExplosionSound, playHeartSound])

  const copyContract = async () => {
    const contractAddress = '7cbVgS8jo14buppUqBcyVeVtqwC52S9LqDCRhRkJPwpD'
    try {
      await navigator.clipboard.writeText(contractAddress)
      playCopySound() // Success sound
      setNotification('CA COPIED!')
      setTimeout(() => setNotification(''), 2000)
    } catch (err) {
      playTone(200, 0.3, 'sawtooth') // Error sound
      setNotification('COPY FAIL!')
      setTimeout(() => setNotification(''), 2000)
    }
  }

  return (
    <main style={{ width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <PsychedelicBackground />
      <div className="tamagotchi-device">
        <div className="screen-container">
          <Scene 
            heartClicks={heartClicks} 
            heartJustClicked={heartJustClicked} 
            joystickInput={joystickInput} 
            notification={notification}
            level={level}
            isLevelingUp={isLevelingUp}
            hearts={hearts}
          />
          <div className="ui-overlay">
            <div className="steve-text">
              {level > 0 ? `LVL ${level} STEVE` : 'STEVE'}
            </div>
            <div className="heart-bar">
              <div className="heart-bar-label">♥</div>
              <div className="heart-bar-container">
                <div 
                  className="heart-bar-fill" 
                  style={{ width: `${heartClicks}%` }}
                ></div>
              </div>
              <div className="heart-counter">{heartClicks}/100</div>
            </div>
          </div>
        </div>

        <div className="buttons-container">
          {/* Top left buttons */}
          <div className="button-group left-buttons">
            <button 
              className="tamagotchi-button"
              onClick={() => {
                playButtonSound()
                window.open('https://x.com/schitzoe', '_blank')
              }}
            >
              E
            </button>
            <button 
              className="tamagotchi-button"
              onClick={() => {
                playButtonSound()
                copyContract()
              }}
            >
              C
            </button>
          </div>
          
          {/* Center joystick */}
          <div className="joystick-container" style={{ gridColumn: '2', gridRow: '1' }}>
            <Joystick 
              onMove={(x, y) => setJoystickInput({ x, y })}
              size={110}
            />
          </div>
          
          {/* Top right buttons */}
          <div className="button-group right-buttons">
            <button 
              className="tamagotchi-button"
              onClick={() => {
                playButtonSound()
                window.open('https://x.com/dogstevecoin', '_blank')
              }}
            >
              X
            </button>
            <button 
              className="tamagotchi-button"
              onClick={() => {
                playButtonSound()
                window.open('https://pump.fun/coin/7cbVgS8jo14buppUqBcyVeVtqwC52S9LqDCRhRkJPwpD', '_blank')
              }}
            >
              P
            </button>
          </div>
          
          {/* Bottom center heart button */}
          <button 
            className="tamagotchi-button center-button"
            onClick={handleHeartClick}
            style={{ gridColumn: '2', gridRow: '3' }}
          >
            ♥
          </button>
        </div>

        {/* Hearts are now rendered in 3D scene */}



        <div className="contract-always-visible">
          7cbVgS8jo14buppUqBcyVeVtqwC52S9LqDCRhRkJPwpD
        </div>

        {/* Gameboy bottom section for mobile */}
        <div className="gameboy-bottom">
          <div className="gameboy-speaker">7cbVgS8jo14buppUqBcyVeVtqwC52S9LqDCRhRkJPwpD</div>
        </div>
      </div>
    </main>
  )
}