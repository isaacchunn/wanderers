import { Itinerary } from "@/lib/types";

// To fetch an itinerary from the server using the itinerary ID
export async function fetchPublicItinerary(
): Promise<Itinerary | undefined> {
    try {
        const response = await fetch(
            `http://localhost:4000/api/public/itinerary/`,
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
        console.log("ItineraryPublic - Fetched public itinerary:", data);
        return data;
    } catch (error) {
        console.error("ItineraryPublic - Error fetching public itinerary:", error);
    }
}