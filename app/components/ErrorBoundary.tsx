'use client'

import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn('Three.js Error Boundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%', 
          background: 'radial-gradient(ellipse at center, #0a0a1a 0%, #000000 70%, #000000 100%)',
          color: '#00ff88',
          fontFamily: 'monospace'
        }}>
          <div>
            <div>STEVE.EXE has encountered an error</div>
            <div style={{ fontSize: '0.8em', marginTop: '10px', opacity: 0.7 }}>
              Reloading scene...
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}