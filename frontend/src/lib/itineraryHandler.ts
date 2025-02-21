import { Itinerary } from "@/lib/types";
import { BACKEND_URL } from "@/lib/utils";

//Retrieve an existing itinerary by its ID.
export async function fetchItinerary(
    itineraryId: string | null
): Promise<Itinerary | undefined> {
    try {
        const response = await fetch(
            `${BACKEND_URL}/api/public/itinerary/${itineraryId}`,
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
            `${BACKEND_URL}/api/public/itinerary/`,
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
    ownerId: number | null
): Promise<Itinerary[] | undefined> {
    try {
        const response = await fetch(
            `${BACKEND_URL}/api/itinerary/${ownerId}/created`,
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
