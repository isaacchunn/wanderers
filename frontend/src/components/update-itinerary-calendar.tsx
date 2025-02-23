"use client";

import { useState } from "react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Itinerary } from "@/lib/types";
import { toast } from "sonner";
import { updateItinerary } from "@/lib/itineraryHandler";

export default function UpdateCalendar({
    itinerary,
}: {
    itinerary: Itinerary;
}) {
    const [startDate, setStartDate] = useState<Date | undefined>(
        itinerary.start_date
    );
    const [endDate, setEndDate] = useState<Date | undefined>(
        itinerary.end_date
    );
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving">("idle");

    const handleUpdateTitle = async (
        dateType: "start_date" | "end_date",
        date: Date | undefined
    ) => {
        if (!itinerary) return;

        setSaveStatus("saving");
        toast.info("Saving changes...", { duration: 2000 });

        setTimeout(async () => {
            const updatedItinerary: Itinerary = {
                ...itinerary,
                [dateType]: date,
            };
            const data = await updateItinerary(updatedItinerary);
            if (!data || saveStatus === "saving") {
                toast.error(
                    `Failed to update ${dateType === "start_date" ? "start" : "end"} date!`
                );
                if (dateType === "start_date") {
                    setStartDate(itinerary.start_date);
                } else {
                    setEndDate(itinerary.end_date);
                }
            } else {
                toast.success(
                    `${dateType === "start_date" ? "Start" : "End"} date updated successfully!`
                );
            }
            setSaveStatus("idle");
        }, 1500);
    };

    const handleStartDateSelect = (date: Date | undefined) => {
        if (date && endDate && date > endDate) {
            toast.error("Start date cannot be later than end date!");
            setEndDate(undefined); // Reset end date if start date is later
        } else {
            setStartDate(date);
            handleUpdateTitle("start_date", date);
        }
    };

    const handleEndDateSelect = (date: Date | undefined) => {
        if (date && startDate && date < startDate) {
            toast.error("End date cannot be earlier than start date!");
            return; // Prevent selecting an end date earlier than start date
        } else {
            setEndDate(date);
            handleUpdateTitle("end_date", date);
        }
    };

    return (
        <div className="flex items-center space-x-2">
            {" "}
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                            "w-[240px] justify-start text-left font-normal",
                            !startDate && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : "Start date"}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={handleStartDateSelect}
                        autoFocus
                    />
                </PopoverContent>
            </Popover>
            <span className="text-muted-foreground "> → </span>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                            "w-[240px] justify-start text-left font-normal",
                            !endDate && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : "End date"}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={handleEndDateSelect}
                        autoFocus
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}
