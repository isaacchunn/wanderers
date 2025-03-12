"use client";

import { useState, useEffect } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { deleteItinerary, restoreItinerary, updateItinerary } from "@/lib/itineraryHandler";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { MoreVertical, Trash2, Share2, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Itinerary } from "@/lib/types";

// Main DropdownSetting component
export function DropdownSetting({
    itinerary,
    itineraryId
}: {
    readonly itinerary: Readonly<Itinerary>;
    readonly itineraryId: Readonly<string>;
}) {
    const [visibility, setVisibility] = useState<string>(itinerary.visibility);
    const [isUpdating, setIsUpdating] = useState(false);
    const router = useRouter();

    // Ensure that the initial visibility is set based on itinerary.visibility
    useEffect(() => {
        if (itinerary?.visibility) {
            setVisibility(itinerary.visibility as "public" | "private");
        }
    }, [itinerary]);

    // Handle visibility toggle
    const handleVisibilityToggle = async () => {
        if (isUpdating) return; // Prevent toggle if already updating
        setIsUpdating(true); // Disable toggle during update

        // Toggle visibility between public and private
        const newVisibility = visibility === "public" ? "private" : "public";
        const updatedItinerary: Itinerary = { ...itinerary, visibility: newVisibility };

        const response = await updateItinerary(updatedItinerary);
        if (response) {
            toast.success(`Visibility settings changed to ${newVisibility}`);
            setVisibility(newVisibility); // Update local state
        } else {
            toast.error("Failed to change visibility settings");
        }
        setIsUpdating(false); // Re-enable toggle after update
    };

    // Handle itinerary deletion
    const handleDelete = async () => {
        const success = await deleteItinerary(itineraryId);
        if (success) {
            toast.success(
                "Itinerary deleted. You can undo changes by clicking here",
                {
                    action: {
                        label: "Undo",
                        onClick: async () => {
                            const restored = await restoreItinerary(itineraryId);
                            if (restored) {
                                toast.success("Itinerary restored successfully");
                                router.refresh();
                            } else {
                                toast.error("Failed to restore itinerary");
                            }
                        },
                    },
                }
            );
            router.push("/home");
        } else {
            toast.error("Failed to delete itinerary");
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                </DropdownMenuItem>

                {/* Visibility Toggle Menu Item */}
                <DropdownMenuItem
                    onClick={(e) => e.preventDefault()} // Prevent dropdown from closing
                    disabled={isUpdating} // Disable during update
                >
                    <div className="flex items-center justify-between w-full">
                        <Label htmlFor="visibility-toggle" className="flex items-center cursor-pointer">
                            <Lock className="mr-2 h-4 w-4" />
                            <span>Private</span>
                        </Label>
                        <Switch
                            id="visibility-toggle"
                            checked={visibility === "private"} // Checked when private (Lock)
                            onCheckedChange={handleVisibilityToggle}
                            disabled={isUpdating} // Disable during update
                        />
                    </div>
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="text-destructive"
                    onClick={handleDelete}
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete this trip
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
