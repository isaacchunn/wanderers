"use client";

import { use, useEffect, useState } from "react";
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
import { SortableLocationCard } from "./sortable-location-card";

import { Activity } from "@/lib/types";

export function SortableItinerary({
    fetchedActivities,
}: {
    fetchedActivities: Activity[];
}) {
    const [activities, setActivities] = useState<Activity[]>(fetchedActivities);
    useEffect(() => {
        setActivities(fetchedActivities);
    }, [fetchedActivities]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setActivities((items) => {
                const oldIndex = items.findIndex(
                    (item) => item.id === active.id
                );
                const newIndex = items.findIndex((item) => item.id === over.id);

                return arrayMove(items, oldIndex, newIndex);
            });
        }
    }

    return (
        <div>
            <Card className="p-6 w-[700px]">
                {fetchedActivities.length === 0 ? (
                    <Card className="p-6 flex items-center justify-center h-40 border-2 border-gray-300">
                        <div className="flex flex-col items-center">
                            <span className="text-base font-medium">
                                Add a place!
                            </span>
                        </div>
                    </Card>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={activities}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-4">
                                {activities.map((activity) => (
                                    <SortableLocationCard
                                        key={activity.id}
                                        activity={activity}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}
            </Card>
        </div>
    );
}
