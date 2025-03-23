"use client"

import { createContext, useContext, useState, useEffect } from "react"

interface Announcement {
  id: string;
  text: string;
  link?: string;
  active: boolean;
  startDate?: string;
  endDate?: string;
}

interface AnnouncementContextType {
  announcements: Announcement[];
  currentAnnouncement: Announcement | null;
  addAnnouncement: (announcement: Omit<Announcement, "id">) => void;
  updateAnnouncement: (id: string, announcement: Partial<Announcement>) => void;
  deleteAnnouncement: (id: string) => void;
  isAnnouncementVisible: boolean;
  setAnnouncementVisible: (visible: boolean) => void;
}

const AnnouncementContext = createContext<AnnouncementContextType | undefined>(undefined)

export function AnnouncementProvider({ children }: { children: React.ReactNode }) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isAnnouncementVisible, setAnnouncementVisible] = useState(true)
  
  // Load announcements from localStorage on mount
  useEffect(() => {
    const storedAnnouncements = localStorage.getItem("announcements")
    if (storedAnnouncements) {
      try {
        setAnnouncements(JSON.parse(storedAnnouncements))
      } catch (err) {
        console.error("Failed to parse announcements from localStorage", err)
      }
    }
  }, [])

  // Save announcements to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("announcements", JSON.stringify(announcements))
  }, [announcements])

  const addAnnouncement = (announcement: Omit<Announcement, "id">) => {
    const newAnnouncement = {
      ...announcement,
      id: Date.now().toString(),
    }
    
    setAnnouncements(prev => [...prev, newAnnouncement])
  }

  const updateAnnouncement = (id: string, data: Partial<Announcement>) => {
    setAnnouncements(prev => 
      prev.map(announcement => 
        announcement.id === id ? { ...announcement, ...data } : announcement
      )
    )
  }

  const deleteAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(announcement => announcement.id !== id))
  }

  // Get the current announcement to display
  const currentAnnouncement = announcements.find(announcement => {
    // Check if the announcement is active
    if (!announcement.active) return false;
    
    const now = new Date()
    
    // Check start date if exists
    if (announcement.startDate) {
      const startDate = new Date(announcement.startDate)
      if (now < startDate) return false
    }
    
    // Check end date if exists
    if (announcement.endDate) {
      const endDate = new Date(announcement.endDate)
      if (now > endDate) return false
    }
    
    return true
  }) || null

  return (
    <AnnouncementContext.Provider 
      value={{
        announcements,
        currentAnnouncement,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        isAnnouncementVisible,
        setAnnouncementVisible
      }}
    >
      {children}
    </AnnouncementContext.Provider>
  )
}

export const useAnnouncement = () => {
  const context = useContext(AnnouncementContext)
  if (context === undefined) {
    throw new Error("useAnnouncement must be used within an AnnouncementProvider")
  }
  return context
}
