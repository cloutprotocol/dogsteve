'use client'

import { useState } from 'react'
import Scene from './components/Scene'

export default function Home() {
  const [showContract, setShowContract] = useState(false)
  const [hearts, setHearts] = useState<Array<{ id: number, x: number, y: number }>>([])
  const [notification, setNotification] = useState('')
  const [heartClicks, setHeartClicks] = useState(0)
  const [heartJustClicked, setHeartJustClicked] = useState(false)

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
      if (newCount >= 100) {
        return 0 // Reset after 100 clicks
      }
      return newCount
    })
    
    setTimeout(() => {
      setHearts(prev => prev.filter(heart => !newHearts.find(h => h.id === heart.id)))
    }, 2000)
  }

  const copyContract = async () => {
    const contractAddress = 'DogSteve69XxXMLGNoScopeXxX420BlazeitFaggetXxX'
    try {
      await navigator.clipboard.writeText(contractAddress)
      setNotification('CA COPIED!')
      setTimeout(() => setNotification(''), 2000)
    } catch (err) {
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
              onClick={() => window.open('https://x.com/schitzoe', '_blank')}
            >
              E
            </button>
            <button 
              className="tamagotchi-button"
              onClick={copyContract}
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
              onClick={() => window.open('https://x.com/dogstevecoin', '_blank')}
            >
              X
            </button>
            <button 
              className="tamagotchi-button"
              onClick={() => window.open('https://pump.fun', '_blank')}
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