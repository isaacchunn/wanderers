"use client";

import { Itinerary } from "@/lib/types";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, MapPin, Users2 } from "lucide-react";
import { getTime } from "date-fns";

export function ItineraryCarousel({
    itineraries,
}: {
    readonly itineraries: Readonly<Itinerary[]>;
}) {
    return (
        <Carousel
            opts={{
                align: "start",
                loop: true,
            }}
            className="w-full"
        >
            <CarouselContent className="-ml-2 md:-ml-4">
                {itineraries?.map((itinerary) => (
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
                                                itinerary.photo_url ||
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
                                                    {`${new Date(itinerary.start_date).toLocaleDateString()} - ${new Date(itinerary.end_date).toLocaleDateString()}`}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                <span>
                                                    {`${Math.floor(((getTime(itinerary.end_date) - getTime(itinerary.start_date  )) / 86400000 )) + 1} Day(s)`}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Users2 className="h-4 w-4" />
                                                <span>
                                                    {
                                                        itinerary.collaborators
                                                            .length
                                                    }{" "}
                                                    {itinerary.collaborators
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
    );
}
