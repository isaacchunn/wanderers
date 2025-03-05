// Types to be updated as per the backend response [PLACEHOLDER INTERFACE FOR NOW]
// This file contains the types that are used in the frontend

export interface Itinerary {
    id: number;
    created_at: Date;
    updated_at: Date;
    title: string;
    location: string;
    owner_id: number;
    visibility: string;
    start_date: Date;
    end_date: Date;
    active: boolean;
    photo_url: string;
    collaborators: { id: number; email: string }[];

    _count: {
        votes: number;
    };
}

export interface Activity {
    id: number;
    title: string;
    description: string;
    itinerary_id: number;
    lat: number;
    lon: number;
    expense: number;
    split: string;
    sequence: number;
    photo_url: string;
    start_date: Date;
    end_date: Date;
    active: true;
    created_at: Date;
    place_id: string;
    formatted_address: string;
    types: string[];
    rating: number;
    user_ratings_total: number;
    international_phone_number: string;
    website: string;
    opening_hours: string[];
    google_maps_url: string;
}

export interface PlaceDetails {
    title: string;
    lat: number;
    lon: number;
    image: string;
    types: string[];
    internationalPhoneNumber: string;
    website: string;
    formattedAddress: string;
    userRatingsTotal: number;
    rating: number;
    openingHours: string[];
    googleMapsUrl: string;
}

export interface Search {
    search: string;
    country: string;
}

export interface Country {
    id: number;
    alpha2: string;
    alpha3: string;
    name: string;
}

export interface SelectedCountry {
    name: string;
    code: string;
}