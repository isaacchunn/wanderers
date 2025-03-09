"use server"
import { BACKEND_URL } from "@/lib/utils";
import { cookies } from "next/headers";

interface CheckEmailResponse {
    isCurrentUser: boolean
    exists: boolean
    message?: string
}


export async function updateProfile(profile_description: string): Promise<{ success: boolean, data: object }> {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value.replace(/(^")|("$)/g, "");

    try {
        const response = await fetch(`${BACKEND_URL}/api/profile/description`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ profile_description }),
            cache: "no-store",
            next: { revalidate: 10 },
        });

        const data: object = await response.json();
        return { success: true, data: data };
    } catch (error) {
        return { success: false, data: { error: error } };
    }
}


export async function uploadProfilePicture(file: File): Promise<{ success: boolean, data: string }> {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value.replace(/(^")|("$)/g, "");
    try {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch(`${BACKEND_URL}/api/profile/picture`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
            body: formData,
            cache: "no-store",
            next: { revalidate: 10 },
        })

        if (!response.ok) {
            return { success: false, data: "Failed to upload image" }
        }

        const data = await response.json();

        if (data.full_image_path) {
            return { success: true, data: data.full_image_path };
        } else {
            return { success: false, data: "No image_path received from server" };
        }
    } catch (error) {
        return { success: false, data: error instanceof Error ? error.message : "Failed to upload image" };
    }
}


export async function deleteProfilePicture(): Promise<{ success: boolean, data: string }> {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value.replace(/(^")|("$)/g, "");

    try {
        await fetch(`${BACKEND_URL}/api/profile/picture`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
            // Note: Don't set Content-Type header, let the browser set it for FormData
            cache: "no-store",
            next: { revalidate: 10 },
        })
        return { success: true, data: "Image deleted successfully" };
    } catch (error) {
        return { success: false, data: error instanceof Error ? error.message : "Failed to delete image" };
    }
}


export async function updatePassword(currentPassword: string, newPassword: string, newPassword2: string): Promise<{ success: boolean, data: string }> {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value.replace(/(^")|("$)/g, "");
    try {
        const response = await fetch(`${BACKEND_URL}/api/auth/update-password`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token} `,
            },
            body: JSON.stringify({ currentPassword, newPassword, newPassword2 }),
            cache: "no-store",
            next: { revalidate: 0 }, // Don't cache password changes
        })

        const responseData = await response.json()

        if (!response.ok) {
            throw new Error(responseData.message || "Failed to update password");
        }

        return { success: true, data: responseData.message };
    } catch (error) {
        return { success: false, data: error instanceof Error ? error.message : "Failed to update password" };
    }
}

export async function checkEmail(email: string): Promise<CheckEmailResponse> {
    const cookieStore = await cookies()
    const token = cookieStore.get("token")?.value.replace(/(^")|("$)/g, "")
    const userData = cookieStore.get("user")?.value

    try {
        // First check if this is the current user's email
        if (userData) {
            const currentUser = JSON.parse(userData)
            if (email.toLowerCase() === currentUser.email.toLowerCase()) {
                return {
                    isCurrentUser: true,
                    exists: true,
                    message: "This is your email",
                }
            }
        }

        // Then check if the user exists in the database
        const response = await fetch(`${BACKEND_URL}/api/user/email/${email}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
            next: { revalidate: 10 },
        })

        const data = await response.json()
        return {
            isCurrentUser: false,
            exists: response.ok,
            message: data.message,
        }
    } catch (error) {
        return {
            isCurrentUser: false,
            exists: false,
            message: error instanceof Error ? error.message : "Failed to check email",
        }
    }
}

