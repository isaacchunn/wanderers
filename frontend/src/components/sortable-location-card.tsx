import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Calendar,
    Clock,
    ExternalLink,
    Globe,
    GripVertical,
    MapPin,
    Phone,
    Star,
    ChevronDown,
    StickyNote,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { Activity } from "@/lib/types";
import { getTime } from "date-fns";
import { DropdownSetting } from "@/components/dropdown-menuA";

interface SortableLocationCardProps {
    activity: Activity;
}

export function SortableLocationCard({
    activity,
}: Readonly<SortableLocationCardProps>) {
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
    if (!activity) {
        return (
            <div className="bg-background p-6 md:p-12 flex items-center justify-items-center">
                <div className="mx-auto max-w-6xl">
                    <h1 className="text-4xl font-bold tracking-tight">Error</h1>
                    <p className="mt-2 text-muted-foreground">
                        There was an error fetching the activity data. Please
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
            className={`relative ${
                isDragging ? "z-50 shadow-lg" : ""
            } transition-shadow hover:shadow-md`}
        >
            <div className="grid justify-items-end mt-2 mr-3 z-50">
                <DropdownSetting activityId={activity.id} activity={activity} />
            </div>
            <CardContent className="p-1 -mt-7">
                <div className="flex gap-1 -mt-3">
                    <button
                        className="cursor-grab touch-none p-1 opacity-50 hover:opacity-100 active:cursor-grabbing"
                        {...attributes}
                        {...listeners}
                    >
                        <GripVertical className="h-5 w-5" />
                        <span className="sr-only">Drag handle</span>
                    </button>
                    <div className="flex flex-col gap-4 overflow-hidden sm:flex-row my-3 mx-2">
                        <div className="relative h-[300px] w-[300px] flex-none overflow-hidden rounded-md ">
                            <Image
                                src={activity.photo_url || "/placeholder.svg"}
                                alt={activity.title}
                                className="object-cover"
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                priority
                            />

                            {activity.rating > 0 && (
                                <Badge
                                    variant="secondary"
                                    className="absolute right-2 top-2 bg-background/80 backdrop-blur-sm"
                                >
                                    <Star className="mr-1 h-3 w-3 fill-current text-yellow-400" />
                                    {activity.rating}
                                    <span className="ml-1 text-xs text-muted-foreground">
                                        (
                                        {activity.user_ratings_total?.toLocaleString()}
                                        )
                                    </span>
                                </Badge>
                            )}
                        </div>

                        <div className="flex flex-col justify-between gap-2">
                            <div className="space-y-5">
                                <div>
                                    <div className="flex items-start justify-between gap-4 mb-2 w-11/12">
                                        <h3 className="font-semibold leading-none tracking-tight">
                                            {activity.title}
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        <span className="text-sm">
                                            {`${new Date(
                                                activity.start_date
                                            ).toLocaleDateString()} - ${new Date(
                                                activity.end_date
                                            ).toLocaleDateString()}`}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        <span className="text-sm">
                                            {`${Math.floor(
                                                (getTime(activity.end_date) -
                                                    getTime(
                                                        activity.start_date
                                                    )) /
                                                    86400000
                                            )} Day(s)`}
                                        </span>
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {activity.types
                                            ?.slice(0, 4)
                                            .map((type) => (
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

                                <div className="flex flex-col text-sm mr-3 gap-2">
                                    <div className="flex items-center gap-5">
                                        <MapPin className="h-4 w-4 flex-shrink-0" />
                                        <span className="text-muted-foreground">
                                            {activity.formatted_address}
                                        </span>
                                    </div>

                                    {activity.international_phone_number && (
                                        <div className="flex items-center gap-5 mt-1">
                                            <Phone className="h-4 w-4" />
                                            <span className="text-muted-foreground">
                                                {
                                                    activity.international_phone_number
                                                }
                                            </span>
                                        </div>
                                    )}
                                    {activity.opening_hours && (
                                        <div className="flex flex-row items-center gap-1">
                                            <Clock className="h-4 w-4 flex-shrink-0" />

                                            <div className="mt-1 text-xs space-y-1">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            className="flex items-center"
                                                        >
                                                            <span className="text-muted-foreground">
                                                                Opening Hours
                                                            </span>
                                                            <ChevronDown className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent className="w-64">
                                                        {activity.opening_hours?.map(
                                                            (day) => (
                                                                <DropdownMenuItem
                                                                    key={day}
                                                                >
                                                                    {day}
                                                                </DropdownMenuItem>
                                                            )
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    )}
                                    {activity.description &&
                                        activity.description.length > 0 && (
                                            <div className="flex flex-row items-center gap-5 mb-3">
                                                <StickyNote className="h-4 w-4 flex-shrink-0" />
                                                <span>
                                                    {activity.description}
                                                </span>
                                            </div>
                                        )}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {activity.website && (
                                    <Button size="sm" variant="outline" asChild>
                                        <a
                                            href={activity.website}
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
                                        href={activity.google_maps_url}
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
