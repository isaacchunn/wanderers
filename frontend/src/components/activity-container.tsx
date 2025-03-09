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
            const data: Activity[] =
                (await getActivity(`${itinerary.id}`)) || [];
            const activeData = data.filter(function (data) {
                return data.active === true;
            });

            activeData.sort((a, b) => a.sequence - b.sequence);
            setActivities(activeData);
        };
        fetchActivities();
    }, []);

    return (
        <div className="flex flex-col space-y-8 w-fit -mt-16">
            <div className="flex justify-end">
                <AddPlaceDialog itinerary={itinerary} activities={activities} />
            </div>
            <SortableItinerary fetchedActivities={activities} />
        </div>
    );
}
