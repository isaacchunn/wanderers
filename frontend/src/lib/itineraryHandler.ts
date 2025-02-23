import { Itinerary } from "@/lib/types";

const NEXT_PUBLIC_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function fetchItineraryById(
    itineraryId: string | null
): Promise<Itinerary | undefined> {
    try {
        const response = await fetch(
            `${NEXT_PUBLIC_BACKEND_URL}/api/itinerary/${itineraryId}`,
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
        console.log("ItineraryHandler - Fetched itinerary:", data);
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
        console.log("ItineraryHandler - Fetched itinerary:", data);
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
        console.log("ItineraryPublic - Fetched public itinerary:", data);
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
        const response = await fetch(
            `${NEXT_PUBLIC_BACKEND_URL}/api/itinerary/${ownerId}/created`,
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
        console.log("ItineraryUser - Fetched user's itinerary:", data);
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
        const response = await fetch(
            `${NEXT_PUBLIC_BACKEND_URL}/api/itinerary/collaborated`,
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
        console.log(
            "ItineraryCollaborator - Fetched user's collaborated itinerary:",
            data
        );
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
        const response = await fetch(
            `${NEXT_PUBLIC_BACKEND_URL}/api/itinerary/`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
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
                `Failed to create itinerary: ${response.status} ${response.statusText}${
                    errorData ? ` - ${JSON.stringify(errorData)}` : ""
                }`
            );
        }

        const data = await response.json();

        if (!data || !data.id) {
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
        const response = await fetch(
            `${NEXT_PUBLIC_BACKEND_URL}/api/itinerary/${itineraryId}`,
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
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
        const response = await fetch(
            `${NEXT_PUBLIC_BACKEND_URL}/api/itinerary/${id}/restore`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
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
export async function updateItinerary(
    itinerary: Itinerary
): Promise<Itinerary | undefined> {
    try {
        const response = await fetch(
            `${NEXT_PUBLIC_BACKEND_URL}/api/itinerary/${itinerary.id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(itinerary),
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
