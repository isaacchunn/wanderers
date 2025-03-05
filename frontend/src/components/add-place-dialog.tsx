"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Activity, Itinerary } from "@/lib/types";
import DialogModal from "@/components/dialog-model"

export default function AddPlaceDialog({
    itinerary,
    activities,
    open: externalOpen, // External state (optional)
    setOpen: externalSetOpen, // External setter (optional)
}: Readonly<{
    itinerary: Itinerary;
    activities: Activity[];
    open?: boolean; // Make open state optional
    setOpen?: (value: boolean) => void; // Make setter optional
}>) {
    // State for place details and auto-complete results
    const [internalOpen, setInternalOpen] = useState(false);
    const isOpen = externalOpen ?? internalOpen;
    const setIsOpen = externalSetOpen ?? setInternalOpen;

    return (
        <div>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild className="z-50">
                    <Button>Add Place</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Add New Place</DialogTitle>
                    </DialogHeader>
                    <DialogModal itinerary={itinerary} activities={activities} />
                </DialogContent>
            </Dialog>
        </div>
    );
}