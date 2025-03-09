"use client";

import React, { ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useUserStore } from "@/store/userStore";

export const UserProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { fetchUserData, isUserFetched } = useUserStore((state) => state);
  const pathname = usePathname();

  useEffect(() => {
    // If the user is not fetched and the user is not on the login or signup page or confirm account page
    console.log(pathname);
    if (
      pathname !== "/login" &&
      pathname !== "/signup" &&
      !pathname.startsWith("/confirm-account/") &&
      !isUserFetched
    ) {
      // strip trailing and tail quotes
      const cookieValue = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`token=`))
        ?.split("=")[1]
        .replace(/(^")|("$)/g, "");

      if (cookieValue) {
        try {
          fetchUserData(cookieValue);
        } catch (err) {
          console.error("Error parsing token from localStorage", err);
        }
      }
    }
  }, [pathname, fetchUserData, isUserFetched]);

  return <>{children} </>;
};
