"use client"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getActivity } from "@/lib/activityHandler"
import { deleteActivityAndRevalidate } from "@/app/itinerary/[id]/actions"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { MoreVertical, Pencil, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Itinerary, Activity } from "@/lib/types"
import DialogModal from "./dialog-model"
import { useEffect, useState } from "react"
import { fetchItineraryById } from "@/lib/itineraryHandler"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export function DropdownSetting({
    activity,
    ActivityId,
}: {
    readonly activity: Readonly<Activity>
    readonly ActivityId: Readonly<number>
    open?: boolean
    setOpen?: (value: boolean) => void
}) {
    const router = useRouter()
    const [activities, setActivities] = useState<Activity[]>([])
    const [itinerary, setItinerary] = useState<Itinerary | null>(null)

    const [isOpen, setIsOpen] = useState(false)  // State to control modal visibility

    useEffect(() => {
        const fetchItinerary = async () => {
            const data = (await fetchItineraryById(activity.itinerary_id)) as Itinerary
            setItinerary(data)
        }
        fetchItinerary()
    }, [activity.itinerary_id])

    useEffect(() => {
        const fetchActivities = async () => {
            const data: Activity[] = (await getActivity(`${activity.itinerary_id}`)) || []
            data.sort((a, b) => a.sequence - b.sequence)
            setActivities(data)
        }
        fetchActivities()
    }, [activity.itinerary_id])

    const handleDelete = async () => {
        const success = await deleteActivityAndRevalidate(ActivityId, activity.itinerary_id)
        if (success) {
            toast.success("Activity deleted.")
            router.refresh()
        } else {
            toast.error("Failed to delete Activity")
        }
    }

    // Prevent the dropdown from closing when clicking the Edit Activity button
    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation()  // Prevent the dropdown from closing
        setIsOpen(true)  // Open the modal
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
                        <DropdownMenuItem onClick={handleEditClick}>
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