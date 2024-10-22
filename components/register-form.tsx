"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Lock } from "lucide-react";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import LoadingOverlay from "./utils/loading-overlay";

const formSchema = z
    .object({
        name: z.string().min(3, "Name must be at least 3 characters"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

type FormData = z.infer<typeof formSchema>;

export function RegisterForm() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const supabase = createClientComponentClient();

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    async function onSubmit(values: FormData) {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signUp({
                email: values.email,
                password: values.password,
                options: {
                    emailRedirectTo: `${location.origin}/auth/callback`,
                },
            });

            if (error) {
                setError(error.message);
            } else {
                window.location.reload();
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card className="w-full max-w-md mx-auto relative overflow-hidden ">
            <LoadingOverlay isLoading={loading} />
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Register</CardTitle>
                <CardDescription>
                    Create an account for the appointment scheduler
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <User className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type="name"
                                                placeholder="Enter your name"
                                                {...field}
                                                className="pl-8"
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <User className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type="email"
                                                placeholder="Enter your email"
                                                {...field}
                                                className="pl-8"
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Lock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type="password"
                                                placeholder="Enter your password"
                                                {...field}
                                                className="pl-8"
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Lock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type="password"
                                                placeholder="Confirm your password"
                                                {...field}
                                                className="pl-8"
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <Button type="submit" className="w-full">
                            Register
                        </Button>
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="flex justify-center">
                <p className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <a href="/login" className="text-primary hover:underline">
                        Log in
                    </a>
                </p>
            </CardFooter>
        </Card>
    );
}
