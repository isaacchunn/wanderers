"use client";

import { useState } from "react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteItinerary, restoreItinerary } from "@/lib/itineraryHandler";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    MoreVertical,
    Trash2,
    Share2,
    BookOpenCheck,
    Lock,
    Unlock,
} from "lucide-react";
import { useRouter } from "next/navigation";

export function DropdownSetting({ itineraryId }: { itineraryId: string }) {
    const [visibility, setVisibility] = useState<string>("public");
    const router = useRouter();
    const handleVisibilityToggle = () => {
        setVisibility(visibility === "public" ? "private" : "public");
    };

    const handleDelete = async () => {
        const success = await deleteItinerary(itineraryId);
        if (success) {
            toast.success(
                "Itinerary deleted. You can undo changes by clicking here",
                {
                    action: {
                        label: "Undo",
                        onClick: async () => {
                            const restored =
                                await restoreItinerary(itineraryId);
                            if (restored) {
                                toast.success(
                                    "Itinerary restored successfully"
                                );
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
                <DropdownMenuItem>
                    <BookOpenCheck className="mr-2 h-4 w-4" />
                    Publish
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleVisibilityToggle}>
                    {visibility === "public" ? (
                        <>
                            <Lock className="mr-2 h-4 w-4" />
                            <span>Private</span>
                        </>
                    ) : (
                        <>
                            <Unlock className="mr-2 h-4 w-4" />
                            <span>Public</span>
                        </>
                    )}
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
