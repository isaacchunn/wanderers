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
import { SortableLocationCard } from "../../components/ui/sortable-location-card";
import { ChatBox } from "../../components/ui/chat-box";
import { Input } from "@/components/ui/input";
import { ExpenseSplitter } from "../../components/ui/expense-splitter";
import { saveItinerary } from "../itinerary/actions";

import { Location } from "../../lib/types";
import { initialLocations } from "../../lib/utils";

export default async function ItineraryPage() {
    const [locations, setLocations] = useState<Location[]>(initialLocations);
    const [destination, setDestination] = useState("");
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    try {
        const response = await fetch("http://localhost:4000/api/activity/itinerary/1");
        if (!response.ok) {
            throw new Error("Failed to fetch itinerary");
        }
        const data = await response.json();
        setLocations(data.locations); // Update state with fetched locations
        console.log("Fetched itinerary:", data);
    } catch (error) {
        console.error("Error fetching itinerary:", error);
    }

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

    function handleSave() {
        const formData = new FormData();
        formData.append("locations", JSON.stringify(locations));
        saveItinerary(formData);
    }

    return (
        <div className="bg-background p-6 md:p-12 flex items-center justify-items-center">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight">
                            Paris Itinerary
                        </h1>
                        <p className="mt-2 text-muted-foreground">
                            Drag and drop to reorder your itinerary for the day
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1fr,300px]">
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
                        <ExpenseSplitter />
                    </div>
                    <div>
                        <ChatBox />
                    </div>
                </div>
            </div>
        </div>
    );
}