'use client'

import Scene from './components/Scene'

export default function Home() {
  return (
    <main style={{ width: '100vw', height: '100vh' }}>
      <div className="tamagotchi-device">
        <div className="screen-container">
          <Scene />
          <div className="ui-overlay">
            <div className="contract-info">
              Contract: 0x1234...5678
            </div>
            <div className="steve-text">
              STEVE
            </div>
            <div className="social-links">
              <a href="#" className="social-link">TW</a>
              <a href="#" className="social-link">TG</a>
              <a href="#" className="social-link">DC</a>
            </div>
          </div>
        </div>

        <div className="buttons-container">
          <div className="button-group">
            <button className="tamagotchi-button">A</button>
            <button className="tamagotchi-button">B</button>
          </div>
          
          <div className="button-group">
            <button className="tamagotchi-button center-button">♥</button>
          </div>
          
          <div className="button-group">
            <button className="tamagotchi-button">C</button>
            <button className="tamagotchi-button">D</button>
          </div>
        </div>
      </div>
    </main>
  )
}