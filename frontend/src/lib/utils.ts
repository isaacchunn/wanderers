import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Location, Itinerary } from "./types";

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
