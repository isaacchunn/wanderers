"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { useState, useEffect } from "react";
import { createItinerary } from "@/lib/itineraryHandler";
import { VisibilitySelector } from "@/components/visibility-selector";
import { CountrySearch } from "@/components/country-search";
import { EmailInput } from "@/components/email-input";
import { SelectedCountry } from "@/lib/types";
import { toast } from "sonner";
import { DateRangePicker } from "@/components/calendar-picker";

export default function TripPlannerForm() {
    const router = useRouter();
    const [dateRange, setDateRange] = useState<{
        startDate: Date | undefined;
        endDate: Date | undefined;
    }>({
        startDate: undefined,
        endDate: undefined,
    });
    const [title, setTitle] = useState("");
    const [collaborators, setCollaborators] = useState<string[]>([]);
    const [country, setCountry] = useState<SelectedCountry | undefined>(
        undefined
    );
    const [visibility, setVisibility] = useState<"private" | "public">(
        "private"
    );

    useEffect(() => {
        console.log(title, country, dateRange, visibility, collaborators);
    }, [title, country, dateRange, visibility, collaborators]);

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
                collaborators.length > 0
                    ? undefined
                    : "Please add at least one collaborator.",
        };

        // Find the first error and display it
        const firstError = Object.values(errors).find((error) => error);
        if (firstError) {
            toast.error(firstError);
            return;
        }

        const itineraryData = await createItinerary(
            title,
            country!.code.toUpperCase(), // Use ! because we already validated country
            visibility,
            dateRange.startDate,
            dateRange.endDate,
            collaborators
        );

        if (!itineraryData) {
            toast.error("Error creating Itinerary Please try again!");
        } else {
            toast.success("Your itinerary has been successfully created!");
            router.push(`/itinerary/${itineraryData.id}`);
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
                    <label className="font-medium text-sm text-black">
                        Enter the start and end dates of the your desired trip
                    </label>

                    <DateRangePicker
                        onDateChange={(dates) => setDateRange(dates)}
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
                    <label className="text-sm text-muted-foreground">
                        Invite tripmates
                    </label>
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
