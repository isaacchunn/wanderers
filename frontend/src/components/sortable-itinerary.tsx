"use client";

import { useState } from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { SortableLocationCard } from "../components/ui/sortable-location-card";
import { Input } from "@/components/ui/input";
import { saveItinerary } from "@/app/itinerary/[id]/actions";

import { Location } from "@/lib/types";
import { initialLocations } from "@/lib/utils";

export function SortableItinerary() {
    const [locations, setLocations] = useState<Location[]>(initialLocations);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setLocations((items) => {
                const oldIndex = items.findIndex(
                    (item) => item.id === active.id
                );
                const newIndex = items.findIndex((item) => item.id === over.id);

                return arrayMove(items, oldIndex, newIndex);
            });
        }
    }

    async function handleSave() {
        const formData = new FormData();
        formData.append("locations", JSON.stringify(locations));
        await saveItinerary(formData);
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between">
                <Input
                    type="place"
                    placeholder="Add a place"
                    className="w-[490px]"
                />
                <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    Edit Itinerary
                </Button>
            </div>
            <Card className="p-6">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={locations}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-4">
                            {locations.map((location) => (
                                <SortableLocationCard
                                    key={location.id}
                                    location={location}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            </Card>
        </div>
    );
}
