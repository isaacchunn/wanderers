import { Search } from "@/lib/types";

export async function addActivity(search: Search): Promise<object | undefined> {
    console.log("Activity - Adding activity:", search);
    try {
        const response = await fetch(`http://localhost:4000/api/place/search`, {
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

        const activityResponse: object = await response.json();
        console.log(
            "Activity - Fetched Google Places Response:",
            activityResponse
        );
        return activityResponse;
    } catch (error) {
        console.error(
            "Activity - Failed Google Places Response:",
            error instanceof Error ? error.message : error
        );
        return undefined;
    }
}

export async function deleteActivity(id: string): Promise<boolean> {
    console.log("Activity - Deleting activity:", id);
    try {
        const response = await fetch(
            `http://localhost:4000/api/activity/${id}`,
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
