// "use client"

// import { useState } from "react"
// import { Button } from "@/components/ui/button"
// import { supabase } from "../lib/supabase"
// import { useAuth } from "../contexts/auth-context"
// import { Loader2 } from "lucide-react"

// export default function DbDebugger() {
//   const { user } = useAuth()
//   const [isVisible, setIsVisible] = useState(false)
//   const [loading, setLoading] = useState(false)
//   const [results, setResults] = useState<any>(null)
//   const [error, setError] = useState<string | null>(null)

//   const checkUserInAuthUsers = async () => {
//     if (!user) return

//     setLoading(true)
//     setError(null)

//     try {
//       // This is an admin-only query, so it will fail unless you're using the service role key
//       // But we can check if the current user can access their own auth data
//       const { data, error } = await supabase.auth.getUser()

//       setResults({
//         authUser: data.user,
//       })

//       if (error) {
//         setError(error.message)
//       }
//     } catch (err) {
//       console.error("Error checking auth user:", err)
//       setError(err instanceof Error ? err.message : "Unknown error")
//     } finally {
//       setLoading(false)
//     }
//   }

//   const checkUserInProfiles = async () => {
//     if (!user) return

//     setLoading(true)
//     setError(null)

//     try {
//       const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

//       setResults({
//         profile: data,
//       })

//       if (error) {
//         setError(error.message)
//       }
//     } catch (err) {
//       console.error("Error checking profile:", err)
//       setError(err instanceof Error ? err.message : "Unknown error")
//     } finally {
//       setLoading(false)
//     }
//   }

//   const createUserProfile = async () => {
//     if (!user) return

//     setLoading(true)
//     setError(null)

//     try {
//       const { data, error } = await supabase
//         .from("profiles")
//         .upsert({
//           id: user.id,
//           email: user.email,
//           created_at: new Date().toISOString(),
//         })
//         .select()

//       setResults({
//         createdProfile: data,
//       })

//       if (error) {
//         setError(error.message)
//       } else {
//         await checkUserInProfiles()
//       }
//     } catch (err) {
//       console.error("Error creating profile:", err)
//       setError(err instanceof Error ? err.message : "Unknown error")
//     } finally {
//       setLoading(false)
//     }
//   }

//   const testEventCreation = async () => {
//     if (!user) return

//     setLoading(true)
//     setError(null)

//     try {
//       // First check if the user exists in profiles
//       const { data: profileData, error: profileError } = await supabase
//         .from("profiles")
//         .select("id")
//         .eq("id", user.id)
//         .single()

//       if (profileError) {
//         setError(`Profile check failed: ${profileError.message}`)
//         setLoading(false)
//         return
//       }

//       // Try to create a test event
//       const { data, error } = await supabase
//         .from("events")
//         .insert([
//           {
//             title: "Test Event",
//             description: "This is a test event",
//             date: new Date().toISOString().split("T")[0],
//             time: "12:00",
//             location: "Test Location",
//             user_id: user.id,
//           },
//         ])
//         .select()

//       setResults({
//         testEvent: data,
//       })

//       if (error) {
//         setError(error.message)
//       }
//     } catch (err) {
//       console.error("Error testing event creation:", err)
//       setError(err instanceof Error ? err.message : "Unknown error")
//     } finally {
//       setLoading(false)
//     }
//   }

//   if (!isVisible) {
//     return (
//       <Button
//         variant="outline"
//         size="sm"
//         className="fixed bottom-4 left-4 opacity-50 hover:opacity-100"
//         onClick={() => setIsVisible(true)}
//       >
//         Debug DB
//       </Button>
//     )
//   }

//   return (
//     <div className="fixed bottom-4 left-4 max-w-md rounded-lg border bg-background p-4 shadow-lg">
//       <div className="flex justify-between">
//         <h3 className="font-semibold">Database Debugger</h3>
//         <Button variant="ghost" size="sm" onClick={() => setIsVisible(false)}>
//           Close
//         </Button>
//       </div>
//       <div className="mt-2 space-y-2">
//         <div className="flex flex-wrap gap-2">
//           <Button size="sm" onClick={checkUserInAuthUsers} disabled={loading || !user}>
//             Check Auth User
//           </Button>
//           <Button size="sm" onClick={checkUserInProfiles} disabled={loading || !user}>
//             Check Profile
//           </Button>
//           <Button size="sm" onClick={createUserProfile} disabled={loading || !user}>
//             Create Profile
//           </Button>
//           <Button size="sm" onClick={testEventCreation} disabled={loading || !user}>
//             Test Event Creation
//           </Button>
//         </div>

//         {loading && (
//           <div className="flex items-center justify-center py-2">
//             <Loader2 className="h-4 w-4 animate-spin" />
//             <span className="ml-2 text-sm">Loading...</span>
//           </div>
//         )}

//         {error && (
//           <div className="rounded-md bg-red-50 p-2 text-sm text-red-600">
//             <p className="font-semibold">Error:</p>
//             <p>{error}</p>
//           </div>
//         )}

//         {results && (
//           <div className="rounded-md bg-gray-50 p-2">
//             <p className="font-semibold">Results:</p>
//             <pre className="mt-1 max-h-40 overflow-auto text-xs">{JSON.stringify(results, null, 2)}</pre>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }
