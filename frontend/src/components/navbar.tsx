"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { User, MapPinned } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUserStore } from "@/store/userStore";

export function Navbar() {
  const router = useRouter();
  const { user, clearUser } = useUserStore();

  const handleLogout = () => {
    // Clear token from localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    clearUser();
    // Redirect to home page
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <MapPinned className="h-6 w-6" />
          <span className="hidden font-bold sm:inline-block">Wanderers</span>
        </Link>
        <div className="flex-1 flex justify-center mr-24">
          <nav className="hidden md:flex items-center space-x-10 text-sm font-medium">
            <Link
              href="/home"
              className="transition-colors hover:text-foreground/80"
            >
              Home
            </Link>
            <Link
              href="/trips"
              className="transition-colors hover:text-foreground/80"
            >
              My Trips
            </Link>
            <Link
              href="/explore"
              className="transition-colors hover:text-foreground/80"
            >
              Explore
            </Link>
            <Link
              href="/hotels"
              className="transition-colors hover:text-foreground/80"
            >
              Hotels
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {/* temporary solution until state management is added */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar>
                    <AvatarFallback>
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={handleLogout}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button>Login</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
