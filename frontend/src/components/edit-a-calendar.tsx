"use client";

import { useState, useEffect } from "react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Itinerary, Activity } from "@/lib/types";
import { fetchItineraryById } from "@/lib/itineraryHandler";

interface DateRangePickerProps {
    itinerary?: Itinerary;
    activity?: Activity;
    onDateChange?: (dates: {
        startDate: Date | undefined;
        endDate: Date | undefined;
    }) => void;
}

export function DateRangePicker({
    itinerary,
    activity,
    onDateChange,
}: Readonly<DateRangePickerProps>) {
    const initialStartDate = itinerary?.start_date;
    const initialEndDate = itinerary?.end_date;
    const initActivityStartDate = activity?.start_date;
    const initActivityEndDate = activity?.end_date;
    const [startDate, setStartDate] = useState<Date | undefined>(initialStartDate || initActivityStartDate);
    const [endDate, setEndDate] = useState<Date | undefined>(initialEndDate || initActivityEndDate);
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving">("idle");
    const [isPopoverOpen, setIsPopoverOpen] = useState<"start" | "end" | "none">("none");

    useEffect(() => {
        if (!itinerary || saveStatus !== "saving") return;

        const timer = setTimeout(async () => {
            const itineraryId = itinerary.id;
            const data = await fetchItineraryById(itineraryId);

            if (!data) {
                toast.error("Failed to update itinerary dates!");
                setStartDate(itinerary.start_date);
                setEndDate(itinerary.end_date);
            } else {
                toast.success("Itinerary dates updated successfully!");
            }
            setSaveStatus("idle");
        }, 3000);

        return () => clearTimeout(timer);
    }, [startDate, endDate, itinerary, saveStatus, onDateChange]);

    const toUTCDate = (date: Date | string | undefined): Date | undefined => {
        if (!date) return undefined;

        const parsedDate = typeof date === "string" ? new Date(date) : date;

        return new Date(
            Date.UTC(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate())
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

        if (activity) {
            const activityStartDate = activity.start_date;
            const activityEndDate = activity.end_date;

            if (activityStartDate && activityEndDate) {
                if (startDate && endDate) {
                    if (startDate < activityStartDate || endDate > activityEndDate) {
                        toast.error("Activity dates must be within the itinerary date range");
                        setStartDate(activityStartDate);
                        setEndDate(activityEndDate);
                        return;
                    }
                }
            }
        }

        if (itinerary && saveStatus === "idle") {
            setSaveStatus("saving");
        }

        if (onDateChange) {
            onDateChange({
                startDate: dateType === "start" ? utcDate : startDate,
                endDate: dateType === "end" ? utcDate : endDate,
            });
        }

        if (onDateChange) {
            onDateChange({
                startDate: dateType === "start" ? utcDate : startDate,
                endDate: dateType === "end" ? utcDate : endDate,
            });
        }

        // Keep popover open for better UX
        setIsPopoverOpen("none");
    };

    const handlePopoverOpenChange = (open: boolean, type: "start" | "end") => {
        if (open) {
            setIsPopoverOpen(type); // Open specific popover (start or end)
        } else {
            setIsPopoverOpen("none"); // Close both popovers
        }
    };


    return (
        <div className="flex items-center space-x-2 z-50">
            {/* Start Date Popover */}
            <Popover
                open={isPopoverOpen === "start"}
                onOpenChange={(open) => handlePopoverOpenChange(open, "start")}
            >
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-[240px] justify-start text-left font-normal"
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

            {/* End Date Popover */}
            <Popover
                open={isPopoverOpen === "end"}
                onOpenChange={(open) => handlePopoverOpenChange(open, "end")}
            >
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-[240px] justify-start text-left font-normal"
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