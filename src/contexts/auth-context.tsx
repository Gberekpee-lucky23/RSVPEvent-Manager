"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase } from "../lib/supabase"
import type { Session, User as SupabaseUser } from "@supabase/supabase-js"

type Profile = {
  id: string
  email: string
  full_name?: string
  created_at: string
}

type AuthContextType = {
  session: Session | null
  user: SupabaseUser | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => { },
})

type AuthProviderProps = {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    // Set a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      if (isMounted && loading) {
        console.warn("Auth loading timed out after 10 seconds, forcing loading state to false")
        setLoading(false)
      }
    }, 10000) // 10 second timeout

    // Initialize auth state
    const initializeAuth = async () => {
      try {
        console.log("Initializing auth state...")

        // Get current session
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting session:", error)
          if (isMounted) setLoading(false)
          return
        }

        const currentSession = data.session

        if (isMounted) {
          setSession(currentSession)

          if (currentSession) {
            console.log("Session found, setting user")
            setUser(currentSession.user)

            // Try to fetch profile data
            try {
              const { data: profileData, error: profileError } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", currentSession.user.id)
                .single()

              if (profileError) {
                console.error("Error fetching profile:", profileError)
              } else if (profileData && isMounted) {
                console.log("Profile found:", profileData)
                setProfile(profileData as Profile)
              }
            } catch (profileFetchError) {
              console.error("Exception fetching profile:", profileFetchError)
            }
          } else {
            console.log("No session found")
          }

          setLoading(false)
        }
      } catch (error) {
        console.error("Exception initializing auth:", error)
        if (isMounted) setLoading(false)
      }
    }

    initializeAuth()

   
    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log("Auth state changed:", event)

      if (isMounted) {
        setSession(newSession)
        setUser(newSession?.user || null)

        if (newSession?.user) {
          try {
            const { data: profileData, error: profileError } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", newSession.user.id)
              .single()

            if (profileError) {
              console.error("Error fetching profile on auth change:", profileError)
            } else if (profileData && isMounted) {
              setProfile(profileData as Profile)
            }
          } catch (error) {
            console.error("Exception fetching profile on auth change:", error)
          }
        } else {
          setProfile(null)
        }

        setLoading(false)
      }
    })

    return () => {
      isMounted = false
      clearTimeout(loadingTimeout)
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Attempting to sign in with email:", email)
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        console.error("Sign in error:", error)
      } else {
        console.log("Sign in successful")
      }

      return { error }
    } catch (error) {
      console.error("Exception during sign in:", error)
      return { error }
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      console.log("Attempting to sign up with email:", email)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        console.error("Sign up error:", error)
      } else {
        console.log("Sign up successful")
      }

      return { error }
    } catch (error) {
      console.error("Exception during sign up:", error)
      return { error }
    }
  }

  const signOut = async () => {
    try {
      console.log("Signing out")
      await supabase.auth.signOut()
      setSession(null)
      setUser(null)
      setProfile(null)
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
