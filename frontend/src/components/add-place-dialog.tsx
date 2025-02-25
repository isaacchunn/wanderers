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
import { CountrySearch } from "./autocomplete-search";
import { useState } from "react";
import {
    Activity,
    Itinerary,
    PlaceDetails,
    PlaceDetailsNew,
} from "@/lib/types";
import { addActivity } from "@/lib/activityHandler";
import { toast } from "sonner";

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
        PlaceDetailsNew[]
    >([]);
    // AutoCompleteResults stores the titles of the places (passed to the CountrySearch component dropdown list)
    const [autoCompleteResults, setAutoCompleteResults] = useState<string[]>(
        []
    );
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
        const response = await fetch(
            `${NEXT_PUBLIC_BACKEND_URL}/api/place/search`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    search: query,
                    country: itinerary.location,
                }),
                cache: "no-store",
            }
        );
        const data: PlaceDetailsNew[] = await response.json();
        console.log(data);
        if (!data) console.log("Error fetching google places api response");
        return data;
    };

    // OnSearch function is called when the user types in the search bar and updates countrySearch 's dropdown list
    const onSearch = async (query: string) => {
        const data = await fetchPlaces(query);
        console.log("Backened API places Response:", data);
        if (!data) return;
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
        const newActitivity: Activity = {
            id: 1,
            title: selectedPlaceDetails.title,
            description: values.notes || "",
            itinerary_id: itinerary.id,
            lat: selectedPlaceDetails.lat,
            lon: selectedPlaceDetails.lon,
            expense: 0,
            split: "split",
            sequence: activities.length + 1,
            photo_url: "https://picsum.photos/seed/{seed}/300/300",
            image: selectedPlaceDetails.image,
            types: selectedPlaceDetails.types,
            internationalPhoneNumber:
                selectedPlaceDetails.internationalPhoneNumber,
            website: selectedPlaceDetails.website,
            formattedAddress: selectedPlaceDetails.formattedAddress,
            userRatingsTotal: selectedPlaceDetails.userRatingsTotal,
            rating: selectedPlaceDetails.rating,
            googleMapsUrl: selectedPlaceDetails.googleMapsUrl,
            start_date: itinerary.start_date,
            end_date: itinerary.end_date,
        };
        console.log("NEW ACTIVITY", newActitivity);
        // console.log("Selected Place Details:", selectedPlaceDetails);
        const response = addActivity(newActitivity);
        if (!response) {
            console.error("Error adding activity");
            toast.error("Error adding activity");
            return;
        }
        console.log("Activity added successfully");
        toast.success("Activity added successfully");
    }

    return (
        <div>
            <Dialog>
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
                                <CountrySearch
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
