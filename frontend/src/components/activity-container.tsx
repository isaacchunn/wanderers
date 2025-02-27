"use client";

import React, { useEffect } from "react";
import { SortableItinerary } from "@/components/sortable-itinerary";
import { getActivity } from "@/lib/activityHandler";
import { Activity, Itinerary } from "@/lib/types";
import AddPlaceDialog from "@/components/add-place-dialog";

/* eslint-disable */
export function ActivityContainer({
    itinerary,
}: {
    readonly itinerary: Readonly<Itinerary>;
}) {
    const [activities, setActivities] = React.useState<Activity[]>([]);
    useEffect(() => {
        const fetchActivities = async () => {
            const data: Activity[] = (await getActivity("4")) || [];
            data.sort((a, b) => a.sequence - b.sequence);
            setActivities(data);
        };
        fetchActivities();
    }, []);

    return (
        <div className="flex flex-col space-y-6 w-fit">
            <div className="flex justify-end -mt-9">
                <AddPlaceDialog itinerary={itinerary} activities={activities} />
            </div>
            <SortableItinerary fetchedActivities={activities} />
        </div>
    );
}
