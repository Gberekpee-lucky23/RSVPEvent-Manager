"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabase" // adjust as needed

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

const schema = z
    .object({
        password: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    })

type FormData = z.infer<typeof schema>

export default function UpdatePassword() {
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    })

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        // Check if user is logged in with a reset session
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                setError("Reset link is invalid or has expired.")
            }
        }

        checkSession()
    }, [])

    const onSubmit = async (data: FormData) => {
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.updateUser({
            password: data.password,
        })

        if (error) {
            setError(error.message)
        } else {
            setSuccess(true)
            // Sign them out
            await supabase.auth.signOut()
            // Redirect to login after short delay
            setTimeout(() => navigate("/login"), 2000)
        }

        setLoading(false)
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 text-gray-500">
            <Card className="w-full max-w-md border-0">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-[#5e60ce]">Reset Your Password</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Enter your new password below.
                    </p>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    {success ? (
                        <p className="text-sm text-green-600">Password updated! Redirecting to login...</p>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">New Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    {...register("password")}
                                    className="border-gray-200"
                                />
                                {errors.password && (
                                    <p className="text-sm text-destructive">{errors.password.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    {...register("confirmPassword")}
                                    className="border-gray-200"
                                />
                                {errors.confirmPassword && (
                                    <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                                )}
                            </div>
                            <Button type="submit" className="w-full bg-[#5e60ce] text-white" disabled={loading}>
                                {loading ? "Updating..." : "Update Password"}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
