"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

interface PlaygroundData {
  id: string
  name: string
  icon: string
  starred: boolean
}

interface StarredContextType {
  playgrounds: PlaygroundData[]
  updatePlaygroundStar: (playgroundId: string, starred: boolean) => void
  updatePlaygroundDetails: (playgroundId: string, updates: Partial<Omit<PlaygroundData, 'id'>>) => void
  removePlayground: (playgroundId: string) => void
  addPlayground: (playground: PlaygroundData) => void
  syncPlaygrounds: (playgrounds: PlaygroundData[]) => void
  getStarredPlaygrounds: () => PlaygroundData[]
}

const StarredContext = createContext<StarredContextType | undefined>(undefined)

export function StarredProvider({ 
  children, 
  initialPlaygroundData 
}: { 
  children: React.ReactNode
  initialPlaygroundData: PlaygroundData[]
}) {
  const [playgrounds, setPlaygrounds] = useState<PlaygroundData[]>(initialPlaygroundData)

  // Sync with external data changes
  useEffect(() => {
    setPlaygrounds(initialPlaygroundData)
  }, [initialPlaygroundData])

  const updatePlaygroundStar = useCallback((playgroundId: string, starred: boolean) => {
    setPlaygrounds(prev => 
      prev.map(playground => 
        playground.id === playgroundId 
          ? { ...playground, starred }
          : playground
      )
    )
  }, [])

  const updatePlaygroundDetails = useCallback((playgroundId: string, updates: Partial<Omit<PlaygroundData, 'id'>>) => {
    setPlaygrounds(prev => 
      prev.map(playground => 
        playground.id === playgroundId 
          ? { ...playground, ...updates }
          : playground
      )
    )
  }, [])

  const removePlayground = useCallback((playgroundId: string) => {
    setPlaygrounds(prev => prev.filter(playground => playground.id !== playgroundId))
  }, [])

  const addPlayground = useCallback((playground: PlaygroundData) => {
    setPlaygrounds(prev => [...prev, playground])
  }, [])

  const syncPlaygrounds = useCallback((playgrounds: PlaygroundData[]) => {
    setPlaygrounds(playgrounds)
  }, [])

  const getStarredPlaygrounds = useCallback(() => {
    return playgrounds.filter(playground => playground.starred)
  }, [playgrounds])

  return (
    <StarredContext.Provider value={{
      playgrounds,
      updatePlaygroundStar,
      updatePlaygroundDetails,
      removePlayground,
      addPlayground,
      syncPlaygrounds,
      getStarredPlaygrounds
    }}>
      {children}
    </StarredContext.Provider>
  )
}

export function useStarred() {
  const context = useContext(StarredContext)
  if (!context) {
    throw new Error('useStarred must be used within a StarredProvider')
  }
  return context
}