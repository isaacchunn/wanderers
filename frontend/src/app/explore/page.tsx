import Link from "next/link";
import { cookies } from "next/headers";
import { Button } from "@/components/ui/button";
import { ItineraryCarousel } from "@/components/itinerary-carousel";
import { fetchPublicItinerary } from "@/lib/itineraryHandler";
import { Itinerary } from "@/lib/types";
import { Plus } from "lucide-react";

export default async function MyTripsPage() {
    const cookieStore = await cookies();
    const userData = cookieStore.get("user")?.value;

    let publicItinerary: Itinerary[] = [];

    if (userData) {
        publicItinerary = (await fetchPublicItinerary()) || [];
    }
    if (!publicItinerary) {
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
    } else if (publicItinerary.length == 0) {
        return (
            <div className="bg-background p-6 md:p-12 flex items-center justify-items-center">
                <div className="mx-auto max-w-6xl">
                    <h1 className="text-4xl font-bold tracking-tight">Hey there!</h1>
                    <p className="mt-2 text-muted-foreground">
                        There&apos;s nothing out here! Be the first to share your journey!
                    </p>
                </div>
            </div>
        )
    } else {
        return (
            <div className="min-h-screen bg-background">
                <main className="container px-4 py-12">
                    <div className="mb-12 flex items-center justify-between">
                        <div className="flex flex-col space-y-1">
                            <h1 className="text-4xl font-bold tracking-tight">
                                Explore
                            </h1>
                            <p className="mt-2 text-muted-foreground">
                                Explore travel guides and itineraries
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
                        <ItineraryCarousel itineraries={publicItinerary} />
                    </div>
                </main>
            </div>
        );
    }
}
