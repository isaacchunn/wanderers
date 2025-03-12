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
    autoSave = false,
}: Readonly<DateRangePickerProps>) {
    const [startDate, setStartDate] = useState<Date | undefined>(
        initialStartDate ?? activity?.start_date ?? itinerary?.start_date
    );

    const [endDate, setEndDate] = useState<Date | undefined>(
        initialEndDate ?? activity?.end_date ?? itinerary?.end_date
    );
    const [isPopoverOpen, setIsPopoverOpen] = useState<
        "start" | "end" | "none"
    >("none");
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving">("idle");

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
            if (startDate && endDate) {
                onDateChange({ startDate, endDate });

                previousValues.current = { startDate, endDate };
            }

            setSaveStatus("idle");
        }, 1000);

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

    const isDisabledDate = (date: Date): boolean => {
        // Normalize time to 00:00:00 for comparison
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        if (date < today) return true;

        if (mode.includes("activity") && itinerary) {
            const itineraryStart = new Date(itinerary.start_date);
            const itineraryEnd = new Date(itinerary.end_date);

            itineraryStart.setHours(0, 0, 0, 0);
            itineraryEnd.setHours(0, 0, 0, 0);

            if (type === "start") {
                if (date < itineraryStart) return true;
            }
            if (type === "end") {
                if (date > itineraryEnd) return true;
            }
        }

        return false;
    };

    const validateStartDate = (utcDate: Date): boolean => {
        const utcEndDate = toUTCDate(endDate);
        if (utcEndDate && utcDate > utcEndDate) {
            toast.error("Start date cannot be later than end date");
            return false;
        }
        return true;
    };

    const validateEndDate = (utcDate: Date): boolean => {
        const utcStartDate = toUTCDate(startDate);
        if (utcStartDate && utcDate < utcStartDate) {
            toast.error("End date cannot be earlier than start date");
            return false;
        }
        return true;
    };

    const handleDateSelect = (
        dateType: "start" | "end",
        date: Date | undefined
    ): void => {
        if (!date) return;

        const utcDate = toUTCDate(date);
        if (!utcDate) return;

        if (dateType === "start") {
            handleStartDate(utcDate);
        } else {
            handleEndDate(utcDate);
        }

        setIsPopoverOpen("none");
    };

    const handleStartDate = (utcDate: Date): void => {
        if (validateStartDate(utcDate)) {
            setStartDate(utcDate);

            if (endDate && endDate < utcDate) {
                setEndDate(utcDate);
            }

            handleDateChange("start", utcDate);
        }
    };

    const handleEndDate = (utcDate: Date): void => {
        if (validateEndDate(utcDate)) {
            setEndDate(utcDate);
            handleDateChange("end", utcDate);
        }
    };

    const handleDateChange = (dateType: "start" | "end", utcDate: Date): void => {
        const newDates = {
            startDate: dateType === "start" ? utcDate : startDate,
            endDate: dateType === "end" ? utcDate : endDate,
        };

        if (autoSave && mode === "update-itinerary") {
            setSaveStatus("saving");
        } else {
            onDateChange(newDates);
        }
    };

    const openPopover = (type: "start" | "end") => {
        setIsPopoverOpen(type);
    };

    const closePopover = () => {
        setIsPopoverOpen("none");
    };

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
            <Popover
                open={isPopoverOpen === "start"}
                onOpenChange={(open) =>
                    handlePopoverOpenChange(open ? "open" : "close", "start")
                }
            >
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={`w-[240px] justify-start text-left font-normal z-40"
                            }`}
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
                        disabled={(date) => isDisabledDate(date)}
                        autoFocus
                    />
                </PopoverContent>
            </Popover>

            <Popover
                open={isPopoverOpen === "end"}
                onOpenChange={(open) =>
                    handlePopoverOpenChange(open ? "open" : "close", "end")
                }
            >
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={`w-[240px] justify-start text-left font-normal z-40"
                            }`}
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
                        disabled={(date) => isDisabledDate(date)}
                        autoFocus
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}

