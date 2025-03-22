"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { X } from "lucide-react"
import { useAnnouncement } from "@/contexts/announcement-context"
import { Button } from "@/components/ui/button"

export function AnnouncementBanner() {
  const { currentAnnouncement, isAnnouncementVisible, setAnnouncementVisible } = useAnnouncement()
  const [mounted, setMounted] = useState(false)
  
  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) return null
  
  // If no announcement or announcement is hidden, don't render
  if (!currentAnnouncement || !isAnnouncementVisible) return null
  
  return (
    <div className="bg-primary text-primary-foreground py-2 px-4 relative text-center text-sm">
      <div className="container flex items-center justify-center">
        {currentAnnouncement.link ? (
          <Link 
            href={currentAnnouncement.link}
            className="hover:underline"
          >
            {currentAnnouncement.text}
          </Link>
        ) : (
          <span>{currentAnnouncement.text}</span>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 text-primary-foreground"
          onClick={() => setAnnouncementVisible(false)}
        >
          <X className="h-3 w-3" />
          <span className="sr-only">Dismiss</span>
        </Button>
      </div>
    </div>
  )
}
