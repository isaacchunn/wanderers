import { Inter } from "next/font/google";
import { UnauthenticatedHeader } from "@/components/unauthenticated-header";
import { AuthenticatedHeader } from "@/components/authenticated-header";
import "./globals.css";
import type React from "react";
import { SiteFooter } from "@/components/site-footer";

const inter = Inter({ subsets: ["latin"] });

// This is a placeholder for the session state of the user [TODO]
const authenticatedSession = true;

export const metadata = {
    title: "Wanderers - Plan Your Travel Together",
    description:
        "Collaborate with friends and family to create the perfect travel itinerary.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${inter.className} wanderers-body`}>
                <div className="flex h-screen flex-col justify-center">
                    {authenticatedSession ? (
                        <AuthenticatedHeader />
                    ) : (
                        <UnauthenticatedHeader />
                    )}
                    <main className="flex-1">{children}</main>
                    <SiteFooter />
                </div>
            </body>
        </html>
    );
}
