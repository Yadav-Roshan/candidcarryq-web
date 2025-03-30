"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Megaphone, Plus, Trash, Edit, Eye, EyeOff } from "lucide-react"
import { useAnnouncement } from "@/contexts/announcement-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

export default function AnnouncementsPage() {
  const { 
    announcements, 
    addAnnouncement, 
    updateAnnouncement, 
    deleteAnnouncement 
  } = useAnnouncement()
  
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentAnnouncement, setCurrentAnnouncement] = useState<any>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    text: "",
    link: "",
    active: true,
    startDate: "",
    endDate: "",
  })
  
  const resetForm = () => {
    setFormData({
      text: "",
      link: "",
      active: true,
      startDate: "",
      endDate: "",
    })
    setCurrentAnnouncement(null)
  }
  
  const handleEdit = (announcement: any) => {
    setCurrentAnnouncement(announcement)
    setFormData({
      text: announcement.text || "",
      link: announcement.link || "",
      active: announcement.active || false,
      startDate: announcement.startDate || "",
      endDate: announcement.endDate || "",
    })
    setIsDialogOpen(true)
  }
  
  const handleDelete = (id: string) => {
    deleteAnnouncement(id)
    toast({
      title: "Announcement deleted",
      description: "The announcement has been removed",
    })
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.text.trim()) {
      toast({
        title: "Error",
        description: "Announcement text is required",
        variant: "destructive",
      })
      return
    }
    
    if (currentAnnouncement) {
      // Update existing announcement
      updateAnnouncement(currentAnnouncement.id, formData)
      toast({
        title: "Announcement updated",
        description: "Your changes have been saved",
      })
    } else {
      // Add new announcement
      addAnnouncement(formData)
      toast({
        title: "Announcement created",
        description: "New announcement has been added",
      })
    }
    
    setIsDialogOpen(false)
    resetForm()
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Announcements</h1>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {currentAnnouncement ? "Edit Announcement" : "Create Announcement"}
              </DialogTitle>
              <DialogDescription>
                Announcements appear at the top of your site for all visitors.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid gap-2">
                <Label htmlFor="text">Announcement Text</Label>
                <Textarea 
                  id="text"
                  value={formData.text}
                  onChange={(e) => setFormData({...formData, text: e.target.value})}
                  placeholder="Enter announcement text"
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="link">Link (optional)</Label>
                <Input 
                  id="link"
                  value={formData.link}
                  onChange={(e) => setFormData({...formData, link: e.target.value})}
                  placeholder="https://example.com/sale"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startDate">Start Date (optional)</Label>
                  <Input 
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endDate">End Date (optional)</Label>
                  <Input 
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="active" 
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({...formData, active: checked})}
                />
                <Label htmlFor="active">Active</Label>
              </div>
              
              <DialogFooter>
                <Button type="submit">
                  {currentAnnouncement ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Announcements list */}
      {announcements.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No announcements yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first announcement to display at the top of your site.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              Create Announcement
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Announcement</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date Range</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {announcements.map((announcement) => (
                <TableRow key={announcement.id}>
                  <TableCell className="font-medium">{announcement.text}</TableCell>
                  <TableCell>
                    {announcement.active ? (
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-green-500" />
                        <span>Active</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Inactive</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {announcement.startDate || announcement.endDate ? (
                      <span className="text-sm">
                        {announcement.startDate ? 
                          format(new Date(announcement.startDate), "MMM d, yyyy") : 
                          "No start date"
                        }
                        {" to "}
                        {announcement.endDate ? 
                          format(new Date(announcement.endDate), "MMM d, yyyy") : 
                          "No end date"
                        }
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">No date restrictions</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEdit(announcement)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost" 
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleDelete(announcement.id)}
                      >
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
