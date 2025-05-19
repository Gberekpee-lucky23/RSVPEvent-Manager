"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarPlus, Calendar, Users, MapPin, ExternalLink, Loader2 } from "lucide-react"
import { useAuth } from "../contexts/auth-context"
import { supabase, type Event } from "../lib/supabase"
import { formatDate } from "../lib/utils"
import { useLocation } from "react-router-dom"

export default function Dashboard() {
  const { user } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
  const fetchEvents = async () => {
    if (!user) return

    try {
      console.log("Fetching events for user:", user.id)
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: true })

      if (error) {
        console.error("Error fetching events:", error)
      } else {
        console.log("Fetched events:", data)
        setEvents(data as Event[])
      }
    } catch (error) {
      console.error("Error fetching events:", error)
    } finally {
      setLoading(false)
    }
  }

  if (user) {
    fetchEvents()
  } else {
    setLoading(false)
  }
}, [user, location.pathname])


  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#5e60ce]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-[#5e60ce]">Your Events</h1>
        <Button asChild className="bg-[#5e60ce] text-white">
          <Link to="/create-event">
            <CalendarPlus className="mr-2 h-4 w-4" />
            Create Event
          </Link>
        </Button>
      </div>

      {events.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-8 text-center">
          <CalendarPlus className="h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">No events yet</h2>
          <p className="mt-2 text-muted-foreground">Create your first event to get started</p>
          <Button asChild className="mt-6 bg-[#5e60ce] text-white">
            <Link to="/create-event">
              <CalendarPlus className="mr-2 h-4 w-4" />
              Create Event
            </Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id} className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="line-clamp-1 text-[#5e60ce]">{event.title}</CardTitle>
                <CardDescription className="flex items-center font-bold">
                  <Calendar className="mr-1 h-4 w-4" />
                  {formatDate(event.date)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-2 text-sm text-muted-foreground">{event.description}</p>
                <div className="mt-4 flex items-center text-sm text-muted-foreground">
                  <MapPin className="mr-1 h-4 w-4" />
                  {event.location}
                </div>
                {event.max_attendees && (
                  <div className="mt-2 flex items-center text-sm text-muted-foreground">
                    <Users className="mr-1 h-4 w-4" />
                    Max attendees: {event.max_attendees}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button asChild className="bg-[#5e60ce] text-white" size="sm">
                  <Link to={`/events/${event.id}`}>View Details</Link>
                </Button>
                <Button asChild className="bg-gray-200" size="sm">
                  <a href={`${window.location.origin}/rsvp/${event.id}`} target="_blank" rel="noopener noreferrer">
                    RSVP Link
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
