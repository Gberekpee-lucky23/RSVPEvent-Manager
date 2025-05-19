// "use client"

// import { useAuth } from "../contexts/auth-context"
// import { useState } from "react"
// import { Button } from "@/components/ui/button"

// export default function AuthDebugger() {
//   const { user, session, loading } = useAuth()
//   const [isVisible, setIsVisible] = useState(false)

//   if (!isVisible) {
//     return (
//       <Button
//         variant="outline"
//         size="sm"
//         className="fixed bottom-4 right-4 opacity-50 hover:opacity-100"
//         onClick={() => setIsVisible(true)}
//       >
//         Debug Auth
//       </Button>
//     )
//   }

//   return (
//     <div className="fixed bottom-4 right-4 max-w-md rounded-lg border bg-background p-4 shadow-lg">
//       <div className="flex justify-between">
//         <h3 className="font-semibold">Auth Debugger</h3>
//         <Button variant="ghost" size="sm" onClick={() => setIsVisible(false)}>
//           Close
//         </Button>
//       </div>
//       <div className="mt-2 space-y-2 text-xs">
//         <div>
//           <p className="font-semibold">Loading: {loading ? "Yes" : "No"}</p>
//         </div>
//         <div>
//           <p className="font-semibold">User:</p>
//           <pre className="mt-1 max-h-20 overflow-auto rounded bg-muted p-2">
//             {user ? JSON.stringify(user, null, 2) : "null"}
//           </pre>
//         </div>
//         <div>
//           <p className="font-semibold">Session:</p>
//           <pre className="mt-1 max-h-20 overflow-auto rounded bg-muted p-2">
//             {session ? JSON.stringify(session, null, 2) : "null"}
//           </pre>
//         </div>
//         <div className="flex justify-end">
//           <Button
//             variant="destructive"
//             size="sm"
//             onClick={() => {
//               localStorage.clear()
//               sessionStorage.clear()
//               window.location.reload()
//             }}
//           >
//             Clear Storage & Reload
//           </Button>
//         </div>
//       </div>
//     </div>
//   )
// }
