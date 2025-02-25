import { Activity } from "@/lib/types";
import { BACKEND_URL } from "@/lib/utils";
const NEXT_PUBLIC_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function addActivity(
    activity: Activity
): Promise<object | undefined> {
    console.log("Activity - Adding activity:", activity);
    try {
        const response = await fetch(
            `${NEXT_PUBLIC_BACKEND_URL}/api/activity`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(activity),
                cache: "no-store",
                next: { revalidate: 10 },
            }
        );

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

export async function getActivity(id: string): Promise<Activity[] | undefined> {
    try {
        const response = await fetch(
            `${NEXT_PUBLIC_BACKEND_URL}/api/activity/itinerary/${id}`,
            {
                method: "GET",
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
        const data: Activity[] = await response.json();
        console.log(
            `ActivityHandler - Fetched Activities for itinerary id ${id}:`,
            data
        );
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
        const response = await fetch(`${BACKEND_URL}/api/activity/${id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            cache: "no-store",
            next: { revalidate: 10 },
        });

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
