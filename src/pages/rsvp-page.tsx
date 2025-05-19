"use client"

import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar, Clock, MapPin, Users, Loader2, CheckCircle2 } from "lucide-react"
import { supabase, type Event } from "../lib/supabase"
import { formatDate } from "../lib/utils"
import { Controller } from "react-hook-form"

const rsvpSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  status: z.enum(["accepted", "declined"], {
    required_error: "Please select whether you can attend",
  }),
  message: z.string().optional(),
})

type RsvpFormValues = z.infer<typeof rsvpSchema>

export default function RsvpPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [attendeeCount, setAttendeeCount] = useState(0)

  const {
    register,
    handleSubmit,
    control, // add this
    formState: { errors },
    watch,
  } = useForm<RsvpFormValues>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: {
      status: "accepted",
    },
  })

  const status = watch("status")

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!eventId) return

      try {
        // Fetch event details
        const { data: eventData, error: eventError } = await supabase
          .from("events")
          .select("*")
          .eq("id", eventId)
          .single()

        if (eventError) {
          console.error("Error fetching event:", eventError)
          setError("Event not found")
          setLoading(false)
          return
        }

        setEvent(eventData as Event)

        // Fetch accepted RSVP count
        const { count, error: countError } = await supabase
          .from("rsvps")
          .select("*", { count: "exact", head: true })
          .eq("event_id", eventId)
          .eq("status", "accepted")

        if (!countError && count !== null) {
          setAttendeeCount(count)
        }
      } catch (error) {
        console.error("Error fetching event details:", error)
        setError("Failed to load event details")
      } finally {
        setLoading(false)
      }
    }

    fetchEventDetails()
  }, [eventId])

  const onSubmit = async (data: RsvpFormValues) => {
    if (!eventId || !event) return

    setSubmitting(true)
    setError(null)

    try {
      // Check if max attendees limit is reached
      if (event.max_attendees !== null && data.status === "accepted" && attendeeCount >= event.max_attendees) {
        setError("Sorry, this event has reached its maximum number of attendees")
        setSubmitting(false)
        return
      }

      // Check if email already RSVP'd
      const { data: existingRsvp, error: checkError } = await supabase
        .from("rsvps")
        .select("*")
        .eq("event_id", eventId)
        .eq("email", data.email)
        .maybeSingle()

      if (checkError) {
        throw checkError
      }

      if (existingRsvp) {
        // Update existing RSVP
        const { error: updateError } = await supabase
          .from("rsvps")
          .update({
            name: data.name,
            status: data.status,
            message: data.message || null,
          })
          .eq("id", existingRsvp.id)

        if (updateError) {
          throw updateError
        }
      } else {
        // Create new RSVP
        const { error: insertError } = await supabase.from("rsvps").insert([
          {
            event_id: eventId,
            name: data.name,
            email: data.email,
            status: data.status,
            message: data.message || null,
          },
        ])

        if (insertError) {
          throw insertError
        }
      }

      setSubmitted(true)
    } catch (err) {
      console.error("Error submitting RSVP:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error && !event) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <h2 className="text-xl font-semibold">Event not found</h2>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 border-0">
        <Card className="w-full max-w-md border-0 ">
          <CardHeader className="text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
            <CardTitle className="mt-4">Thank You!</CardTitle>
            <CardDescription className="text-gray-500">Your RSVP has been submitted successfully.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <h3 className="text-lg font-medium text-[#5e69ce]">{event.title}</h3>
            <p className="mt-1 text-muted-foreground text-black font-bold">
              {formatDate(event.date)} at {event.time}
            </p>
            <p className="mt-4 text-gray-500">
              {status === "accepted"
                ? "We're looking forward to seeing you!"
                : "We're sorry you can't make it. Thanks for letting us know!"}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isAtCapacity = event.max_attendees !== null && attendeeCount >= event.max_attendees

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8 text-gray-500 ">
      <Card className="w-full max-w-md shadow-md border-[#232e9e]">
        <CardHeader>
          <CardTitle className="text-[#5e69ce]">{event.title}</CardTitle>
          <CardDescription className="">Please RSVP to this event</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 ">
          <div className="rounded-lg bg-[#5e69ce] text-white p-4">
            <div className="space-y-2 ">
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{event.location}</span>
              </div>
              {event.max_attendees && (
                <div className="flex items-center">
                  <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>
                    {attendeeCount}/{event.max_attendees} spots filled
                  </span>
                </div>
              )}
            </div>
            <div className="mt-3">
              <p className="text-sm text-muted-foreground">{event.description}</p>
            </div>
          </div>

          {isAtCapacity && (
            <Alert>
              <AlertDescription>
                This event has reached its maximum number of attendees. You can still RSVP, but you'll be added to a
                waiting list.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[#5e69ce]">Your Name</Label>
                <Input id="name" placeholder="John Doe" {...register("name")} className="border-gray-200" />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#5e69ce]">Email</Label>
                <Input id="email" type="email" placeholder="john@example.com" {...register("email")} className="border-gray-200" />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-[#5e69ce]">Will you attend?</Label>
                <Controller
                  name="status"
                  control={control}
                  defaultValue="accepted"
                  render={({ field }) => (
                    <RadioGroup onValueChange={field.onChange} value={field.value}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="accepted" id="accepted" />
                        <Label htmlFor="accepted" className="cursor-pointer">
                          Yes, I'll be there
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="declined" id="declined" />
                        <Label htmlFor="declined" className="cursor-pointer">
                          No, I can't make it
                        </Label>
                      </div>
                    </RadioGroup>
                  )}
                />

                {errors.status && <p className="text-sm text-destructive">{errors.status.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="message" className="text-[#5e69ce]">Message (Optional)</Label>
                <Textarea id="message" placeholder="Any additional information..." {...register("message")} />
              </div>
              <Button type="submit" className="w-full bg-[#5e69ce] text-white" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit RSVP"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
