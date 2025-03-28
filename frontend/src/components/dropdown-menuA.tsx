"use client"

import type React from "react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deleteActivity, getActivity } from "@/lib/activityHandler"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { MoreVertical, Pencil, Trash2 } from "lucide-react"
import type { Itinerary, Activity } from "@/lib/types"
import DialogModal from "@/components/dialog-model"
import { useEffect, useState } from "react"
import { fetchItineraryById } from "@/lib/itineraryHandler"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export function DropdownSetting({
    activity,
    activityId,
}: {
    readonly activity: Readonly<Activity>
    readonly activityId: Readonly<number>
}) {
    const [activities, setActivities] = useState<Activity[]>([])
    const [itinerary, setItinerary] = useState<Itinerary | null>(null)
    const [isOpen, setIsOpen] = useState(false) // State to control modal visibility

    useEffect(() => {
        const fetchItinerary = async () => {
            const data = (await fetchItineraryById(activity.itinerary_id)) as Itinerary
            setItinerary(data)
        }

        const fetchActivities = async () => {
            const data: Activity[] = (await getActivity(`${activity.itinerary_id}`)) || []
            data.sort((a, b) => a.sequence - b.sequence)
            setActivities(data)
        }

        fetchActivities()
        fetchItinerary()
    }, [activity.itinerary_id])

    const handleDelete = async () => {
        const success = await deleteActivity(activityId)
        if (success) {
            toast.success("Activity deleted.")
            window.location.reload()
        } else {
            toast.error("Failed to delete Activity")
        }
    }

    // Prevent the dropdown from closing when clicking the Edit Activity button
    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation() // Prevent the dropdown from closing
        setIsOpen(true) // Open the modal
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="z-50" asChild>
                <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        {/* Prevent dropdown from closing when clicking "Edit Activity" */}
                        <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()} // Stops dropdown from closing
                            onClick={handleEditClick}
                        >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Activity
                        </DropdownMenuItem>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-[500px]" aria-describedby={undefined}>
                        <DialogHeader>
                            <DialogTitle>Edit Activity</DialogTitle>
                        </DialogHeader>
                        <DialogModal itinerary={itinerary as Itinerary} activities={activities} activityToEdit={activity} />
                    </DialogContent>
                </Dialog>

                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete this activity
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
