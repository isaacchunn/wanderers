import { BE_Itinerary } from "@/lib/types";

// To fetch an itinerary from the server using the itinerary ID
export async function fetchUserItinerary(
    ownerId: number | null
): Promise<BE_Itinerary | undefined> {
    try {
        const response = await fetch(
            `http://localhost:4000/api/itinerary/${ownerId}/created`,
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

        const data: BE_Itinerary = await response.json();
        console.log("ItineraryUser - Fetched user's itinerary:", data);
        return data;
    } catch (error) {
        console.error("ItineraryUser - Error fetching user's itinerary:", error);
    }
}