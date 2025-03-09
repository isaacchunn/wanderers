"use client";

import { useState, useEffect, useRef } from "react";
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
import type { Itinerary, Activity } from "@/lib/types";

interface DateRangePickerProps {
    itinerary?: Itinerary;
    activity?: Activity;
    onDateChange: (dates: {
        startDate: Date | undefined;
        endDate: Date | undefined;
    }) => void;
    initialStartDate?: Date;
    initialEndDate?: Date;
    mode:
    | "create-itinerary"
    | "update-itinerary"
    | "create-activity"
    | "update-activity";
    autoSave?: boolean;
}

export function DateRangePicker({
    itinerary,
    activity,
    onDateChange,
    initialStartDate,
    initialEndDate,
    mode,
    autoSave = false, // Default to false - only updateItinerary should use autoSave=true
}: Readonly<DateRangePickerProps>) {
    // Initialize with provided dates or defaults based on context
    const [startDate, setStartDate] = useState<Date | undefined>(
        initialStartDate || activity?.start_date || itinerary?.start_date
    );
    const [endDate, setEndDate] = useState<Date | undefined>(
        initialEndDate || activity?.end_date || itinerary?.end_date
    );
    const [isPopoverOpen, setIsPopoverOpen] = useState<
        "start" | "end" | "none"
    >("none");
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving">("idle");

    // Keep references of previous values to determine changes
    const previousValues = useRef({ startDate, endDate });

    useEffect(() => {
        if (mode.includes("activity") && itinerary) {
            setStartDate((prevStart) =>
                prevStart && prevStart < itinerary.start_date ? itinerary.start_date : prevStart
            );
            setEndDate((prevEnd) =>
                prevEnd && prevEnd > itinerary.end_date ? itinerary.end_date : prevEnd
            );
        }
    }, [itinerary, itinerary?.start_date, itinerary?.end_date, mode]);

    // Auto-save effect (only used for update-itinerary mode with autoSave=true)
    useEffect(() => {
        if (!autoSave || mode !== "update-itinerary" || saveStatus !== "saving")
            return;

        const hasChanged =
            previousValues.current.startDate !== startDate ||
            previousValues.current.endDate !== endDate;

        if (!hasChanged) {
            setSaveStatus("idle");
            return;
        }

        const timer = setTimeout(() => {
            // Call onDateChange with current dates
            if (startDate && endDate) {
                onDateChange({ startDate, endDate });

                // Update reference values
                previousValues.current = { startDate, endDate };
            }

            setSaveStatus("idle");
        }, 1000); // Reasonable debounce delay

        return () => clearTimeout(timer);
    }, [startDate, endDate, onDateChange, mode, autoSave, saveStatus]);

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

    const isDisabledDate = (date: Date, type: "start" | "end"): boolean => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize time to 00:00:00

        // Disable past dates
        if (date < today) return true;

        if (mode.includes("activity") && itinerary) {
            const itineraryStart = new Date(itinerary.start_date);
            const itineraryEnd = new Date(itinerary.end_date);

            // Ensure we set times to UTC 00:00:00 for proper comparison
            itineraryStart.setHours(0, 0, 0, 0);
            itineraryEnd.setHours(0, 0, 0, 0);

            if (type === "start") {
                if (date < itineraryStart) return true; // ✅ Disable before March 9
            }
            if (type === "end") {
                if (date > itineraryEnd) return true; // ✅ Disable **March 29 onwards**
            }
        }

        return false; // ✅ Allow valid dates
    };

    const validateStartDate = (utcDate: Date): boolean => {
        if (endDate && utcDate > endDate) {
            toast.error("Start date cannot be later than end date");
            return false;
        }

        if (
            mode.includes("activity") &&
            itinerary?.start_date &&
            utcDate < itinerary.start_date
        ) {
            toast.error(
                "Activity start date must be within itinerary date range"
            );
            return false;
        }

        return true;
    };

    const validateEndDate = (utcDate: Date): boolean => {
        if (startDate && utcDate < startDate) {
            toast.error("End date cannot be earlier than start date");
            return false;
        }

        if (
            mode.includes("activity") &&
            itinerary?.end_date &&
            utcDate > itinerary.end_date
        ) {
            toast.error(
                "Activity end date must be within itinerary date range"
            );
            return false;
        }

        return true;
    };

    const handleDateSelect = (dateType: "start" | "end", date: Date | undefined): void => {
        if (!date) return;

        const utcDate = toUTCDate(date);
        if (!utcDate) return;

        const isStartDate = dateType === "start";
        const isValid = isStartDate ? validateStartDate(utcDate) : validateEndDate(utcDate);
        if (!isValid) return;

        const updatedStartDate = isStartDate ? utcDate : startDate;
        const updatedEndDate = isStartDate && endDate && endDate < utcDate ? utcDate : endDate;

        if (isStartDate) setStartDate(updatedStartDate);
        if (!isStartDate || updatedEndDate !== endDate) setEndDate(updatedEndDate);

        const newDates = { startDate: updatedStartDate, endDate: updatedEndDate };

        if (autoSave && mode === "update-itinerary") {
            setSaveStatus("saving");
        } else {
            onDateChange(newDates);
        }

        setIsPopoverOpen("none");
    };

    const openPopover = (type: "start" | "end") => {
        setIsPopoverOpen(type);
    };

    const closePopover = () => {
        setIsPopoverOpen("none");
    };

    // Refactor the handlePopoverOpenChange function to use the open/close methods
    const handlePopoverOpenChange = (
        action: "open" | "close",
        type: "start" | "end"
    ) => {
        if (action === "open") {
            openPopover(type);
        } else {
            closePopover();
        }
    };

    return (
        <div className="flex items-center space-x-2">
            {/* Start Date Popover */}
            <Popover
                open={isPopoverOpen === "start"}
                onOpenChange={(open) =>
                    handlePopoverOpenChange(open ? "open" : "close", "start")
                }
            >
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-[240px] justify-start text-left font-normal z-40"
                        onClick={(e) => {
                            e.stopPropagation();
                            handlePopoverOpenChange("open", "start");
                        }}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : "Start date"}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-50" align="start">
                    <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => handleDateSelect("start", date)}
                        disabled={(date) => isDisabledDate(date, "start")}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>

            {/* End Date Popover */}
            <Popover
                open={isPopoverOpen === "end"}
                onOpenChange={(open) =>
                    handlePopoverOpenChange(open ? "open" : "close", "end")
                }
            >
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-[240px] justify-start text-left font-normal z-40"
                        onClick={(e) => {
                            e.stopPropagation();
                            handlePopoverOpenChange("open", "end");
                        }}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : "End date"}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-50" align="start">
                    <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => handleDateSelect("end", date)}
                        disabled={(date) => isDisabledDate(date, "end")}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}
