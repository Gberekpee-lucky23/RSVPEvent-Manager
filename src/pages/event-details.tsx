"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, MapPin, Users, Mail, Check, X, Loader2, Trash2, Copy } from "lucide-react"
import { useAuth } from "../contexts/auth-context"
import { supabase, type Event, type RSVP } from "../lib/supabase"
import { formatDate } from "../lib/utils"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function EventDetails() {
  const { eventId } = useParams<{ eventId: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [event, setEvent] = useState<Event | null>(null)
  const [rsvps, setRsvps] = useState<RSVP[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!eventId || !user) return

      try {
        // Fetch event details
        const { data: eventData, error: eventError } = await supabase
          .from("events")
          .select("*")
          .eq("id", eventId)
          .eq("user_id", user.id)
          .single()

        if (eventError) {
          console.error("Error fetching event:", eventError)
          navigate("/dashboard")
          return
        }

        setEvent(eventData as Event)

        // Fetch RSVPs
        const { data: rsvpData, error: rsvpError } = await supabase
          .from("rsvps")
          .select("*")
          .eq("event_id", eventId)
          .order("created_at", { ascending: false })

        if (rsvpError) {
          console.error("Error fetching RSVPs:", rsvpError)
        } else {
          setRsvps(rsvpData as RSVP[])
        }
      } catch (error) {
        console.error("Error fetching event details:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEventDetails()
  }, [eventId, user, navigate])

  const handleCopyRsvpLink = () => {
    const rsvpLink = `${window.location.origin}/rsvp/${eventId}`
    navigator.clipboard.writeText(rsvpLink)
    toast({
  title: "Login failed",
  description: "Wrong credentials",
  variant: "destructive"
})
  }

  const handleDeleteEvent = async () => {
    if (!eventId) return

    setDeleting(true)

    try {
      // Delete RSVPs first
      await supabase.from("rsvps").delete().eq("event_id", eventId)

      // Then delete the event
      const { error } = await supabase.from("events").delete().eq("id", eventId)

      if (error) {
        toast({
          title: "Error",
          description: "Failed to delete event. Please try again.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Event deleted",
          description: "Your event has been deleted successfully.",
        })
        navigate("/dashboard")
      }
    } catch (error) {
      console.error("Error deleting event:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  const sendReminders = async () => {
    if (!eventId) return

    toast({
      title: "Reminders sent",
      description: "Event reminders have been sent to all attendees.",
    })
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#5e60ce]" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center">
        <h2 className="text-xl font-semibold">Event not found</h2>
        <Button asChild className="mt-4">
          <a href="/dashboard">Back to Dashboard</a>
        </Button>
      </div>
    )
  }

  const acceptedRsvps = rsvps.filter((rsvp) => rsvp.status === "accepted")
  const declinedRsvps = rsvps.filter((rsvp) => rsvp.status === "declined")

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <h1 className="text-2xl tracking-tight text-[#232e91] w-full py-5">{event.title}</h1>
        <div className="flex gap-2">
          <Button className="bg-gray-300 text-[#232e91]" onClick={handleCopyRsvpLink}>
            <Copy className="mr-2 h-4 w-4" />
            Copy RSVP Link
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="bg-red-400 text-white">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Event
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-white">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-[#5e69ce]">Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your event and all associated RSVPs.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-0 bg-gray-300">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteEvent} disabled={deleting} className="bg-red-400 text-white">
                  {deleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 border-0">
        <Card className="border-o  border-0">
          <CardHeader>
            <CardTitle className="text-[#232e91]">Event Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-muted-foreground" />
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center">
              <Clock className="mr-2 h-5 w-5 text-muted-foreground" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="mr-2 h-5 w-5 text-muted-foreground" />
              <span>{event.location}</span>
            </div>
            {event.max_attendees && (
              <div className="flex items-center">
                <Users className="mr-2 h-5 w-5 text-muted-foreground" />
                <span>Max attendees: {event.max_attendees}</span>
              </div>
            )}
            <div className="pt-2">
              <h3 className="mb-2 font-medium text-[#232e91]">Description</h3>
              <p className="text-muted-foreground">{event.description}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#5e69ce] text-white">
          <CardHeader>
            <CardTitle>RSVP Summary</CardTitle>
            <CardDescription>{rsvps.length} total responses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border p-3 text-center ">
                <div className="text-2xl font-bold text-green-500">{acceptedRsvps.length}</div>
                <div className="text-sm text-muted-foreground">Accepted</div>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <div className="text-2xl font-bold text-red-500">{declinedRsvps.length}</div>
                <div className="text-sm text-muted-foreground">Declined</div>
              </div>
            </div>
            {event.max_attendees && (
              <div className="rounded-lg border p-3 text-center">
                <div className="text-2xl font-bold">
                  {acceptedRsvps.length}/{event.max_attendees}
                </div>
                <div className="text-sm text-muted-foreground">Spots filled</div>
              </div>
            )}
            <Button className="w-full bg-[#80ffdb] text-[#232e91] cursor-pointer" onClick={sendReminders}>
              <Mail className="mr-2 h-4 w-4 " />
              Send Reminders
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-[#5e69ce]">
        <CardHeader>
          <CardTitle className="text-[#232e91]">RSVP Responses</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="text-gray-800">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All ({rsvps.length})</TabsTrigger>
              <TabsTrigger value="accepted">Accepted ({acceptedRsvps.length})</TabsTrigger>
              <TabsTrigger value="declined">Declined ({declinedRsvps.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <RsvpList rsvps={rsvps} />
            </TabsContent>
            <TabsContent value="accepted">
              <RsvpList rsvps={acceptedRsvps} />
            </TabsContent>
            <TabsContent value="declined">
              <RsvpList rsvps={declinedRsvps} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

function RsvpList({ rsvps }: { rsvps: RSVP[] }) {
  if (rsvps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center text-[#5e69ce]">
        <Users className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">No responses yet</h3>
        <p className="text-sm text-muted-foreground">Share your event link to get responses</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {rsvps.map((rsvp) => (
        <div key={rsvp.id} className="flex items-start justify-between rounded-lg border-0 shadow p-4">
          <div>
            <div className="flex items-center">
              <h3 className="font-medium text-[#5e69ce]">{rsvp.name}</h3>
              {rsvp.status === "accepted" ? (
                <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                  <Check className="mr-1 h-3 w-3" />
                  Accepted
                </span>
              ) : (
                <span className="ml-2 inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                  <X className="mr-1 h-3 w-3" />
                  Declined
                </span>
              )}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">{rsvp.email}</div>
            {rsvp.message && (
              <div className="mt-2 text-sm">
                <p className="italic text-gray-500">"{rsvp.message}"</p>
              </div>
            )}
          </div>
          <div className="text-xs text-muted-foreground">{new Date(rsvp.created_at).toLocaleDateString()}</div>
        </div>
      ))}
    </div>
  )
}
