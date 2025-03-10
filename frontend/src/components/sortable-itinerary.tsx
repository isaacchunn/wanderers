"use client";

import { useEffect, useState, useRef, useCallback } from "react";
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
import { editActivity } from "@/lib/activityHandler";
import { toast } from "sonner";

export function SortableItinerary({
    fetchedActivities,
}: Readonly<{
    fetchedActivities: Activity[];
}>) {
    const [activities, setActivities] = useState<Activity[]>(fetchedActivities);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const initialOrderRef = useRef<Activity[]>(fetchedActivities);

    useEffect(() => {
        saveOrder();
    }, [activities]);

    useEffect(() => {
        setActivities(fetchedActivities);
        initialOrderRef.current = fetchedActivities;
    }, [fetchedActivities]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        setActivities((items) => {
            const oldIndex = items.findIndex((item) => item.id === active.id);
            const newIndex = items.findIndex((item) => item.id === over.id);
            return arrayMove(items, oldIndex, newIndex);
        });
    }

    const saveOrder = useCallback(async () => {
        const updatedActivities = activities.map((activity, index) => ({
            ...activity,
            sequence: index + 1, // Assign new sequence order
        }));

        try {
            await Promise.all(updatedActivities.map(editActivity)); // Parallelize API calls
        } catch (error) {
            console.error("Error saving activity order:", error);
            toast.error("Error saving activity order");
        }
    }, [activities]);

    return (
        <div ref={containerRef}>
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
