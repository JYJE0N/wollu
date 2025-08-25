'use client'

import { ReactNode } from 'react'
import { Footer } from './Footer'
import { StealthManager } from '../stealth/StealthManager'
import { GlobalHeader } from './GlobalHeader'

interface LayoutProps {
  children: ReactNode
  className?: string
}

export function Layout({ children, className = '' }: LayoutProps) {
  return (
    <div className={`app-layout ${className}`}>
      <StealthManager>
        <GlobalHeader />
        <main className="app-main">
          {children}
        </main>
        <Footer />
      </StealthManager>
    </div>
  )
}