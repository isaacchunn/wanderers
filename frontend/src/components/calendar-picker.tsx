"use client";

import { useState, useEffect } from "react";
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
import { toast } from "sonner";
import { Itinerary } from "@/lib/types";
import { updateItinerary } from "@/lib/itineraryHandler";

interface DateRangePickerProps {
    itinerary?: Itinerary;
    onDateChange?: (dates: {
        startDate: Date | undefined;
        endDate: Date | undefined;
    }) => void;
}

/*
If an itinerary prop is provided, it will update the itinerary asynchronously with debouncing.
If no itinerary is provided, it will function as a simple date picker with an onDateChange callback.
*/

export function DateRangePicker({
    itinerary,
    onDateChange,
}: DateRangePickerProps) {
    const initialStartDate = itinerary?.start_date;
    const initialEndDate = itinerary?.end_date;
    const [startDate, setStartDate] = useState<Date | undefined>(
        initialStartDate
    );
    const [endDate, setEndDate] = useState<Date | undefined>(initialEndDate);
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving">("idle");
    console.log("now", new Date());
    useEffect(() => {
        if (!itinerary || saveStatus !== "saving" || !startDate || !endDate)
            return;

        const timer = setTimeout(async () => {
            const updatedItinerary: Itinerary = {
                ...itinerary,
                start_date: startDate,
                end_date: endDate,
            };
            const data = await updateItinerary(updatedItinerary);

            if (!data) {
                toast.error("Failed to update itinerary dates!");
                setStartDate(itinerary.start_date);
                setEndDate(itinerary.end_date);
            } else {
                toast.success("Itinerary dates updated successfully!");
            }
            setSaveStatus("idle");
        }, 1500);

        return () => clearTimeout(timer);
    }, [startDate, endDate, itinerary, saveStatus, onDateChange]);

    const toUTCDate = (date: Date | string | undefined): Date | undefined => {
        if (!date) return undefined;

        const parsedDate = typeof date === "string" ? new Date(date) : date;

        return new Date(
            Date.UTC(
                parsedDate.getFullYear(),
                parsedDate.getMonth(),
                parsedDate.getDate()
            )
        );
    };
    const handleDateSelect = (
        dateType: "start" | "end",
        date: Date | undefined
    ): void => {
        const utcDate = toUTCDate(date);

        if (!utcDate) return;

        if (dateType === "start") {
            if (endDate && utcDate > toUTCDate(endDate)!) {
                toast.error("Start date cannot be later than end date!");
                return;
            }
            setStartDate(utcDate);
        } else if (dateType === "end") {
            if (startDate && utcDate < toUTCDate(startDate)!) {
                toast.error("End date cannot be earlier than start date!");
                return;
            }
            setEndDate(utcDate);
        }

        if (itinerary) {
            setSaveStatus("saving");
        }

        if (onDateChange) {
            onDateChange({
                startDate: dateType === "start" ? utcDate : startDate,
                endDate: dateType === "end" ? utcDate : endDate,
            });
        }
    };

    return (
        <div className="flex items-center space-x-2">
            <Popover
                onOpenChange={(open) =>
                    !open && handleDateSelect("start", startDate)
                }
            >
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
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
                        onSelect={(date) => handleDateSelect("start", date)}
                        disabled={{ before: new Date() }}
                        autoFocus
                    />
                </PopoverContent>
            </Popover>

            <Popover
                onOpenChange={(open) =>
                    !open && handleDateSelect("end", endDate)
                }
            >
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
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
                        onSelect={(date) => handleDateSelect("end", date)}
                        disabled={{ before: new Date() }}
                        autoFocus
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}
