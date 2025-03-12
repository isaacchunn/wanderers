"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useUserStore } from "@/store/userStore";

export function Navbar() {
  const router = useRouter();
  const [avatarSrc, setAvatarSrc] = useState<string | undefined>(undefined);
  const { user, clearUser } = useUserStore();

  useEffect(() => {
    if (user?.user_photo) {
      setAvatarSrc(`${user.user_photo}` || undefined);
    } else {
      setAvatarSrc(undefined);
    }
  }, [user, user?.user_photo]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      clearUser();
      document.cookie.split(";").forEach((cookie) => {
        const [name] = cookie.split("=");
        document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
      router.push("/");
      router.refresh();
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/home" className="flex items-center space-x-2">
          <MapPinned className="h-6 w-6" />
          <span className="hidden font-bold sm:inline-block">Wanderers</span>
        </Link>
        <div className="flex-1 flex justify-center mr-16">
          <nav className="hidden md:flex items-center space-x-10 text-sm font-medium">
            {user !== null ? (
              <Link
                href="/home"
                className="transition-colors hover:text-foreground/80"
              >
                Home
              </Link>
            ) : (
              <></>
            )}
            {user !== null ? (
              <Link
                href="/my-trips"
                className="transition-colors hover:text-foreground/80"
              >
                My Trips
              </Link>
            ) : (
              <></>
            )}
            {user !== null ? (
              <Link
                href="/explore"
                className="transition-colors hover:text-foreground/80"
              >
                Explore
              </Link>
            ) : (
              <></>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {/* temporary solution until state management is added */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar>
                    <AvatarImage src={avatarSrc || undefined} />
                    <AvatarFallback>
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
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
