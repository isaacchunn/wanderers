"use server";

import { Itinerary } from "@/lib/types";
import { getToken } from "@/lib/auth";

const NEXT_PUBLIC_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function fetchItineraryById(
    itineraryId: string | number | null
): Promise<Itinerary | undefined> {
    try {
        const token = await getToken();
        const response = await fetch(
            `${NEXT_PUBLIC_BACKEND_URL}/api/itinerary/${itineraryId}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                cache: "no-store",
            }
        );

        if (!response.ok) {
            throw new Error(
                `Failed to fetch itinerary: ${response.status} ${response.statusText}`
            );
        }

        const data: Itinerary = await response.json();
        return data;
    } catch (error) {
        console.error("ItineraryHandler - Error fetching itinerary:", error);
        return undefined;
    }
}

//Retrieve an existing public itinerary by its ID.
export async function fetchPublicItineraryById(
    itineraryId: string | null
): Promise<Itinerary | undefined> {
    try {
        const response = await fetch(
            `${NEXT_PUBLIC_BACKEND_URL}/api/public/itinerary/${itineraryId}`,

            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                cache: "no-store",
            }
        );

        if (!response.ok) {
            throw new Error(
                `Failed to fetch itinerary: ${response.status} ${response.statusText}`
            );
        }

        const data: Itinerary = await response.json();
        return data;
    } catch (error) {
        console.error("ItineraryHandler - Error fetching itinerary:", error);
        return undefined;
    }
}

// Fetch all public itineraries.
export async function fetchPublicItinerary(): Promise<Itinerary[] | undefined> {
    try {
        const response = await fetch(
            `${NEXT_PUBLIC_BACKEND_URL}/api/public/itinerary/`,

            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                cache: "no-store",
            }
        );

        if (!response.ok) {
            throw new Error(
                `Failed to fetch itinerary: ${response.status} ${response.statusText}`
            );
        }

        const data: Itinerary[] = await response.json();
        return data;
    } catch (error) {
        console.error(
            "ItineraryPublic - Error fetching public itinerary:",
            error
        );
        return undefined;
    }
}

// Fetches all itineraries where the user is the owner.
export async function fetchUserItinerary(
    ownerId: string | undefined
): Promise<Itinerary[] | undefined> {
    try {
        const token = await getToken();
        if (!token) {
            throw new Error("No token found in cookieStore.");
        }

        const response = await fetch(
            `${NEXT_PUBLIC_BACKEND_URL}/api/itinerary/${ownerId}/created`,

            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                cache: "no-store",
            }
        );

        if (!response.ok) {
            throw new Error(
                `Failed to fetch itinerary: ${response.status} ${response.statusText}`
            );
        }

        const data: Itinerary[] = await response.json();
        return data;
    } catch (error) {
        console.error(
            "ItineraryUser - Error fetching user's itinerary:",
            error
        );
        return undefined;
    }
}

// Fetches all itineraries where the user is a collaborator.
export async function fetchCollabItinerary(): Promise<Itinerary[] | undefined> {
    try {
        const token = await getToken();
        const response = await fetch(
            `${NEXT_PUBLIC_BACKEND_URL}/api/itinerary/collaborated`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                cache: "no-store",
            }
        );

        if (!response.ok) {
            throw new Error(
                `Failed to fetch itinerary: ${response.status} ${response.statusText}`
            );
        }

        const data: Itinerary[] = await response.json();

        return data;
    } catch (error) {
        console.error(
            "ItineraryCollaborator - Error fetching user's collaborated itinerary:",
            error
        );
        return undefined;
    }
}

// Create an Itinerary.
export async function createItinerary(
    title: string | undefined,
    location: string | undefined,
    visibility: "public" | "private" | undefined,
    start_date: Date | undefined,
    end_date: Date | undefined,
    collaborators: string[] | undefined
): Promise<Itinerary | undefined> {
    try {
        const token = await getToken();
        const response = await fetch(
            `${NEXT_PUBLIC_BACKEND_URL}/api/itinerary/`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title,
                    location,
                    visibility,
                    start_date,
                    end_date,
                    collaborators,
                }),
                cache: "no-store",
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(
                `Failed to create itinerary: ${response.status} ${response.statusText}${errorData}`
            );
        }

        const data = await response.json();

        if (!data.id) {
            throw new Error("No ID returned from API.");
        }
        return data;
    } catch (error) {
        console.error("Error creating itinerary:", error);
        return undefined;
    }
}

// Archive/Delete an Itinerary
export async function deleteItinerary(
    itineraryId: string | null
): Promise<boolean> {
    try {
        const token = await getToken();
        const response = await fetch(
            `${NEXT_PUBLIC_BACKEND_URL}/api/itinerary/${itineraryId}`,
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                cache: "no-store",
            }
        );

        if (!response.ok) {
            throw new Error(
                `Failed to delete itinerary: ${response.status} ${response.statusText}`
            );
        }

        return true;
    } catch (error) {
        console.error("Error delete itinerary:", error);
        return false;
    }
}

// Restore a deleted Itinerary
export async function restoreItinerary(id: string): Promise<boolean> {
    try {
        const token = await getToken();
        const response = await fetch(
            `${NEXT_PUBLIC_BACKEND_URL}/api/itinerary/${id}/restore`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                cache: "no-store",
            }
        );

        if (!response.ok) {
            throw new Error(
                `Failed to restore itinerary: ${response.status} ${response.statusText}`
            );
        }

        return true;
    } catch (error) {
        console.error("Error restoring itinerary:", error);
        return false;
    }
}

// Update Itinerary with updated values
export async function updateItinerary(
    itinerary: Itinerary,
    photoURL?: string | undefined
): Promise<Itinerary | undefined> {
    try {
        const neededItinerary = {
            title: itinerary.title,
            location: itinerary.location,
            visibility: itinerary.visibility,
            start_date: itinerary.start_date,
            end_date: itinerary.end_date,
            photo_url: photoURL,
        };
        console.log("update itinerary photo", neededItinerary);
        const token = await getToken();
        const response = await fetch(
            `${NEXT_PUBLIC_BACKEND_URL}/api/itinerary/${itinerary.id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(neededItinerary),
                cache: "no-store",
            }
        );

        if (!response.ok) {
            console.error(
                `Failed to update itinerary: ${response.status} ${response.statusText}`
            );
            return undefined;
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error updating itinerary:", error);
        return undefined;
    }
}
