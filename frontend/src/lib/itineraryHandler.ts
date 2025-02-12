import { Itinerary } from "@/lib/types";

// To fetch an itinerary from the server using the itinerary ID
export async function fetchItinerary(
    itineraryId: string | null
): Promise<Itinerary | undefined> {
    try {
        const response = await fetch(
            `http://localhost:4000/api/public/itinerary/${itineraryId}`,
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

        const data = await response.json();
        console.log("ItineraryHandler - Fetched itinerary:", data);
        return data;
    } catch (error) {
        console.error("ItineraryHandler - Error fetching itinerary:", error);
    }
}
