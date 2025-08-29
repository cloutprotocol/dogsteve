'use client'

import { useState, useCallback, useRef } from 'react'
import Scene from './components/Scene'

export default function Home() {
  const [showContract, setShowContract] = useState(false)
  const [hearts, setHearts] = useState<Array<{ id: number, x: number, y: number }>>([])
  const [notification, setNotification] = useState('')
  const [heartClicks, setHeartClicks] = useState(0)
  const [heartJustClicked, setHeartJustClicked] = useState(false)

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

  const handleHeartClick = () => {
    setHeartJustClicked(true)
    setTimeout(() => setHeartJustClicked(false), 500)
    
    const newHearts = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 50 + 110,
      y: Math.random() * 60 + 50
    }))
    setHearts(prev => [...prev, ...newHearts])
    
    setHeartClicks(prev => {
      const newCount = prev + 1
      
      // Play sounds based on progress
      if (newCount >= 100) {
        playExplosionSound() // Epic explosion at 100
        return 0 // Reset after 100 clicks
      } else {
        playHeartSound() // Cute heart sound
        return newCount
      }
    })
    
    setTimeout(() => {
      setHearts(prev => prev.filter(heart => !newHearts.find(h => h.id === heart.id)))
    }, 2000)
  }

  const copyContract = async () => {
    const contractAddress = 'DogSteve69XxXMLGNoScopeXxX420BlazeitFaggetXxX'
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
      <div className="tamagotchi-device">
        <div className="screen-container">
          <Scene heartClicks={heartClicks} heartJustClicked={heartJustClicked} />
          <div className="ui-overlay">
            <div className="steve-text">
              STEVE
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
          <div className="button-group">
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
          
          <div className="button-group">
            <button 
              className="tamagotchi-button center-button"
              onClick={handleHeartClick}
            >
              ♥
            </button>
          </div>
          
          <div className="button-group">
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
                window.open('https://pump.fun', '_blank')
              }}
            >
              P
            </button>
          </div>
        </div>

        {/* Hearts centered over screen */}
        <div className="hearts-container">
          {hearts.map(heart => (
            <div
              key={heart.id}
              className="floating-heart"
              style={{
                left: `${heart.x}px`,
                top: `${heart.y}px`
              }}
            >
              ♥
            </div>
          ))}
        </div>


        {notification && (
          <div className="notification">
            {notification}
          </div>
        )}

        <div className="contract-always-visible">
          DogSteve69XxXMLGNoScopeXxX420BlazeitFaggetXxX
        </div>
      </div>
    </main>
  )
}