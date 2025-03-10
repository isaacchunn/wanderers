"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { useState } from "react";
import { createItinerary, updateItinerary } from "@/lib/itineraryHandler";
import { VisibilitySelector } from "@/components/visibility-selector";
import { CountrySearch } from "@/components/country-search";
import { EmailInput } from "@/components/email-input";
import type { PlaceDetails, SelectedCountry } from "@/lib/types";
import { toast } from "sonner";
import { DateRangePicker } from "@/components/calendar-picker";
import { getToken } from "@/lib/auth";

const NEXT_PUBLIC_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function TripPlannerForm() {
    const router = useRouter();
    const [dateRange, setDateRange] = useState<{
        startDate: Date | undefined;
        endDate: Date | undefined;
    }>({
        startDate: new Date(),
        endDate: new Date(),
    });
    const [title, setTitle] = useState("");
    const [collaborators, setCollaborators] = useState<string[]>([]);
    const [country, setCountry] = useState<SelectedCountry | undefined>(
        undefined
    );
    const [visibility, setVisibility] = useState<"private" | "public">(
        "private"
    );

    const handleFormSubmit = async () => {
        const errors: Record<string, string | undefined> = {
            title: title ? undefined : "Title is required.",
            country: country?.code ? undefined : "Please select a country.",
            visibility: visibility
                ? undefined
                : "Visibility setting is required.",
            startDate: dateRange.startDate
                ? undefined
                : "Start date is required.",
            endDate: dateRange.endDate ? undefined : "End date is required.",
            collaborators:
                collaborators.length >= 0
                    ? undefined
                    : "Please add at least one collaborator.",
        };

        // Find the first error and display it
        const firstError = Object.values(errors).find((error) => error);
        if (firstError) {
            toast.error(firstError);
            return;
        }

        try {
            const token = await getToken();
            const response = await fetch(
                `${NEXT_PUBLIC_BACKEND_URL}/api/place/search`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        search: "garden",
                        country: country!.code.toUpperCase(),
                    }),
                    cache: "no-store",
                }
            );
            const data: PlaceDetails[] = await response.json();
            const photo_url = data[0].image;

            const itineraryData = await createItinerary(
                title,
                country!.code.toUpperCase(), // Use ! because we already validated country
                visibility,
                dateRange.startDate,
                dateRange.endDate,
                collaborators
            );
            if (!itineraryData) throw new Error("Failed to create itinerary");
            const updateResponse = await updateItinerary(
                itineraryData,
                photo_url
            );
            if (!updateResponse)
                throw new Error("Failed to update itinerary photo url");

            toast.success("Your itinerary has been successfully created!");
            router.push(`/itinerary/${itineraryData.id}`);
        } catch (error) {
            console.log(error);
            toast.error("Error creating Itinerary Please try again!");
        }
    };

    return (
        <Card className="w-full max-w-xl mx-auto mt-20">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">
                    Plan a new trip
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <p className="font-medium text-sm text-black">
                        Name your itinerary plan
                    </p>
                    <Input
                        type="text"
                        placeholder="e.g. Winter Wonderland"
                        className="text-base py-6"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <br />
                    <p className="font-medium text-sm text-red-500">
                        Choose a destination to start planning
                    </p>
                    <CountrySearch
                        onCountryChange={(country) => setCountry(country)}
                    />
                </div>

                <div className="space-y-2">
                    <p className="font-medium text-sm text-black">
                        Enter the start and end dates of the your desired trip
                    </p>

                    <DateRangePicker
                        onDateChange={(dates) => setDateRange(dates)}
                        mode="create-itinerary"
                        initialStartDate={dateRange.startDate} // Default to today
                        initialEndDate={
                            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                        } // Default to a week from today
                    />
                </div>

                <div className="space-y-2">
                    <VisibilitySelector
                        onVisibilityChange={(visibility) =>
                            setVisibility(visibility)
                        }
                    />
                </div>

                <div>
                    <p className="text-sm text-muted-foreground">
                        Invite tripmates
                    </p>
                    <EmailInput
                        onEmailChange={(emails) => {
                            setCollaborators(emails);
                        }}
                    />
                </div>

                <div className="space-y-4">
                    <Button
                        onClick={handleFormSubmit}
                        className="w-full py-6 text-base bg-[#FF5D51] hover:bg-[#FF5D51]/90"
                    >
                        Start planning
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
