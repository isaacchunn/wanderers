import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Plus, Users2 } from "lucide-react";
import { fetchUserItinerary } from "@/lib/itineraryHandler";
import { fetchPublicItinerary } from "@/lib/itineraryHandler";

import { Itinerary } from "@/lib/types";
import { getDate } from "date-fns";

export default async function HomePage() {
    const ownerId = 1;
    const userItinerary: Itinerary[] =
        (await fetchUserItinerary(ownerId)) || [];
    const publicItinerary: Itinerary[] = (await fetchPublicItinerary()) || [];

    if (!(userItinerary || publicItinerary)) {
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
                                Your Itineraries
                            </h1>
                            <text className="mt-2 text-muted-foreground">
                                Plan and organize your upcoming adventures
                            </text>
                        </div>
                        <Link href="/create-itinerary">
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                New Itinerary
                            </Button>
                        </Link>
                    </div>

                    <Carousel
                        opts={{
                            align: "start",
                            loop: true,
                        }}
                        className="w-full"
                    >
                        <CarouselContent className="-ml-2 md:-ml-4">
                            {userItinerary.map((userI) => (
                                <CarouselItem
                                    key={userI.id}
                                    className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3"
                                >
                                    <Link href={`/itinerary/${userI.id}`}>
                                        <Card className="overflow-hidden transition-colors hover:bg-muted/50">
                                            <CardContent className="p-0">
                                                <div className="relative aspect-[4/3] w-full">
                                                    {userI.photos.map(
                                                        (image, index) => (
                                                            <Image
                                                                key={index}
                                                                src={
                                                                    image.url ||
                                                                    "/placeholder.svg"
                                                                }
                                                                alt={
                                                                    userI.title
                                                                }
                                                                fill
                                                                className="object-cover"
                                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                                priority
                                                            />
                                                        )
                                                    )}
                                                </div>
                                                <div className="space-y-3 p-4">
                                                    <h2 className="line-clamp-1 text-xl font-semibold tracking-tight">
                                                        {userI.title}
                                                    </h2>
                                                    <div className="space-y-2 text-sm text-muted-foreground">
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="h-4 w-4" />
                                                            <span>
                                                                {userI.location}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-4 w-4" />
                                                            <span>
                                                                {`${new Date(userI.start_date).toLocaleDateString()} - ${new Date(userI.end_date).toLocaleDateString()}`}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <Clock className="h-4 w-4" />
                                                            <span>
                                                                {`${Math.floor((getDate(userI.end_date) - getDate(userI.start_date)) / (1000 * 60 * 60 * 24)) + 1} Day(s)`}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Users2 className="h-4 w-4" />
                                                            <span>
                                                                {
                                                                    userI
                                                                        .collaborators
                                                                        .length
                                                                }{" "}
                                                                {userI
                                                                    .collaborators
                                                                    .length > 1
                                                                    ? "Participants"
                                                                    : "Participant"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="hidden md:flex" />
                        <CarouselNext className="hidden md:flex" />
                    </Carousel>

                    <div className="mt-12">
                        <h2 className="mb-6 text-4xl font-bold tracking-tight">
                            Explore
                        </h2>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {publicItinerary.map((publicI) => (
                                <Link
                                    key={publicI.id}
                                    href={`/itinerary/${publicI.id}`}
                                >
                                    <Card className="overflow-hidden transition-colors hover:bg-muted/50">
                                        <CardContent className="p-0">
                                            <div className="relative aspect-[4/3] w-full">
                                                {publicI.photos.map(
                                                    (image, index) => (
                                                        <Image
                                                            key={index}
                                                            src={
                                                                image.url ||
                                                                "/placeholder.svg"
                                                            }
                                                            alt={publicI.title}
                                                            fill
                                                            className="object-cover"
                                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                            priority
                                                        />
                                                    )
                                                )}
                                            </div>
                                            <div className="space-y-3 p-4">
                                                <h3 className="line-clamp-1 text-xl font-semibold tracking-tight">
                                                    {publicI.title}
                                                </h3>
                                                <div className="space-y-2 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4" />
                                                        <span>
                                                            {publicI.location}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>
                                                            {`${new Date(publicI.start_date).toLocaleDateString()} - ${new Date(publicI.end_date).toLocaleDateString()}`}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        );
    }
}
