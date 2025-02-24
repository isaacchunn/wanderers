"use client";

import React from "react";
import { CountrySearch } from "@/components/autocomplete-search";
import { SortableItinerary } from "./sortable-itinerary";
import { addActivity } from "@/lib/activityHandler";
import { Itinerary } from "@/lib/types";

export function ActivityContainer({
    itinerary,
}: {
    itinerary: Readonly<Itinerary>;
}) {
    const handleSearch = async (searchTerm: string) => {
        const search = { search: searchTerm, country: "kr" }; //hardcoded country code for now.
        const activity = await addActivity(search);
        console.log(activity);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between">
                <CountrySearch onSearch={handleSearch} />
            </div>
            <SortableItinerary />
        </div>
    );
}
