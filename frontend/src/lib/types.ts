// [TODO] : Types to be updated as per the backend response [PLACEHOLDER INTERFACE FOR NOW]
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
    image?: string;
    types?: string[];
    internationalPhoneNumber?: string;
    website?: string;
    formattedAddress?: string;
    userRatingsTotal?: number;
    rating?: number;
    googleMapsUrl?: string;
}
// export interface Activity {
//     id: string;
//     title: string;
//     description: string;
//     image: string;
//     time: string;
//     placeDetails?: PlaceDetails;
// }
export interface PlaceDetailsNew {
    title: string;
    lat: number;
    lon: number;
    image?: string;
    types?: string[];
    internationalPhoneNumber?: string;
    website?: string;
    formattedAddress?: string;
    userRatingsTotal?: number;
    rating?: number;
    googleMapsUrl?: string;
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
