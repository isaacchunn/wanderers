import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Location, Itinerary, PlaceDetails } from "./types";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const initialLocations: Location[] = [
    {
        id: "1",
        title: "Eiffel Tower",
        description: "Iconic iron lattice tower on the Champ de Mars in Paris",
        image: "/placeholder.svg?height=200&width=400",
        time: "09:00 AM",
    },
    {
        id: "2",
        title: "Louvre Museum",
        description:
            "World's largest art museum and historic monument in Paris",
        image: "/placeholder.svg?height=200&width=400",
        time: "11:30 AM",
    },
    {
        id: "3",
        title: "Notre-Dame Cathedral",
        description: "Medieval Catholic cathedral on the Île de la Cité",
        image: "/placeholder.svg?height=200&width=400",
        time: "02:00 PM",
    },
    {
        id: "4",
        title: "Arc de Triomphe",
        description: "One of the most famous monuments in Paris",
        image: "/placeholder.svg?height=200&width=400",
        time: "04:30 PM",
    },
];

// Mock data - aims to mimic the structure of the the returned JSON format from Google Places API (Not exact)
export const mockItineraries: Itinerary[] = [
    {
        id: "paris-2024",
        title: "Paris Adventure",
        location: "Paris, France",
        date: "Mar 15-20, 2024",
        duration: "6 days",
        image: "/placeholder.svg?height=400&width=600",
        participants: 4,
    },
    {
        id: "tokyo-2024",
        title: "Tokyo Explorer",
        location: "Tokyo, Japan",
        date: "Apr 1-8, 2024",
        duration: "8 days",
        image: "/placeholder.svg?height=400&width=600",
        participants: 2,
    },
    {
        id: "nyc-2024",
        title: "New York City Trip",
        location: "New York, USA",
        date: "May 10-15, 2024",
        duration: "6 days",
        image: "/placeholder.svg?height=400&width=600",
        participants: 3,
    },
    {
        id: "rome-2024",
        title: "Roman Holiday",
        location: "Rome, Italy",
        date: "Jun 20-25, 2024",
        duration: "6 days",
        image: "/placeholder.svg?height=400&width=600",
        participants: 2,
    },
    {
        id: "barcelona-2024",
        title: "Barcelona Weekend",
        location: "Barcelona, Spain",
        date: "Jul 5-7, 2024",
        duration: "3 days",
        image: "/placeholder.svg?height=400&width=600",
        participants: 6,
    },
];

export const mockPlaceDetails: PlaceDetails = {
    place_id: "ChIJAQquYc0tdkgRLKxjM-gsP8g",
    name: "Eiffel Tower",
    formatted_address:
        "Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France",
    formatted_phone_number: "+33 892 70 12 39",
    international_phone_number: "+33 892 70 12 39",
    website: "https://www.toureiffel.paris/en",
    rating: 4.6,
    user_ratings_total: 215397,
    price_level: 2,
    opening_hours: {
        weekday_text: [
            "Monday: 9:00 AM – 12:45 AM",
            "Tuesday: 9:00 AM – 12:45 AM",
            "Wednesday: 9:00 AM – 12:45 AM",
            "Thursday: 9:00 AM – 12:45 AM",
            "Friday: 9:00 AM – 12:45 AM",
            "Saturday: 9:00 AM – 12:45 AM",
            "Sunday: 9:00 AM – 12:45 AM",
        ],
        open_now: true,
    },
    photos: [
        {
            photo_reference: "sample_photo_reference",
            height: 1000,
            width: 1500,
        },
    ],
    address_components: [
        {
            long_name: "Eiffel Tower",
            short_name: "Eiffel Tower",
            types: ["point_of_interest", "establishment"],
        },
        {
            long_name: "Paris",
            short_name: "Paris",
            types: ["locality", "political"],
        },
    ],
    geometry: {
        location: {
            lat: 48.8584,
            lng: 2.2945,
        },
    },
    types: ["tourist_attraction", "point_of_interest", "establishment"],
};
