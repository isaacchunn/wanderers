"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { cn } from "@/lib/utils";

const baseUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}`;

// Password validation schema
const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .max(20, { message: "Password must not exceed 20 characters" })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter",
    })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter",
    })
    .regex(/\d/, { message: "Password must contain at least one digit" })
    .regex(/[!@#$%^&*]/, {
      message:
        "Password must contain at least one special character (!@#$%^&*)",
    }),
});

// Password criteria for display with validation functions
const passwordCriteria = [
  {
    text: "Password must be at least 8 characters long",
    validate: (password: string) => password.length >= 8,
  },
  {
    text: "Password must not exceed 20 characters",
    validate: (password: string) => password.length <= 20,
  },
  {
    text: "Password must contain at least one uppercase letter",
    validate: (password: string) => /[A-Z]/.test(password),
  },
  {
    text: "Password must contain at least one lowercase letter",
    validate: (password: string) => /[a-z]/.test(password),
  },
  {
    text: "Password must contain at least one digit",
    validate: (password: string) => /\d/.test(password),
  },
  {
    text: "Password must contain at least one special character (!@#$%^&*)",
    validate: (password: string) => /[!@#$%^&*]/.test(password),
  },
];

export default function ResetPasswordPage() {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [criteriaValidation, setCriteriaValidation] = useState<boolean[]>(
    Array(passwordCriteria.length).fill(true)
  );

  // Update criteria validation whenever password changes
  useEffect(() => {
    const newValidation = passwordCriteria.map(
      (criterion) => newPassword.length === 0 || criterion.validate(newPassword)
    );
    setCriteriaValidation(newValidation);
  }, [newPassword]);

  const validatePassword = () => {
    const validationErrors: string[] = [];

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      validationErrors.push("Passwords do not match");
    }

    // Validate against schema
    try {
      resetPasswordSchema.parse({ password: newPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          validationErrors.push(err.message);
        });
      }
    }

    return validationErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password
    const validationErrors = validatePassword();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const response = await fetch(
        `${baseUrl}/api/auth/reset-password/${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password: newPassword }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
      } else {
        setErrors([data.message || "An error occurred"]);
      }
    } catch (error) {
      setErrors(["An unexpected error occurred. Please try again."]);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex h-[700px] flex-col items-center justify-center py-12">
        <div className="w-full max-w-md space-y-4 text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Password Reset Successful
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Your password has been successfully reset.
          </p>
          <div className="mt-4">
            <Link href="/login">
              <Button className="w-full">Go to Login</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[700px] flex-col items-center justify-center py-12">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Reset Your Password
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                name="newPassword"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {/* Password criteria with dynamic coloring */}
          <div className="text-sm">
            <p className="font-medium mb-1">Password must:</p>
            <ul className="text-xs list-inside space-y-1">
              {passwordCriteria.map((criterion, index) => (
                <li
                  key={index}
                  className={cn(
                    "flex items-start",
                    newPassword.length > 0 && !criteriaValidation[index]
                      ? "text-red-500"
                      : "text-muted-foreground"
                  )}
                >
                  <span className="inline-block w-3 mr-1">•</span>
                  <span>{criterion.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Error messages */}
          {errors.length > 0 && (
            <div className="mt-2">
              <ul className="text-red-500 text-xs list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Password match error */}
          {newPassword &&
            confirmPassword &&
            newPassword !== confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                Passwords do not match
              </p>
            )}

          <div>
            <Button type="submit" className="w-full">
              Reset Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
