"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "../lib/supabase"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// Define the schema with proper types
const eventSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  date: z.string().min(1, { message: "Date is required" }),
  time: z.string().min(1, { message: "Time is required" }),
  location: z.string().min(1, { message: "Location is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  max_attendees: z.string().optional(),
})

// Define the form values type
type EventFormValues = z.infer<typeof eventSchema>

// Define the processed form data type after transformation
type ProcessedEventData = {
  title: string
  date: string
  time: string
  location: string
  description: string
  max_attendees: number | null
}

export default function CreateEvent() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
  })

  // Process the form data before submission
  const processFormData = (data: EventFormValues): ProcessedEventData => {
    return {
      ...data,
      max_attendees:
        data.max_attendees === "" || data.max_attendees === undefined ? null : Number.parseInt(data.max_attendees, 10),
    }
  }

  const onSubmit = async (formData: EventFormValues) => {
    setIsLoading(true)
    setError(null)

    try {
      // Process the form data
      const data = processFormData(formData)

      // Get the current user directly from Supabase
      const { data: authData, error: authError } = await supabase.auth.getUser()

      if (authError || !authData.user) {
        console.error("Error getting current user:", authError)
        setError("You must be logged in to create an event. Please sign out and sign in again.")
        setIsLoading(false)
        return
      }

      const userId = authData.user.id
      console.log("Creating event with user ID:", userId)

      // Use RPC to create the event through a stored procedure
      const { error: eventError } = await supabase.rpc("create_event", {
        p_title: data.title,
        p_description: data.description,
        p_date: data.date,
        p_time: data.time,
        p_location: data.location,
        p_max_attendees: data.max_attendees,
      })

      if (eventError) {
        console.error("Error creating event:", eventError)

        // If the RPC fails, try the direct approach as a fallback
        const { error: directEventError } = await supabase
          .from("events")
          .insert([
            {
              title: data.title,
              date: data.date,
              time: data.time,
              location: data.location,
              description: data.description,
              max_attendees: data.max_attendees,
              user_id: userId,
            },
          ])
          .select()

        if (directEventError) {
          console.error("Error creating event directly:", directEventError)
          setError(directEventError.message || "Failed to create event. Please try again.")
          setIsLoading(false)
          return
        }

        toast({
          title: "Event created",
          description: "Your event has been created successfully.",
        })
        setTimeout(() => {
          navigate("/dashboard")
        }, 500)
      } else {
        toast({
          title: "Event created",
          description: "Your event has been created successfully.",
        })
        setTimeout(() => {
          navigate("/dashboard")
        }, 500)
      }
    } catch (err) {
      console.error("Exception creating event:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Card className="border-gray-200 shadow-md ">
        <CardHeader>
          <CardTitle className="text-[#5e60ce] py-5">Create Event</CardTitle>
          <CardDescription>Fill out the form below to create a new event</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4 text-gray-800">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input id="title" placeholder="Summer Party" {...register("title")} className="border-gray-200" />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" {...register("date")} className="border-gray-200" />
                {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input id="time" type="time" {...register("time")} className="border-gray-200" />
                {errors.time && <p className="text-sm text-destructive">{errors.time.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="123 Main St, City"
                {...register("location")}
                className="border-gray-200"
              />
              {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your event..."
                className="min-h-[100px] border-gray-200"
                {...register("description")}
              />
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_attendees">Maximum Attendees (Optional)</Label>
              <Input
                id="max_attendees"
                type="number"
                placeholder="Leave blank for unlimited"
                {...register("max_attendees")}
                className="border-gray-200"
              />
              {errors.max_attendees && <p className="text-sm text-destructive">{errors.max_attendees.message}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full bg-[#5e60ce] text-white" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating event...
                </>
              ) : (
                "Create Event"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
