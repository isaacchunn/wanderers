import { Itinerary, Activity } from "@/lib/types";
import { getToken } from "@/lib/auth";
const NEXT_PUBLIC_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function addActivity(
    activity: Activity
): Promise<object | undefined> {
    try {
        console.log(activity);
        const token = await getToken();
        const response = await fetch(
            `${NEXT_PUBLIC_BACKEND_URL}/api/activity`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(activity),
                cache: "no-store",
            }
        );

        console.log(response);

        if (!response.ok) {
            console.log(
                `Activity - Failed to add Activity: ${response.status} ${response.statusText}`
            );
        }

        const data: object = await response.json();
        console.log(data);

        return data;
    } catch (error) {
        console.error(
            "Activity - Failed Google Places Response:",
            error instanceof Error ? error.message : error
        );
        return undefined;
    }
}

export async function getActivity(
    id: string | number
): Promise<Activity[] | undefined> {
    try {
        const token = await getToken();
        const response = await fetch(
            `${NEXT_PUBLIC_BACKEND_URL}/api/activity/itinerary/${id}`,
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
            console.log(
                `Failed to retrieve Activity: ${response.status} ${response.statusText}`
            );
            return undefined;
        }
        const data: Activity[] = await response.json();

        return data;
    } catch (error) {
        console.error(
            "Activity - Failed to retrieve activity:",
            error instanceof Error ? error.message : error
        );
        return undefined;
    }
}

export async function deleteActivity(id: string | number): Promise<boolean> {
    try {
        const token = await getToken();
        const response = await fetch(
            `${NEXT_PUBLIC_BACKEND_URL}/api/activity/${id}`,
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
            console.log(
                `Failed to delete Activity: ${response.status} ${response.statusText}`
            );
            return false;
        }

        return true;
    } catch (error) {
        console.error(
            "Activity - Failed to delete activity:",
            error instanceof Error ? error.message : error
        );
        return false;
    }
}

export async function editActivity(
    activity: Activity
): Promise<object | undefined> {
    try {
        console.log(activity);
        const token = await getToken();
        const response = await fetch(
            `${NEXT_PUBLIC_BACKEND_URL}/api/activity/${activity.id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(activity),
                cache: "no-store",
            }
        );
        console.log(response);
        if (!response.ok) {
            console.log(
                `Failed to retrieve Activity: ${response.status} ${response.statusText}`
            );
            return undefined;
        }
        const data: Activity[] = await response.json();

        return data;
    } catch (error) {
        console.error(
            "Activity - Failed to edit activity:",
            error instanceof Error ? error.message : error
        );
        return undefined;
    }
}

export function adjustActivityDates(
    activity: Activity,
    oldItinerary: Itinerary,
    newItinerary: Itinerary
): Activity {
    let newStartDate = activity.start_date;
    let newEndDate = activity.end_date;

    // When itinerary start date moves later than activity start date
    if (
        newItinerary.start_date > oldItinerary.start_date &&
        activity.start_date < newItinerary.start_date
    ) {
        newStartDate = newItinerary.start_date;
    }

    // When itinerary end date moves earlier than activity end date
    if (
        newItinerary.end_date < oldItinerary.end_date &&
        activity.end_date > newItinerary.end_date
    ) {
        newEndDate = newItinerary.end_date;
    }

    return {
        ...activity,
        start_date: newStartDate,
        end_date: newEndDate,
    };
}
