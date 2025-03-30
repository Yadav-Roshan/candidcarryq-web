"use client"

import { useState, useEffect } from "react"
import { Calendar as CalendarIcon, Trash2, Edit, Plus, Megaphone, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { useAnnouncement } from "@/contexts/announcement-context"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { format, isAfter, isBefore, parseISO } from "date-fns"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export default function AnnouncementsPage() {
  const { 
    announcements, 
    addAnnouncement, 
    updateAnnouncement, 
    deleteAnnouncement,
  } = useAnnouncement()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // Form states
  const [text, setText] = useState("")
  const [link, setLink] = useState("")
  const [active, setActive] = useState(true)
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  
  // Reset form after close
  const resetForm = () => {
    setText("")
    setLink("")
    setActive(true)
    setStartDate(undefined)
    setEndDate(undefined)
    setEditingId(null)
  }
  
  // Close dialog and reset
  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    resetForm()
  }
  
  // Open dialog for editing
  const handleEdit = (id: string) => {
    const announcement = announcements.find(a => a.id === id)
    if (announcement) {
      setText(announcement.text)
      setLink(announcement.link || "")
      setActive(announcement.active)
      setStartDate(announcement.startDate ? parseISO(announcement.startDate) : undefined)
      setEndDate(announcement.endDate ? parseISO(announcement.endDate) : undefined)
      setEditingId(id)
      setIsDialogOpen(true)
    }
  }
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const announcementData = {
      text,
      link: link || undefined,
      active,
      startDate: startDate ? startDate.toISOString() : undefined,
      endDate: endDate ? endDate.toISOString() : undefined,
    }
    
    if (editingId) {
      updateAnnouncement(editingId, announcementData)
    } else {
      addAnnouncement(announcementData)
    }
    
    handleCloseDialog()
  }
  
  // Check if announcement is active for display
  const isAnnouncementActive = (announcement: any) => {
    if (!announcement.active) return false
    
    const now = new Date()
    
    if (announcement.startDate && isAfter(parseISO(announcement.startDate), now)) {
      return false
    }
    
    if (announcement.endDate && isBefore(parseISO(announcement.endDate), now)) {
      return false
    }
    
    return true
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Sale Announcements</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Announcement" : "Create Announcement"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 py-4">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="text">Announcement Text</Label>
                  <Textarea
                    id="text"
                    placeholder="Enter your announcement message"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    required
                    className="min-h-[80px]"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="link">Link (Optional)</Label>
                  <Input
                    id="link"
                    placeholder="https://example.com/sale"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Start Date (Optional)</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                        />
                        {startDate && (
                          <div className="p-2 border-t border-border text-center">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setStartDate(undefined)}
                            >
                              Clear
                            </Button>
                          </div>
                        )}
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="grid gap-2">
                    <Label>End Date (Optional)</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                          disabled={(date) => startDate ? isBefore(date, startDate) : false}
                        />
                        {endDate && (
                          <div className="p-2 border-t border-border text-center">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setEndDate(undefined)}
                            >
                              Clear
                            </Button>
                          </div>
                        )}
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={active}
                    onCheckedChange={setActive}
                  />
                  <Label htmlFor="active">Active</Label>
                </div>
              </div>
              <div className="flex justify-between">
                <DialogClose asChild>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit">
                  {editingId ? "Update Announcement" : "Create Announcement"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {announcements.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-medium mb-2">No announcements yet</h2>
          <p className="text-muted-foreground mb-6">
            Create announcements to showcase sales or important information to your customers.
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            Add Your First Announcement
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id} className={cn(
              "overflow-hidden",
              isAnnouncementActive(announcement) ? "border-primary/20 bg-primary/5" : ""
            )}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Megaphone className="h-4 w-4 text-primary" />
                      <div className="flex gap-2">
                        {announcement.active ? (
                          <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-300">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-muted text-muted-foreground">
                            Inactive
                          </Badge>
                        )}
                        {isAnnouncementActive(announcement) && (
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                            Currently Displaying
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-lg font-medium">{announcement.text}</p>
                    
                    {announcement.link && (
                      <a 
                        href={announcement.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {announcement.link}
                      </a>
                    )}
                    
                    <div className="mt-2 text-sm text-muted-foreground">
                      {announcement.startDate && announcement.endDate ? (
                        <span>
                          Active from {format(parseISO(announcement.startDate), "PPP")} 
                          {" to "} 
                          {format(parseISO(announcement.endDate), "PPP")}
                        </span>
                      ) : announcement.startDate ? (
                        <span>Active from {format(parseISO(announcement.startDate), "PPP")}</span>
                      ) : announcement.endDate ? (
                        <span>Active until {format(parseISO(announcement.endDate), "PPP")}</span>
                      ) : (
                        <span>No date restrictions</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(announcement.id)}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => deleteAnnouncement(announcement.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
