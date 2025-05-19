import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables. Please check your .env file.")
}

// Create a custom fetch with timeout
const fetchWithTimeout = (url: RequestInfo | URL, options: RequestInit & { timeout?: number } = {}) => {
  const { timeout = 15000, ...fetchOptions } = options

  return Promise.race([
    fetch(url, fetchOptions),
    new Promise((_, reject) => setTimeout(() => reject(new Error("Request timed out")), timeout)),
  ]) as Promise<Response>
}

// Create Supabase client with custom fetch
export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    fetch: fetchWithTimeout,
  },
})

// Define types for our database
export type Profile = {
  id: string
  email: string
  full_name?: string
  created_at: string
}

export type Event = {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  max_attendees: number | null
  user_id: string
  created_at: string
}

export type RSVP = {
  id: string
  event_id: string
  name: string
  email: string
  status: "accepted" | "declined"
  message: string | null
  created_at: string
}

// Helper function to check if Supabase is reachable
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from("profiles").select("count", { count: "exact", head: true })
    return !error
  } catch (error) {
    console.error("Supabase connection check failed:", error)
    return false
  }
}
