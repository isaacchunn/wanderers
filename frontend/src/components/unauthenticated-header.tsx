import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MapPinned } from "lucide-react";
//test lint
export function UnauthenticatedHeader() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center justify-between">
                <Link href="/" className="flex items-center space-x-2">
                    <MapPinned className="h-6 w-6" />
                    <span className="hidden font-bold sm:inline-block">
                        Wanderers
                    </span>
                </Link>

                <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                    <Link
                        href="/itinerary"
                        className="transition-colors hover:text-foreground/80"
                    >
                        Itinerary
                    </Link>
                    <Link
                        href="/discussion"
                        className="transition-colors hover:text-foreground/80"
                    >
                        Discussion
                    </Link>
                    <Link
                        href="/budget"
                        className="transition-colors hover:text-foreground/80"
                    >
                        Budget
                    </Link>
                    <Link
                        href="/contact"
                        className="transition-colors hover:text-foreground/80"
                    >
                        Contact
                    </Link>
                </nav>

                <div className="flex items-center space-x-3">
                    <Link
                        href="/login"
                        className="text-sm font-medium hover:underline underline-offset-4"
                    >
                        Log in
                    </Link>
                    <Button variant="default" asChild>
                        <Link href="/signup">Sign Up</Link>
                    </Button>
                    <Button variant="ghost" className="md:hidden" size="icon">
                        <span className="sr-only">Toggle menu</span>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-6 w-6"
                        >
                            <line x1="4" x2="20" y1="12" y2="12" />
                            <line x1="4" x2="20" y1="6" y2="6" />
                            <line x1="4" x2="20" y1="18" y2="18" />
                        </svg>
                    </Button>
                </div>
            </div>
        </header>
    );
}
