"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface Announcement {
  id: string
  text: string
  link?: string
  active: boolean
  startDate?: string
  endDate?: string
}

interface AnnouncementContextType {
  announcements: Announcement[]
  currentAnnouncement: Announcement | null
  isAnnouncementVisible: boolean
  setAnnouncementVisible: (visible: boolean) => void
  addAnnouncement: (announcement: Omit<Announcement, 'id'>) => void
  updateAnnouncement: (id: string, data: Partial<Omit<Announcement, 'id'>>) => void
  deleteAnnouncement: (id: string) => void
}

const AnnouncementContext = createContext<AnnouncementContextType | undefined>(undefined)

export function AnnouncementProvider({ children }: { children: ReactNode }) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: "1",
      text: "Summer Sale! Get 20% off on all products",
      link: "/products",
      active: true,
      startDate: "2023-08-01",
      endDate: "2023-09-30"
    }
  ])
  
  const [isAnnouncementVisible, setIsAnnouncementVisible] = useState(true)
  const [currentAnnouncementId, setCurrentAnnouncementId] = useState<string | null>("1")
  
  // Get the current announcement to display
  const currentAnnouncement = currentAnnouncementId 
    ? announcements.find(a => a.id === currentAnnouncementId) || null
    : null
  
  // Add a new announcement
  const addAnnouncement = (announcement: Omit<Announcement, 'id'>) => {
    const newId = Date.now().toString()
    const newAnnouncement = { ...announcement, id: newId }
    
    setAnnouncements(prev => [...prev, newAnnouncement])
    
    // If this is the first active announcement, set it as current
    if (announcement.active && currentAnnouncementId === null) {
      setCurrentAnnouncementId(newId)
      setIsAnnouncementVisible(true)
    }
  }
  
  // Update an existing announcement
  const updateAnnouncement = (id: string, data: Partial<Omit<Announcement, 'id'>>) => {
    setAnnouncements(prev => 
      prev.map(announcement => 
        announcement.id === id 
          ? { ...announcement, ...data } 
          : announcement
      )
    )
    
    // If updating current announcement's active status to false, find new current
    if (id === currentAnnouncementId && data.active === false) {
      const nextAnnouncement = announcements
        .find(a => a.id !== id && a.active === true)
      
      if (nextAnnouncement) {
        setCurrentAnnouncementId(nextAnnouncement.id)
      } else {
        setCurrentAnnouncementId(null)
        setIsAnnouncementVisible(false)
      }
    }
  }
  
  // Delete an announcement
  const deleteAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id))
    
    // If deleting current announcement, find new current
    if (id === currentAnnouncementId) {
      const nextAnnouncement = announcements
        .find(a => a.id !== id && a.active === true)
      
      if (nextAnnouncement) {
        setCurrentAnnouncementId(nextAnnouncement.id)
      } else {
        setCurrentAnnouncementId(null)
        setIsAnnouncementVisible(false)
      }
    }
  }
  
  return (
    <AnnouncementContext.Provider 
      value={{
        announcements,
        currentAnnouncement,
        isAnnouncementVisible,
        setAnnouncementVisible: setIsAnnouncementVisible,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement
      }}
    >
      {children}
    </AnnouncementContext.Provider>
  )
}

export const useAnnouncement = () => {
  const context = useContext(AnnouncementContext)
  if (context === undefined) {
    throw new Error('useAnnouncement must be used within an AnnouncementProvider')
  }
  return context
}
