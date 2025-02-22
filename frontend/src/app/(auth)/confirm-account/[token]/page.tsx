"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const baseUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}`;

export default function ConfirmAccountPage() {
  const { token } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const confirmAccount = async () => {
      try {
        const response = await fetch(
          `${baseUrl}/api/auth/confirm-account/${token}`,
          {
            method: "POST",
          }
        );

        if (response.ok) {
          setIsConfirmed(true);
        } else {
          setError("Token is not valid");
        }
      } catch (error) {
        setError("An error occurred: " + error);
      } finally {
        setIsLoading(false);
      }
    };

    confirmAccount();
  }, [token]);

  if (isLoading) {
    return (
      <div className="flex h-[700px] flex-col items-center justify-center py-12">
        <div className="w-full max-w-md space-y-4 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-lg">Confirming your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[700px] flex-col items-center justify-center py-12">
      <div className="w-full max-w-md space-y-4 text-center">
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          {isConfirmed ? "Account Confirmed" : "Confirmation Failed"}
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          {isConfirmed
            ? "Your account has been successfully confirmed."
            : `${error}. Please request a new confirmation link.`}
        </p>
        <div className="mt-4 space-y-4">
          {isConfirmed ? (
            <Link href="/login">
              <Button className="w-full">Go to Login</Button>
            </Link>
          ) : (
            <p className="text-sm text-gray-600">
              <Link href="/login" className="text-primary hover:underline">
                Click here to return to login page
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
