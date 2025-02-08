"use client";
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

interface Itinerary {
    id: string;
    title: string;
    location: string;
    date: string;
    duration: string;
    image: string;
    participants: number;
}

const mockItineraries: Itinerary[] = [
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

export default function HomePage() {
    return (
        <div className="min-h-screen bg-background">
            <main className="container px-4 py-12">
                <div className="mb-12 flex items-center justify-between">
                    <div className="flex flex-col space-y-1">
                        <h1 className="text-4xl font-bold tracking-tight">
                            Your Itineraries
                        </h1>
                        <text className="text-muted-foreground">
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
                        {mockItineraries.map((itinerary) => (
                            <CarouselItem
                                key={itinerary.id}
                                className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3"
                            >
                                <Link href={`/itinerary/${itinerary.id}`}>
                                    <Card className="overflow-hidden transition-colors hover:bg-muted/50">
                                        <CardContent className="p-0">
                                            <div className="relative aspect-[4/3] w-full">
                                                <Image
                                                    src={
                                                        itinerary.image ||
                                                        "/placeholder.svg"
                                                    }
                                                    alt={itinerary.title}
                                                    fill
                                                    className="object-cover"
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    priority
                                                />
                                            </div>
                                            <div className="space-y-3 p-4">
                                                <h2 className="line-clamp-1 text-xl font-semibold tracking-tight">
                                                    {itinerary.title}
                                                </h2>
                                                <div className="space-y-2 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4" />
                                                        <span>
                                                            {itinerary.location}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>
                                                            {itinerary.date}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-4 w-4" />
                                                        <span>
                                                            {itinerary.duration}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Users2 className="h-4 w-4" />
                                                        <span>
                                                            {
                                                                itinerary.participants
                                                            }{" "}
                                                            participants
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
                        {mockItineraries.slice(0, 3).map((itinerary) => (
                            <Link
                                key={itinerary.id}
                                href={`/itinerary/${itinerary.id}`}
                            >
                                <Card className="overflow-hidden transition-colors hover:bg-muted/50">
                                    <CardContent className="p-0">
                                        <div className="relative aspect-[4/3] w-full">
                                            <Image
                                                src={
                                                    itinerary.image ||
                                                    "/placeholder.svg"
                                                }
                                                alt={itinerary.title}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            />
                                        </div>
                                        <div className="space-y-3 p-4">
                                            <h3 className="line-clamp-1 text-xl font-semibold tracking-tight">
                                                {itinerary.title}
                                            </h3>
                                            <div className="space-y-2 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4" />
                                                    <span>
                                                        {itinerary.location}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>
                                                        {itinerary.date}
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
