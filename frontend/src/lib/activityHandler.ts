import { Search } from "@/lib/types";
import { BACKEND_URL } from "@/lib/utils";

export async function addActivity(search: Search): Promise<object | undefined> {
    console.log("Activity - Adding activity:", search);
    try {
        const response = await fetch(`${BACKEND_URL}/api/place/search`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(search),
            cache: "no-store",
        });

        if (!response.ok) {
            console.log(
                `Activity - Failed to add Activity: ${response.status} ${response.statusText}`
            );
        }

        const data: object = await response.json();
        console.log("Activity - Fetched Google Places Response:", data);
        return data;
    } catch (error) {
        console.error(
            "Activity - Failed Google Places Response:",
            error instanceof Error ? error.message : error
        );
        return undefined;
    }
}
export async function getActivity(id: string): Promise<object[] | undefined> {
    console.log("Activity - Retrieving activity:", id);
    try {
        const response = await fetch(
            `${BACKEND_URL}/api/activity/itinerary/${id}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                cache: "no-store",
            }
        );

        if (!response.ok) {
            console.log(
                `Failed to retrieve Activity: ${response.status} ${response.statusText}`
            );
            return undefined;
        }
        const data: object[] = await response.json();
        console.log("Activity - Successfully retrieved activity:", data);
        return data;
    } catch (error) {
        console.error(
            "Activity - Failed to retrieve activity:",
            error instanceof Error ? error.message : error
        );
        return undefined;
    }
}

export async function deleteActivity(id: string): Promise<boolean> {
    console.log("Activity - Deleting activity:", id);
    try {
        const response = await fetch(
            `${BACKEND_URL}/api/activity/${id}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                cache: "no-store",
            }
        );

        if (!response.ok) {
            console.log(
                `Failed to delete Activity: ${response.status} ${response.statusText}`
            );
            return false;
        }
        console.log("Activity - Successfully deleted activity:");
        return true;
    } catch (error) {
        console.error(
            "Activity - Failed to delete activity:",
            error instanceof Error ? error.message : error
        );
        return false;
    }
}
