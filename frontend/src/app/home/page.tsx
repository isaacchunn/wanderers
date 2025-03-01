import Link from "next/link";
import { cookies } from "next/headers";
import { Button } from "@/components/ui/button";
import { ItineraryCarousel } from "@/components/itinerary-carousel";
import {
    fetchUserItinerary,
    fetchPublicItinerary,
    fetchCollabItinerary,
} from "@/lib/itineraryHandler";
import { Itinerary } from "@/lib/types";
import { Plus } from "lucide-react";

export default async function HomePage() {
    const cookieStore = await cookies();
    const userData = cookieStore.get("user")?.value;

    let userItinerary: Itinerary[] = [];
    let publicItinerary: Itinerary[] = [];
    let CollabItinerary: Itinerary[] = [];

    if (userData) {
        const jsonUserData = JSON.parse(userData);
        userItinerary = (await fetchUserItinerary(jsonUserData.id)) || [];
        publicItinerary = (await fetchPublicItinerary()) || [];
        CollabItinerary = (await fetchCollabItinerary()) || [];
    }

    if (!(userItinerary || publicItinerary || CollabItinerary)) {
        return (
            <div className="bg-background p-6 md:p-12 flex items-center justify-items-center">
                <div className="mx-auto max-w-6xl">
                    <h1 className="text-4xl font-bold tracking-tight">Error</h1>
                    <p className="mt-2 text-muted-foreground">
                        There was an error fetching the itinerary data. Please
                        try again later.
                    </p>
                </div>
            </div>
        );
    } else {
        return (
            <div className="min-h-screen bg-background">
                <main className="container px-4 py-12">
                    <div className="mb-12 flex items-center justify-between">
                        <div className="flex flex-col space-y-1">
                            <h1 className="text-4xl font-bold tracking-tight">
                                Welcome to Wanderers!
                            </h1>
                            <p className="mt-2 text-muted-foreground">
                                Plan and organize your upcoming adventures
                            </p>
                        </div>
                        <Link href="/create-itinerary">
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                New Itinerary
                            </Button>
                        </Link>
                    </div>

                    <div className="flex flex-col">
                        <h2 className="mb-6 text-4xl font-bold tracking-tight">
                            Your Itineraries
                        </h2>
                        {userItinerary.length === 0 ? (
                            <p className="text-muted-foreground">There's nothing out here! Please create itineraries to begin your journey!</p>
                        ) : (
                            <ItineraryCarousel itineraries={userItinerary} />
                        )}
                    </div>
                    <div className="mt-12">
                        <h2 className="mb-6 text-4xl font-bold tracking-tight">
                            Collabs
                        </h2>
                        {CollabItinerary.length === 0 ? (
                            <p className="text-muted-foreground">There's nothing out here! Bump your friends to invite you for a trip planning session!</p>
                        ) : (
                            <ItineraryCarousel itineraries={CollabItinerary} />
                        )}
                    </div>
                    <div className="mt-12">
                        <h2 className="mb-6 text-4xl font-bold tracking-tight">
                            Explore
                        </h2>
                        {publicItinerary.length === 0 ? (
                            <p className="text-muted-foreground">There's nothing out here! Be the first to share your journey!</p>
                        ) : (
                            <ItineraryCarousel itineraries={publicItinerary} />
                        )}
                    </div>
                </main>
            </div>
        );
    }
}
