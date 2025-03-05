"use client"

import { useState, useEffect, useRef } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import type { Itinerary, Activity } from "@/lib/types"

interface DateRangePickerProps {
    itinerary?: Itinerary
    activity?: Activity
    onDateChange: (dates: {
        startDate: Date | undefined
        endDate: Date | undefined
    }) => void
    initialStartDate?: Date | undefined
    initialEndDate?: Date | undefined
    mode: "create-itinerary" | "update-itinerary" | "create-activity" | "update-activity"
    autoSave?: boolean
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
        initialStartDate || activity?.start_date || itinerary?.start_date,
    )
    const [endDate, setEndDate] = useState<Date | undefined>(initialEndDate || activity?.end_date || itinerary?.end_date)
    const [isPopoverOpen, setIsPopoverOpen] = useState<"start" | "end" | "none">("none")
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving">("idle")

    // Keep references of previous values to determine changes
    const previousValues = useRef({ startDate, endDate })

    // Auto-save effect (only used for update-itinerary mode with autoSave=true)
    useEffect(() => {
        if (!autoSave || mode !== "update-itinerary" || saveStatus !== "saving") return

        const hasChanged = previousValues.current.startDate !== startDate || previousValues.current.endDate !== endDate

        if (!hasChanged) {
            setSaveStatus("idle")
            return
        }

        const timer = setTimeout(() => {
            // Call onDateChange with current dates
            if (startDate && endDate) {
                onDateChange({ startDate, endDate })

                // Update reference values
                previousValues.current = { startDate, endDate }
            }

            setSaveStatus("idle")
        }, 1500) // Reasonable debounce delay

        return () => clearTimeout(timer)
    }, [startDate, endDate, onDateChange, mode, autoSave, saveStatus])

    const toUTCDate = (date: Date | string | undefined): Date | undefined => {
        if (!date) return undefined

        const parsedDate = typeof date === "string" ? new Date(date) : date

        return new Date(Date.UTC(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate()))
    }

    const isDisabledDate = (date: Date, type: "start" | "end"): boolean => {
        // Base condition: No past dates
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        if (date < today) return true

        // For end date: cannot be before start date
        if (type === "end" && startDate && date < startDate) return true

        // For activity dates: must be within itinerary range
        if (mode.includes("activity") && itinerary) {
            const itineraryStart = itinerary.start_date
            const itineraryEnd = itinerary.end_date

            if (itineraryStart && date < itineraryStart) return true
            if (itineraryEnd && date > itineraryEnd) return true
        }

        return false
    }

    const handleDateSelect = (dateType: "start" | "end", date: Date | undefined): void => {
        if (!date) return

        const utcDate = toUTCDate(date)
        if (!utcDate) return

        // Validate specific conditions
        if (dateType === "start") {
            if (endDate && utcDate > endDate) {
                toast.error("Start date cannot be later than end date")
                return
            }

            // For activities, validate against itinerary constraints
            if (mode.includes("activity") && itinerary?.start_date && utcDate < itinerary.start_date) {
                toast.error("Activity start date must be within itinerary date range")
                return
            }

            setStartDate(utcDate)
        } else {
            if (startDate && utcDate < startDate) {
                toast.error("End date cannot be earlier than start date")
                return
            }

            // For activities, validate against itinerary constraints
            if (mode.includes("activity") && itinerary?.end_date && utcDate > itinerary.end_date) {
                toast.error("Activity end date must be within itinerary date range")
                return
            }

            setEndDate(utcDate)
        }

        // Update state first
        const newDates = {
            startDate: dateType === "start" ? utcDate : startDate,
            endDate: dateType === "end" ? utcDate : endDate,
        }

        // For auto-saving contexts, set saving status
        if (autoSave && mode === "update-itinerary") {
            setSaveStatus("saving")
        } else {
            // For non-autosave contexts, call onDateChange immediately
            onDateChange(newDates)
        }

        // Close the popover
        setIsPopoverOpen("none")
    }

    const handlePopoverOpenChange = (open: boolean, type: "start" | "end") => {
        if (open) {
            setIsPopoverOpen(type)
        } else {
            setIsPopoverOpen("none")
        }
    }

    return (
        <div className="flex items-center space-x-2">
            {/* Start Date Popover */}
            <Popover open={isPopoverOpen === "start"} onOpenChange={(open) => handlePopoverOpenChange(open, "start")}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-[240px] justify-start text-left font-normal z-40"
                        onClick={(e) => {
                            e.stopPropagation()
                            handlePopoverOpenChange(true, "start")
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
            <Popover open={isPopoverOpen === "end"} onOpenChange={(open) => handlePopoverOpenChange(open, "end")}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-[240px] justify-start text-left font-normal z-40"
                        onClick={(e) => {
                            e.stopPropagation()
                            handlePopoverOpenChange(true, "end")
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
    )
}