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
import DialogModal from "@/components/dialog-model";

export default function AddPlaceDialog({
    itinerary,
    activities,
    open: externalOpen,
    setOpen: externalSetOpen,
}: Readonly<{
    itinerary: Itinerary;
    activities: Activity[];
    open?: boolean;
    setOpen?: (value: boolean) => void;
}>) {
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
                    <DialogModal
                        itinerary={itinerary}
                        activities={activities}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
