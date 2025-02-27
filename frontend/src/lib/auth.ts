"use server";

import { cookies } from "next/headers";

export const getToken = async () => {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value.replace(/(^")|("$)/g, "");
        return token;
    } catch (error) {
        console.error("Error getting token from cookieStore:", error);
    }
    return undefined;
};
