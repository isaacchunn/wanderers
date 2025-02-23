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
import { toast } from "sonner";

interface DatePickerProps {
    onDateChange: (dates: {
        startDate: Date | undefined;
        endDate: Date | undefined;
    }) => void;
}

export default function CreateCalendar({ onDateChange }: DatePickerProps) {
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);

    const handleStartDateSelect = (date: Date | undefined) => {
        if (date && endDate && date > endDate) {
            toast.error("Start date cannot be later than end date!");
            setEndDate(undefined); // Reset end date if start date is later
        } else {
            setStartDate(date);
            onDateChange({ startDate: date, endDate });
        }
        return;
    };

    const handleEndDateSelect = (date: Date | undefined) => {
        if (date && startDate && date < startDate) {
            toast.error("End date cannot be earlier than start date!");
            setEndDate(undefined); // Prevent selecting an end date earlier than start date
        } else {
            setEndDate(date);
            onDateChange({ startDate, endDate: date });
        }
        return;
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
