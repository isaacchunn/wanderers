import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { GripVertical } from "lucide-react";
import Image from "next/image";

interface Location {
    id: string;
    title: string;
    description: string;
    image: string;
    time: string;
}

interface SortableLocationCardProps {
    location: Location;
}

export function SortableLocationCard({ location }: SortableLocationCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: location.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

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
                        <div className="relative h-[100px] w-[150px] flex-none overflow-hidden rounded-md">
                            <Image
                                src={location.image || "/placeholder.svg"}
                                alt={location.title}
                                className="object-cover"
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                priority
                            />
                        </div>
                        <div className="flex-1 space-y-1">
                            <div className="flex items-start justify-between gap-4">
                                <h3 className="font-semibold leading-none tracking-tight">
                                    {location.title}
                                </h3>
                                {/* <div className="text-sm text-muted-foreground">
                                    {location.time}
                                </div> */}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                                {location.description}
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
