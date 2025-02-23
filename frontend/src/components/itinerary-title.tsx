"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Itinerary } from "@/lib/types";
import { toast } from "sonner";
import { updateItinerary } from "@/lib/itineraryHandler";

export function ItineraryTitle({ itinerary }: { itinerary: Itinerary }) {
    const titleInputRef = useRef<HTMLInputElement>(null);
    const [title, setTitle] = useState(itinerary.title);
    const [inputWidth, setInputWidth] = useState("auto");
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving">("idle");
    // Update input width when title changes
    useEffect(() => {
        if (titleInputRef.current) {
            const tempSpan = document.createElement("span");
            tempSpan.style.visibility = "hidden";
            tempSpan.style.position = "absolute";
            tempSpan.style.whiteSpace = "nowrap";
            tempSpan.style.font = getComputedStyle(titleInputRef.current).font;
            tempSpan.textContent = title || "Enter trip title...";
            document.body.appendChild(tempSpan);
            setInputWidth(`${tempSpan.offsetWidth + 5}px`); // Adding some padding
            document.body.removeChild(tempSpan);
        }
    }, [title]);

    const handleUpdateTitle = async () => {
        if (!itinerary && saveStatus === "idle") return;
        setSaveStatus("saving"); // Show saving toast
        toast.info("Saving changes...", { duration: 2000 });

        setTimeout(async () => {
            const updatedItinerary: Itinerary = { ...itinerary, title: title };
            const data = await updateItinerary(updatedItinerary);
            toast.success("Saved!");
            if (!data) {
                setTitle(itinerary.title);
                toast.error("Failed to save itinerary title!");
            }
            setSaveStatus("idle");
        }, 1500);
    };

    return (
        <Input
            ref={titleInputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-3xl font-bold border-hidden shadow-none bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0 overflow-hidden text-ellipsis whitespace-nowrap hover:bg-slate-100"
            placeholder="Enter trip title..."
            onBlur={handleUpdateTitle} // Trigger update on blur
            style={{ width: inputWidth, minWidth: "50px" }}
        />
    );
}
