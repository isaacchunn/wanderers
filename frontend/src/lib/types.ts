export interface Itinerary {
    id: string;
    title: string;
    location: string;
    date: string;
    duration: string;
    image: string;
    participants: number;
}

export interface Location {
    id: string;
    title: string;
    description: string;
    image: string;
    time: string;
}
