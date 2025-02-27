"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { LocationSearch } from "./location-search";
import { useState } from "react";
import { Activity, Itinerary, PlaceDetails } from "@/lib/types";
import { addActivity } from "@/lib/activityHandler";
import { toast } from "sonner";
import { getToken } from "@/lib/auth";

const NEXT_PUBLIC_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const formSchema = z.object({
    notes: z.string().optional(),
});

export default function AddPlaceDialog({
    itinerary,
    activities,
}: {
    itinerary: Itinerary;
    activities: Activity[];
}) {
    // PlaceDetailsResults stores the response from the backend API
    const [placeDetailsResults, setPlaceDetailsResults] = useState<
        PlaceDetails[]
    >([]);
    // AutoCompleteResults stores the titles of the places (passed to the CountrySearch component dropdown list)
    const [autoCompleteResults, setAutoCompleteResults] = useState<string[]>(
        []
    );
    const [open, setOpen] = useState(false); // State to control dialog visibility
    const [query, setQuery] = useState("");

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            notes: "",
        },
    });
    // FetchPlaces function fetches the places from the backend API
    const fetchPlaces = async (query: string) => {
        if (!query) return;
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
                    search: query,
                    country: itinerary.location,
                }),
                cache: "no-store",
            }
        );
        const data: PlaceDetails[] = await response.json();
        console.log(data);
        if (!data) console.log("Error fetching google places api response");
        return data;
    };

    // OnSearch function is called when the user types in the search bar and updates countrySearch 's dropdown list
    const onSearch = async (query: string) => {
        const data = await fetchPlaces(query);
        console.log(data);
        if (!data) {
            return;
        }
        setPlaceDetailsResults(data);
        setAutoCompleteResults(data.map((place) => place.title));
    };

    // OnSubmit function is called when the user submits the form (itinerary creation)
    function onSubmit(values: z.infer<typeof formSchema>) {
        const selectedPlaceDetails = placeDetailsResults.find(
            (place) => place.title === query
        );
        if (!selectedPlaceDetails) {
            console.error("Selected place details not found");
            return;
        }
        /** [TODO] : Theres mismatch between activity creation & places responses endpoint,
         * cant destructure the response from the backend API as it is not returning the same fields as the activity creation
         */
        const newActivity: Activity = {
            id: Date.now(), // Example: Generating a unique ID
            title: selectedPlaceDetails.title,
            description: values.notes || "",
            itinerary_id: itinerary.id,
            lat: selectedPlaceDetails.lat,
            lon: selectedPlaceDetails.lon,
            expense: 0,
            split: "split",
            sequence: activities.length + 1,
            photo_url: selectedPlaceDetails.image,
            start_date: itinerary.start_date,
            end_date: itinerary.end_date,
            active: true,
            created_at: new Date(),
            place_id: "PLACE_ID_HERE", // You need to assign a real place ID
            formatted_address: selectedPlaceDetails.formattedAddress,
            types: selectedPlaceDetails.types,
            rating: selectedPlaceDetails.rating,
            user_ratings_total: selectedPlaceDetails.userRatingsTotal,
            international_phone_number:
                selectedPlaceDetails.internationalPhoneNumber,
            website: selectedPlaceDetails.website,
            opening_hours: selectedPlaceDetails.openingHours,
            google_maps_url: selectedPlaceDetails.googleMapsUrl,
        };

        const response = addActivity(newActivity);
        if (!response) {
            console.error("Error adding activity");
            toast.error("Error adding activity");
            return;
        }
        toast.success("Activity added successfully");
        setOpen(false);
        window.location.reload();
    }

    return (
        <div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button>Add Place</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Add New Place</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-6"
                        >
                            <FormItem className="space-y-2">
                                <LocationSearch
                                    onSearch={onSearch}
                                    autoCompleteResults={autoCompleteResults}
                                    onSelect={(term) => {
                                        setQuery(term);
                                    }}
                                />
                            </FormItem>
                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel>Notes</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Add any notes about this place"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Optional details about this location
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full">
                                Add to Itinerary
                            </Button>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
