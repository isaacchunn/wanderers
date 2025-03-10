"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { LocationSearch } from "./location-search"
import { useState, useEffect, useRef } from "react"
import type { Activity, Itinerary, PlaceDetails } from "@/lib/types"
import { addActivity, editActivity } from "@/lib/activityHandler"
import { toast } from "sonner"
import { getToken } from "@/lib/auth"
import { DateRangePicker } from "@/components/calendar-picker"
import TimePicker from 'react-time-picker'
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';
import { differenceInMilliseconds } from "date-fns"
import { Clock } from "lucide-react";

const NEXT_PUBLIC_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL

const formSchema = z.object({
    notes: z.string().optional(),
})

export default function DialogModal({
    itinerary,
    activities,
    activityToEdit,
}: Readonly<{
    itinerary: Itinerary
    activities: Activity[]
    activityToEdit?: Activity
}>) {
    // State for place details and auto-complete results
    const [placeDetailsResults, setPlaceDetailsResults] = useState<PlaceDetails[]>([])
    const [autoCompleteResults, setAutoCompleteResults] = useState<string[]>([])
    const [query, setQuery] = useState(activityToEdit?.title ?? "")
    const [isSearching, setIsSearching] = useState(false)
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // States for start and end dates with time
    const [dateTimeRange, setDateTimeRange] = useState<{
        startDate: Date | undefined
        endDate: Date | undefined
    }>({
        startDate: activityToEdit?.start_date ? new Date(activityToEdit.start_date) : itinerary.start_date ? new Date(itinerary.start_date) : undefined,
        endDate: activityToEdit?.end_date ? new Date(activityToEdit.end_date) : itinerary.end_date ? new Date(itinerary.end_date) : undefined,
    })

    // Form initialization using react-hook-form
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            notes: activityToEdit?.description ?? "",
        },
    })

    // Fetch places based on search query
    const abortControllerRef = useRef<AbortController | null>(null)
    const retryCountRef = useRef<number>(0)

    // Update the fetchPlaces function to log results and ensure autoCompleteResults is set correctly
    const fetchPlaces = async (query: string): Promise<PlaceDetails[] | undefined> => {
        if (!query || query.length < 1 || isSearching) return undefined

        setIsSearching(true)

        // Clear any existing timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current)
        }

        // Abort the previous request if it exists
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
        }

        // Create a new AbortController instance
        abortControllerRef.current = new AbortController()

        try {
            const token = await getToken()

            const response = await fetch(`${NEXT_PUBLIC_BACKEND_URL}/api/place/search`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    search: query,
                    country: itinerary.location,
                }),
                signal: abortControllerRef.current.signal,
                cache: "no-store",
            })

            if (response.status === 429) {
                // Rate limit hit - implement exponential backoff
                const retryDelay = Math.min(2000 * Math.pow(2, retryCountRef.current), 30000) // Cap at 30 seconds
                retryCountRef.current += 1

                console.log(`Rate limit hit. Retrying in ${retryDelay / 1000} seconds...`)
                toast.warning(`Search rate limit reached. Please wait a moment.`)

                // Set a timeout to retry after the delay
                searchTimeoutRef.current = setTimeout(() => {
                    setIsSearching(false)
                    // Don't automatically retry - let the user try again
                }, retryDelay)

                return undefined
            }

            // Reset retry count on successful request
            retryCountRef.current = 0

            const data: PlaceDetails[] = await response.json()
            if (data) {
                return data
            } else {
                console.error("Error fetching places API response")
                toast.error("Failed to fetch places")
                return undefined
            }
        } catch (error) {
            if (!(error instanceof DOMException && error.name === "AbortError")) {
                console.error("Error fetching places:", error)
                toast.error("Failed to fetch places")
            }
            return undefined
        } finally {
            // Set a timeout to allow searching again after a delay
            searchTimeoutRef.current = setTimeout(() => {
                setIsSearching(false)
            }, 2000) // Wait 2 seconds before allowing another search
        }
    }

    // Handle search with rate limiting
    const handleSearch = async (term: string) => {
        if (term.length >= 1) {
            const data = await fetchPlaces(term)
            if (data) {
                setPlaceDetailsResults(data)
                setAutoCompleteResults(data.map((place) => place.title))
            }
        } else if (!term) {
            setAutoCompleteResults([])
        }
    }

    // When dates change from the DateRangePicker, preserve the time
    const handleDateChange = (newDateRange: {
        startDate: Date | undefined
        endDate: Date | undefined
    }) => {
        if (newDateRange.startDate && dateTimeRange.startDate) {
            newDateRange.startDate.setHours(dateTimeRange.startDate.getHours(), dateTimeRange.startDate.getMinutes(), 0, 0)
        }

        if (newDateRange.endDate && dateTimeRange.endDate) {
            newDateRange.endDate.setHours(dateTimeRange.endDate.getHours(), dateTimeRange.endDate.getMinutes(), 0, 0)
        }

        setDateTimeRange(newDateRange)
    }

    // When start time changes
    const handleStartTimeChange = (newTime: string | null) => {
        if (newTime && dateTimeRange.startDate) {
            const [hours, minutes] = newTime.split(":").map(Number);
            const newStartDate = new Date(dateTimeRange.startDate);
            newStartDate.setHours(hours, minutes, 0, 0);

            setDateTimeRange((prev) => ({
                ...prev,
                startDate: newStartDate,
            }));
        }
    };

    const handleEndTimeChange = (newTime: string | null) => {
        if (newTime && dateTimeRange.endDate) {
            const [hours, minutes] = newTime.split(":").map(Number);
            const newEndDate = new Date(dateTimeRange.endDate);
            newEndDate.setHours(hours, minutes, 0, 0);

            setDateTimeRange((prev) => ({
                ...prev,
                endDate: newEndDate,
            }));
        }
    };

    // Calculate duration in days and hours
    const calculateDuration = () => {
        if (!dateTimeRange.startDate || !dateTimeRange.endDate) return ""

        const diffMs = differenceInMilliseconds(dateTimeRange.endDate, dateTimeRange.startDate)

        // Calculate days and hours
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

        if (days === 0) {
            return `${hours} hour${hours !== 1 ? "s" : ""}`
        } else if (hours === 0) {
            return `${days} day${days !== 1 ? "s" : ""}`
        } else {
            return `${days} day${days !== 1 ? "s" : ""} and ${hours} hour${hours !== 1 ? "s" : ""}`
        }
    }

    // Handle form submission (Add/Edit activity)
    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        // Validate dates
        if (!dateTimeRange.startDate || !dateTimeRange.endDate) {
            toast.error("Please select both start and end dates")
            return
        }

        const selectedPlaceDetails = placeDetailsResults.find((place) => place.title === query)

        if (!selectedPlaceDetails && !activityToEdit) {
            toast.error("Please select a valid place")
            return
        }

        // If no place is selected, use the existing place details from activityToEdit
        const placeDetails = selectedPlaceDetails ?? {
            title: activityToEdit!.title,
            lat: activityToEdit!.lat,
            lon: activityToEdit!.lon,
            image: activityToEdit!.photo_url,
            formattedAddress: activityToEdit!.formatted_address,
            types: activityToEdit!.types,
            rating: activityToEdit!.rating,
            userRatingsTotal: activityToEdit!.user_ratings_total,
            internationalPhoneNumber: activityToEdit!.international_phone_number,
            website: activityToEdit!.website,
            openingHours: activityToEdit?.opening_hours || [],
            googleMapsUrl: activityToEdit!.google_maps_url,
            place_id: activityToEdit!.place_id,
        }

        // If `placeDetails` is still undefined (i.e., editing activity and no place found), return an error
        if (!placeDetails) {
            toast.error("Could not find place details.")
            return
        }

        const newActivity: Activity = {
            id: activityToEdit?.id ?? 0,
            title: placeDetails.title,
            description: values.notes ?? "",
            itinerary_id: itinerary.id,
            lat: placeDetails.lat,
            lon: placeDetails.lon,
            expense: 0,
            split: "split",
            sequence: activities.length + 1,
            photo_url: selectedPlaceDetails ? selectedPlaceDetails.image : activityToEdit!.photo_url,
            start_date: dateTimeRange.startDate instanceof Date ? dateTimeRange.startDate : new Date(new Date().setHours(0, 0, 0, 0)),
            end_date: dateTimeRange.endDate instanceof Date ? dateTimeRange.endDate : new Date(new Date().setHours(23, 59, 59, 999)),
            active: true,
            created_at: new Date(),
            place_id: "PLACE_ID_HERE",
            formatted_address: selectedPlaceDetails
                ? selectedPlaceDetails.formattedAddress
                : activityToEdit!.formatted_address,
            types: placeDetails.types,
            rating: placeDetails.rating,
            user_ratings_total: selectedPlaceDetails
                ? selectedPlaceDetails.userRatingsTotal
                : activityToEdit!.user_ratings_total,
            international_phone_number: selectedPlaceDetails
                ? selectedPlaceDetails.internationalPhoneNumber
                : activityToEdit!.international_phone_number,
            website: placeDetails.website,
            opening_hours: selectedPlaceDetails
                ? selectedPlaceDetails.openingHours || []
                : activityToEdit!.opening_hours || [],
            google_maps_url: selectedPlaceDetails ? selectedPlaceDetails.googleMapsUrl : activityToEdit!.google_maps_url,
        }

        try {
            let response
            if (activityToEdit) {
                // Editing existing activity
                response = await editActivity(newActivity)
                if (response) {
                    toast.success("Activity updated successfully")
                } else {
                    toast.error("Error updating activity")
                }
            } else {
                // Adding new activity
                response = await addActivity(newActivity)
                if (response) {
                    toast.success("Activity added successfully")
                } else {
                    toast.error("Error adding activity")
                }
            }

            window.location.reload()
        } catch (error) {
            toast.error("Something went wrong. Please try again.")
            console.error(error)
        }
    }

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current)
            }
            if (abortControllerRef.current) {
                abortControllerRef.current.abort()
            }
        }
    }, [])

    return (
        <div className="w-[450px]">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormItem className="space-y-2">
                        <FormLabel>
                            Location {isSearching && <span className="text-muted-foreground text-xs">(searching...)</span>}
                        </FormLabel>
                        <LocationSearch
                            onSearch={handleSearch}
                            autoCompleteResults={autoCompleteResults}
                            onSelect={(term) => setQuery(term)}
                            initialValue={activityToEdit?.title}
                        />
                        {query && query.length < 3 && (
                            <p className="text-xs text-muted-foreground">Type at least 3 characters to search</p>
                        )}
                    </FormItem>

                    <FormItem className="space-y-2">
                        <FormLabel>Date & Time</FormLabel>
                        <div className="space-y-4">
                            <DateRangePicker
                                itinerary={itinerary}
                                activity={activityToEdit}
                                onDateChange={handleDateChange}
                                initialStartDate={dateTimeRange.startDate}
                                initialEndDate={dateTimeRange.endDate}
                                mode={activityToEdit ? "update-activity" : "create-activity"}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center space-x-2 border-2 rounded-md p-2 px-4">
                                <Clock className="h-4 w-4" />
                                <TimePicker
                                    value={dateTimeRange.startDate instanceof Date ? dateTimeRange.startDate.toTimeString().slice(0, 5) : ""}
                                    onChange={handleStartTimeChange}
                                    disableClock={true}
                                />
                            </div>

                            <div className="flex items-center space-x-2 border-2 rounded-md p-2 px-4">
                                <Clock className="h-4 w-4" />
                                <TimePicker
                                    value={dateTimeRange.endDate instanceof Date ? dateTimeRange.endDate.toTimeString().slice(0, 5) : ""}
                                    onChange={handleEndTimeChange}
                                    disableClock={true}
                                />
                            </div>
                        </div>

                        {dateTimeRange.startDate && dateTimeRange.endDate && (
                            <p className="text-sm text-muted-foreground">Duration: {calculateDuration()}</p>
                        )}
                    </FormItem>

                    <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                            <FormItem className="space-y-2">
                                <FormLabel>Notes</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Add any notes about this place" {...field} />
                                </FormControl>
                                <FormDescription>Optional details about this location</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        className="w-full"
                    >
                        {activityToEdit ? "Update Activity" : "Add to Itinerary"}
                    </Button>

                </form>
            </Form>
        </div>
    )
}