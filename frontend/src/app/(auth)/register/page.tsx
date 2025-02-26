"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { z } from "zod";

const baseUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}`;

// Define the schema for form validation
const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters long"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string[] }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      // Validate the form data
      registerSchema.parse({ username, email, password });

      const response = await fetch(`${baseUrl}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      if (response.ok) {
        setIsSuccess(true);
      } else {
        const errorData = await response.json();
        setErrors({
          api: [errorData.message || "Registration failed. Please try again."],
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { [key: string]: string[] } = {};
        error.errors.forEach((err) => {
          if (err.path) {
            const field = err.path[0] as string;
            if (!fieldErrors[field]) {
              fieldErrors[field] = [];
            }
            fieldErrors[field].push(err.message);
          }
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ api: ["An unexpected error occurred. Please try again."] });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex h-[700px] flex-col items-center justify-center py-12">
        <div className="w-full max-w-md space-y-4 text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Registration Successful
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please check your email to verify your account.
          </p>
          <Button onClick={() => router.push("/login")} className="mt-4">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[700px] flex-1 flex-col items-center justify-center py-8">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:text-primary/80"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>
        {errors.api && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">{errors.api[0]}</span>
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1"
              />
              {errors.username && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.username[0]}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="email-address">Email address</Label>
              <Input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email[0]}</p>
              )}
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
              />
              {errors.password && (
                <ul className="text-red-500 text-xs mt-1 list-disc list-inside">
                  {errors.password.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <p>Password must:</p>
            <ul className="list-disc list-inside">
              <li>Be at least 8 characters long</li>
            </ul>
          </div>

          <div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
