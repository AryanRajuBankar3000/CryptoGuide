'use client'

import { useState } from 'react'
import { Landing } from './landing'
import { StoreProvider } from './store'
import { Platform } from './platform'

export function Experience() {
  const [entered, setEntered] = useState(false)

  if (!entered) {
    return <Landing onEnter={() => setEntered(true)} />
  }

  return (
    <StoreProvider>
      <Platform />
    </StoreProvider>
  )
}
