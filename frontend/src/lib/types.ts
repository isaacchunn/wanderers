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
    placeDetails?: PlaceDetails;
}

export interface PlaceDetails {
    place_id: string;
    name: string;
    formatted_address: string;
    formatted_phone_number?: string;
    international_phone_number?: string;
    website?: string;
    rating?: number;
    user_ratings_total?: number;
    price_level?: number; // 0 to 4
    opening_hours?: {
        weekday_text: string[];
        open_now?: boolean;
    };
    photos?: {
        photo_reference: string;
        height: number;
        width: number;
    }[];
    address_components: {
        long_name: string;
        short_name: string;
        types: string[];
    }[];
    geometry: {
        location: {
            lat: number;
            lng: number;
        };
    };
    reviews?: {
        author_name: string;
        rating: number;
        relative_time_description: string;
        text: string;
        profile_photo_url: string;
    }[];
    types?: string[];
}
