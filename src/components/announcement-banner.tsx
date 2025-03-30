"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { X } from "lucide-react"
import { useAnnouncement } from "@/contexts/announcement-context"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

export function AnnouncementBanner() {
  const { currentAnnouncement, isAnnouncementVisible, setAnnouncementVisible } = useAnnouncement()
  const [isDismissed, setIsDismissed] = useState(false)
  
  // Clear dismissal when announcement changes
  useEffect(() => {
    if (currentAnnouncement) {
      setIsDismissed(false)
    }
  }, [currentAnnouncement?.id])
  
  // Check if banner should be displayed
  if (!currentAnnouncement || !isAnnouncementVisible || isDismissed) {
    return null
  }

  // Handle dismissal
  const handleDismiss = () => {
    setIsDismissed(true)
  }

  const bannerContent = (
    <div className="py-2 px-4 text-sm flex items-center justify-center text-center gap-x-4 relative bg-primary text-primary-foreground">
      <div className="flex-1 flex justify-center">
        {currentAnnouncement.link ? (
          <Link href={currentAnnouncement.link} className="hover:underline font-medium inline-block">
            {currentAnnouncement.text}
          </Link>
        ) : (
          <span className="font-medium">{currentAnnouncement.text}</span>
        )}
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-6 w-6 absolute right-2 rounded-full"
        onClick={handleDismiss}
      >
        <X className="h-3 w-3" />
        <span className="sr-only">Dismiss</span>
      </Button>
    </div>
  )
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
      >
        {bannerContent}
      </motion.div>
    </AnimatePresence>
  )
}
