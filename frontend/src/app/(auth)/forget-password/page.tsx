"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const baseUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}`;

export default function ForgetPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`${baseUrl}/api/auth/forget-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      // We set isSubmitted to true regardless of the response
      setIsSubmitted(true);
    } catch (error) {
      // Even if there's an error, we still show the success message
      setIsSubmitted(true);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex h-[700px] flex-col items-center justify-center py-12">
        <div className="w-full max-w-md space-y-4 text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Check Your Email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            If an account exists for {email}, we have sent a password reset link
            to that address.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[700px] flex-col items-center justify-center py-12">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Forgot Your Password?
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm">
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
            </div>
          </div>
          <div>
            <Button type="submit" className="w-full">
              Send Reset Link
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
