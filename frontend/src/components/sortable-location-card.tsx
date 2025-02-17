import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Clock,
    DollarSign,
    ExternalLink,
    Globe,
    GripVertical,
    MapPin,
    Phone,
    Star,
} from "lucide-react";
import Image from "next/image";
import { Activity } from "@/lib/types";

interface SortableLocationCardProps {
    activity: Activity;
}

function getPriceLevelText(level: number): string {
    return "€".repeat(level);
}

export function SortableLocationCard({ activity }: SortableLocationCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: activity.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };
    const placeDetails = activity.placeDetails;

    if (!placeDetails) {
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
    }
    return (
        <Card
            ref={setNodeRef}
            style={style}
            className={`relative ${isDragging ? "z-50 shadow-lg" : ""} transition-shadow hover:shadow-md`}
        >
            <CardContent className="p-0">
                <div className="flex gap-4 p-4">
                    <button
                        className="cursor-grab touch-none p-1 opacity-50 hover:opacity-100 active:cursor-grabbing"
                        {...attributes}
                        {...listeners}
                    >
                        <GripVertical className="h-5 w-5" />
                        <span className="sr-only">Drag handle</span>
                    </button>
                    <div className="flex flex-1 gap-4 overflow-hidden sm:flex-row">
                        <div className="relative h-[200px] w-[300px] flex-none overflow-hidden rounded-md">
                            <Image
                                src={activity.image || "/placeholder.svg"}
                                alt={activity.title}
                                className="object-cover"
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                priority
                            />
                            {placeDetails.price_level !== undefined && (
                                <Badge
                                    variant="secondary"
                                    className="absolute left-2 top-2 bg-background/80 backdrop-blur-sm"
                                >
                                    <DollarSign className="mr-1 h-3 w-3" />
                                    {getPriceLevelText(
                                        placeDetails.price_level
                                    )}
                                </Badge>
                            )}
                            {placeDetails.rating && (
                                <Badge
                                    variant="secondary"
                                    className="absolute right-2 top-2 bg-background/80 backdrop-blur-sm"
                                >
                                    <Star className="mr-1 h-3 w-3 fill-current text-yellow-400" />
                                    {placeDetails.rating}
                                    <span className="ml-1 text-xs text-muted-foreground">
                                        (
                                        {placeDetails.user_ratings_total?.toLocaleString()}
                                        )
                                    </span>
                                </Badge>
                            )}
                        </div>
                        <div className="flex-1 space-y-4">
                            <div>
                                <div className="flex items-start justify-between gap-4">
                                    <h3 className="font-semibold leading-none tracking-tight">
                                        {activity.title}
                                    </h3>
                                    <div className="text-sm text-muted-foreground">
                                        {activity.time}
                                    </div>
                                </div>
                                <div className="mt-2 flex flex-wrap gap-1">
                                    {placeDetails.types?.map((type) => (
                                        <Badge
                                            key={type}
                                            variant="outline"
                                            className="capitalize"
                                        >
                                            {type.replace(/_/g, " ")}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex items-start gap-2">
                                    <MapPin className="h-4 w-4 flex-shrink-0" />
                                    <span className="text-muted-foreground">
                                        {placeDetails.formatted_address}
                                    </span>
                                </div>
                                {placeDetails.opening_hours && (
                                    <div className="flex items-start gap-2">
                                        <Clock className="h-4 w-4 flex-shrink-0" />
                                        <div className="text-muted-foreground">
                                            <div className="font-medium">
                                                {placeDetails.opening_hours
                                                    .open_now
                                                    ? "Open now"
                                                    : "Closed"}
                                            </div>
                                            <div className="mt-1 text-xs">
                                                {
                                                    placeDetails.opening_hours
                                                        .weekday_text[0]
                                                }
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {placeDetails.formatted_phone_number && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4" />
                                        <span className="text-muted-foreground">
                                            {
                                                placeDetails.formatted_phone_number
                                            }
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2">
                                {placeDetails.website && (
                                    <Button size="sm" variant="outline" asChild>
                                        <a
                                            href={placeDetails.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Globe className="mr-2 h-4 w-4" />
                                            Website
                                        </a>
                                    </Button>
                                )}
                                <Button size="sm" variant="outline" asChild>
                                    <a
                                        href={`https://www.google.com/maps/place/?q=place_id:${placeDetails.place_id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        View on Maps
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
