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
        if (pathname !== "/login" && pathname !== "/signup" && !isUserFetched) {
            const tokenString = localStorage.getItem("token");

            if (tokenString) {
                try {
                    const tokenData = JSON.parse(tokenString);
                    const userId = tokenData?.user?.id;
                    if (userId) {
                        fetchUserData(userId);
                    }
                } catch (err) {
                    console.error("Error parsing token from localStorage", err);
                }
            }
        }
    }, [pathname, fetchUserData, isUserFetched]);

    return <>{children} </>;
};
