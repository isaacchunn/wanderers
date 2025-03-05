"use client"

import { DateRangePicker } from "@/components/calendar-picker"
import { useState } from "react"
import type { Itinerary } from "@/lib/types"
import { updateItinerary } from "@/lib/itineraryHandler"
import { toast } from "sonner"

interface EditCalendarProps {
    itinerary: Itinerary
}

export default function EditCalendar({ itinerary }: EditCalendarProps) {
    const [dateRange, setDateRange] = useState<{
        startDate: Date | undefined
        endDate: Date | undefined
    }>({
        startDate: itinerary.start_date || undefined,
        endDate: itinerary.end_date || undefined,
    })

    console.log(dateRange)
    const handleDateChange = async (newDates: {
        startDate: Date | undefined
        endDate: Date | undefined
    }) => {
        if (!newDates.startDate || !newDates.endDate) return

        try {
            // Handle itinerary date update
            const updatedItinerary = await updateItinerary({
                ...itinerary,
                start_date: newDates.startDate,
                end_date: newDates.endDate,
            })

            if (!updatedItinerary) {
                throw new Error("Failed to update itinerary")
            } else {
                setDateRange({
                    startDate: updatedItinerary.start_date,
                    endDate: updatedItinerary.end_date,
                })
                toast.success("Itinerary dates updated!")
            }
        } catch (error) {
            console.error("Error updating dates:", error)
            toast.error("Failed to update itinerary dates")

            // Reset to original dates
            setDateRange({
                startDate: itinerary.start_date,
                endDate: itinerary.end_date,
            })
        }
    }

    return (
        <div className="w-[700px] flex flex-row pb-8 space-x-6 justify-between items-center">
            <DateRangePicker
                itinerary={itinerary}
                onDateChange={handleDateChange}
                mode="update-itinerary"
                autoSave={true}
                initialStartDate={itinerary.start_date}
                initialEndDate={itinerary.end_date}
            />
        </div>
    )
}