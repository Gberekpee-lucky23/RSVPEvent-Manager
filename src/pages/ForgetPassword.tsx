"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { supabase } from "../lib/supabase" // Update path if needed

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

const schema = z.object({
    email: z.string().email("Enter a valid email address"),
})

type FormData = z.infer<typeof schema>

export default function ForgotPassword() {
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    })

    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    

    const onSubmit = async (data: FormData) => {
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
           redirectTo: "http://localhost:5173/update-password", // Update this to your password update route
        })

        if (error) {
            setError(error.message)
        } else {
            setSubmitted(true)
        }

        setLoading(false)
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 text-gray-500">

            <Card className="w-full max-w-md border-0">
                <h1 className="mb-4 text-2xl text-muted-foreground text-center pt-4 text-[#5e60ce] font-bold ">
                    EventRSVP
                </h1>
                <p className="mb-4 text-sm text-muted-foreground text-center pt-4 ml-5 mr-5">
                    Enter the email address associated with your account and we’ll send you a link to reset your password.
                </p>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-[#5e60ce]">Forgot Password</CardTitle>
                </CardHeader>
                <CardContent>
                    {submitted ? (
                        <p className="text-sm text-green-600">A password reset link has been sent to your email.</p>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {error && (
                                <Alert variant="destructive" className="border-0 bg-[#d9f6ee]">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    {...register("email")}
                                    disabled={loading}
                                    className="border-gray-200"
                                />
                                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                            </div>
                            <Button type="submit" className="w-full bg-[#5e60ce] text-white" disabled={loading}>
                                {loading ? "Sending..." : "Send Reset Link"}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
