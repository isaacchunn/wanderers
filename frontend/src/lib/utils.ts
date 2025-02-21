import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Activity } from "./types";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "./.env") });

export const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const mockActivity: Activity[] = [
    {
        id: "1",
        title: "Eiffel Tower",
        description: "Iconic iron lattice tower on the Champ de Mars in Paris",
        image: "/placeholder.svg?height=200&width=400",
        time: "09:00 AM",
        placeDetails: {
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
        },
    },
    {
        id: "2",
        title: "Louvre Museum",
        description:
            "World's largest art museum and historic monument in Paris",
        image: "/placeholder.svg?height=200&width=400",
        time: "11:30 AM",
        placeDetails: {
            place_id: "ChIJP3Ra6m7z5kcR8VdP3rVqG3c",
            name: "Louvre Museum",
            formatted_address: "Rue de Rivoli, 75001 Paris, France",
            formatted_phone_number: "+33 1 40 20 50 50",
            international_phone_number: "+33 1 40 20 50 50",
            website: "https://www.louvre.fr/en",
            rating: 4.7,
            user_ratings_total: 370001,
            price_level: 3,
            opening_hours: {
                weekday_text: [
                    "Monday: Closed",
                    "Tuesday: 9:00 AM – 6:00 PM",
                    "Wednesday: 9:00 AM – 6:00 PM",
                    "Thursday: 9:00 AM – 9:45 PM",
                    "Friday: 9:00 AM – 6:00 PM",
                    "Saturday: 9:00 AM – 6:00 PM",
                    "Sunday: 9:00 AM – 6:00 PM",
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
                    long_name: "Louvre Museum",
                    short_name: "Louvre Museum",
                    types: ["museum", "point_of_interest", "establishment"],
                },
                {
                    long_name: "Paris",
                    short_name: "Paris",
                    types: ["locality", "political"],
                },
            ],
            geometry: {
                location: {
                    lat: 48.8606,
                    lng: 2.3376,
                },
            },
            types: ["museum", "point_of_interest", "establishment"],
        },
    },
    {
        id: "3",
        title: "Notre-Dame Cathedral",
        description: "Medieval Catholic cathedral on the Île de la Cité",
        image: "/placeholder.svg?height=200&width=400",
        time: "02:00 PM",
        placeDetails: {
            place_id: "ChIJXwzL4wKbdkgR6RObyY5NSnA",
            name: "Notre-Dame Cathedral",
            formatted_address:
                "6 Parvis Notre-Dame - Pl. Jean-Paul II, 75004 Paris, France",
            formatted_phone_number: "+33 1 42 34 56 10",
            international_phone_number: "+33 1 42 34 56 10",
            website: "https://www.notredamedeparis.fr/en/",
            rating: 4.7,
            user_ratings_total: 123456,
            price_level: 2,
            opening_hours: {
                weekday_text: [
                    "Monday: 8:00 AM – 6:00 PM",
                    "Tuesday: 8:00 AM – 6:00 PM",
                    "Wednesday: 8:00 AM – 6:00 PM",
                    "Thursday: 8:00 AM – 6:00 PM",
                    "Friday: 8:00 AM – 6:00 PM",
                    "Saturday: 8:00 AM – 6:00 PM",
                    "Sunday: 8:00 AM – 6:00 PM",
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
                    long_name: "Notre-Dame Cathedral",
                    short_name: "Notre-Dame Cathedral",
                    types: ["church", "point_of_interest", "establishment"],
                },
                {
                    long_name: "Paris",
                    short_name: "Paris",
                    types: ["locality", "political"],
                },
            ],
            geometry: {
                location: {
                    lat: 48.852968,
                    lng: 2.349902,
                },
            },
            types: ["church", "point_of_interest", "establishment"],
        },
    },
    {
        id: "4",
        title: "Arc de Triomphe",
        description: "One of the most famous monuments in Paris",
        image: "/placeholder.svg?height=200&width=400",
        time: "04:30 PM",
        placeDetails: {
            place_id: "ChIJe0wY1eTt5kcRkL3msdRuXoA",
            name: "Arc de Triomphe",
            formatted_address: "Place Charles de Gaulle, 75008 Paris, France",
            formatted_phone_number: "+33 1 55 37 73 77",
            international_phone_number: "+33 1 55 37 73 77",
            website: "https://www.arcdetriompheparis.com/",
            rating: 4.7,
            user_ratings_total: 50000,
            price_level: 2,
            opening_hours: {
                weekday_text: [
                    "Monday: 10:00 AM – 10:30 PM",
                    "Tuesday: 10:00 AM – 10:30 PM",
                    "Wednesday: 10:00 AM – 10:30 PM",
                    "Thursday: 10:00 AM – 10:30 PM",
                    "Friday: 10:00 AM – 10:30 PM",
                    "Saturday: 10:00 AM – 10:30 PM",
                    "Sunday: 10:00 AM – 10:30 PM",
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
                    long_name: "Arc de Triomphe",
                    short_name: "Arc de Triomphe",
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
                    lat: 48.8738,
                    lng: 2.295,
                },
            },
            types: ["point_of_interest", "establishment"],
        },
    },
];
// export const places = ["city hall"];

export const places = [
    "Shibuya Crossing",
    "Meiji Shrine",
    "Senso-ji Temple",
    "Tokyo Tower",
    "Shinjuku Gyoen",
    "Akihabara Electric Town",
    "Tsukiji Outer Market",
    "Ginza Shopping District",
    "Roppongi Hills",
    "Ueno Park & Zoo",
    "Tokyo Skytree",
    "Odaiba",
    "Ghibli Museum",
    "TeamLab Borderless",
    "Yoyogi Park",
    "Asakusa Culture and Tourist Information Center",
    "Rainbow Bridge",
    "Kabukicho",
    "Ryogoku Kokugikan (Sumo Stadium)",
    "Hamarikyu Gardens",
    "Ikebukuro Sunshine City",
    "Edo-Tokyo Museum",
    "Zojoji Temple",
    "Nakameguro (Cherry Blossom Viewing)",
    "Takeshita Street",
    "Tokyo Disneyland",
    "Tokyo DisneySea",
    "Shinjuku Golden Gai",
    "Oedo Antique Market",
    "Tokyo Metropolitan Government Building",
    "Rikugien Garden",
    "Nezu Shrine",
    "Ameya-Yokocho Market",
    "Shimokitazawa (Trendy Neighborhood)",
    "Yanaka Ginza (Old Tokyo Atmosphere)",
    "Sumida Aquarium",
    "Daikanyama T-Site",
    "Todoroki Valley",
    "Hie Shrine",
    "Tokyo Daibutsu (Giant Buddha)",
    "Jindaiji Temple",
    "Kagurazaka (Traditional Alleyways)",
    "Koenji (Vintage Shopping & Live Music)",
    "Mitaka Forest Ghibli Museum",
    "Meguro River (Sakura Viewing)",
    "Nakamise Shopping Street",
    "Tokyo National Museum",
    "National Art Center",
    "Mount Takao (Hiking Spot)",
    "Oedo Onsen Monogatari (Hot Spring Theme Park)",

    // Paris (50 places)
    "Eiffel Tower",
    "Louvre Museum",
    "Notre-Dame Cathedral",
    "Sacré-Cœur Basilica",
    "Champs-Élysées & Arc de Triomphe",
    "Seine River Cruise",
    "Palace of Versailles",
    "Musée d'Orsay",
    "Sainte-Chapelle",
    "Latin Quarter & Panthéon",
    "Montmartre & Place du Tertre",
    "Le Marais & Place des Vosges",
    "Catacombs of Paris",
    "Palais Garnier",
    "Disneyland Paris",
    "Pont Alexandre III",
    "Jardin du Luxembourg",
    "Parc des Buttes-Chaumont",
    "Trocadéro Gardens",
    "Père Lachaise Cemetery",
    "Rue Cler (Local Market Street)",
    "Galeries Lafayette",
    "Rue Saint-Honoré (Luxury Shopping)",
    "Musée Rodin",
    "Conciergerie",
    "Canal Saint-Martin",
    "Bois de Boulogne",
    "Parc Monceau",
    "Musée de l'Orangerie",
    "Fondation Louis Vuitton",
    "Musée Picasso",
    "Centre Pompidou",
    "Saint-Germain-des-Prés",
    "Les Invalides",
    "Moulin Rouge",
    "La Défense (Modern Business District)",
    "Place de la Concorde",
    "Île de la Cité",
    "Île Saint-Louis",
    "Marché aux Puces de Saint-Ouen (Flea Market)",
    "Musée des Arts Décoratifs",
    "Cimetière de Montmartre",
    "Petit Palais",
    "Grand Palais",
    "La Villette",
    "Avenue Montaigne (Luxury Shopping)",
    "Passage des Panoramas",
    "Musée du Quai Branly",
    "Boulevard Saint-Michel",
    "Rue de Rivoli (Shopping & Sightseeing)",
];
