"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChatBox } from "../../../components/ui/chat-box";
import { ExpenseSplitter } from "@/components/ui/expense-splitter";
import { fetchItineraryById, updateItinerary, deleteItinerary, restoreItinerary } from "@/lib/itineraryHandler"; // Import necessary functions
import { ActivityContainer } from "@/components/activity-container";
import { MoreVertical, Trash2, Share2, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Itinerary } from "@/lib/types";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import countriesData from "@/lib/constants/countries.json";

interface Country {
    id: number
    alpha2: string
    alpha3: string
    name: string
}

interface SelectedCountry {
    name: string
    code: string
}

export default function ItineraryPage() {
    const params = useParams();
    const router = useRouter();
    const itineraryId = params.id as string;

    const [itinerary, setItinerary] = useState<Itinerary | null>(null);
    const [title, setTitle] = useState("");
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [location, setLocation] = useState("");
    const [country, setCountry] = useState<SelectedCountry>({ name: "", code: "" });
    const [showDropdown, setShowDropdown] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [countryInput, setCountryInput] = useState("");
    const [visibility, setVisibility] = useState<string>("public"); // Default to public

    const filteredCountries = (countriesData.countries as Country[]).filter((c) =>
        countryInput ? c.name.toLowerCase().includes(countryInput.toLowerCase()) : true,
    )

    const handleCountrySelect = (selectedCountry: Country, e?: React.MouseEvent) => {
        e?.preventDefault() // Prevent any default behavior
        e?.stopPropagation() // Stop event from bubbling up
        setCountry({ name: selectedCountry.name, code: selectedCountry.alpha2 })
        setCountryInput(selectedCountry.name)
        setShowDropdown(false)
        setActiveIndex(-1)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showDropdown) return

        if (e.key === "ArrowDown") {
            e.preventDefault()
            setActiveIndex((prev) => Math.min(prev + 1, filteredCountries.length - 1))
        } else if (e.key === "ArrowUp") {
            e.preventDefault()
            setActiveIndex((prev) => Math.max(prev - 1, 0))
        } else if (e.key === "Enter" && activeIndex !== -1) {
            e.preventDefault()
            // Make sure we have a valid index and pass the specific country
            if (filteredCountries.length > 0 && activeIndex >= 0) {
                const selectedCountry = filteredCountries[activeIndex]
                handleCountrySelect(selectedCountry)
            }
        } else if (e.key === "Escape") {
            setShowDropdown(false)
            setActiveIndex(-1)
        }
    }

    const handleCountryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setCountryInput(value)
        // Reset the selected country if input changes
        setCountry({ name: "", code: "" })

        if (value.trim()) {
            const filtered = (countriesData.countries as Country[]).filter((c) =>
                c.name.toLowerCase().includes(value.toLowerCase()),
            )
            setShowDropdown(filtered.length > 0)
        } else {
            setShowDropdown(false)
        }
        setActiveIndex(-1)
    }

    // Update click outside handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement
            const countrySelector = document.querySelector(".country-selector")
            if (countrySelector && !countrySelector.contains(target)) {
                setShowDropdown(false)
                setActiveIndex(-1)
            }
        }

        // Add escape key handler
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setShowDropdown(false)
                setActiveIndex(-1)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        document.addEventListener("keydown", handleEscapeKey)

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
            document.removeEventListener("keydown", handleEscapeKey)
        }
    }, []);

    const titleInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchData = async () => {
            const data = await fetchItineraryById(itineraryId);
            if (data) {
                setItinerary(data);
                setTitle(data.title);
                setStartDate(data.start_date);
                setEndDate(data.end_date);
                data.location; // Default location
                setVisibility(data.visibility);
            }
        };

        fetchData();
    }, [itineraryId]);

    const handleVisibilityToggle = () => {
        setVisibility(visibility === "public" ? "private" : "public");
    };

    const handleUpdateItinerary = async () => {
        if (!itinerary) return;

        const updatedItineraryData = {
            title,
            start_date: startDate,
            end_date: endDate,
            country,
            visibility,
        };

        try {
            const updated = await updateItinerary(itineraryId, updatedItineraryData);
            if (updated) {
                setItinerary(updated);
                toast.success("Itinerary updated successfully!");
            } else {
                toast.error("Failed to update itinerary.");
            }
        } catch (error) {
            console.error("Update failed:", error);
            toast.error("An error occurred while updating the itinerary.");
        }
    };

    const handleDelete = async () => {
        const success = await deleteItinerary(itineraryId);
        if (success) {
            toast.success("Itinerary deleted. You can undo changes by clicking here", {
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
            });
            router.push("/home");
        } else {
            toast.error("Failed to delete itinerary");
        }
    };

    if (!itinerary) {
        return (
            <div className="bg-background p-6 md:p-12 flex items-center justify-center">
                <h1 className="text-4xl font-bold">Loading itinerary...</h1>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6">
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <Input
                        ref={titleInputRef}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="text-3xl font-bold border-none bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0 w-[80%]"
                        placeholder="Enter trip title..."
                        onBlur={handleUpdateItinerary} // Trigger update on blur
                    />
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
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete this trip
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div>
                    <div className="space-y-10">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn("w-[240px] justify-start text-left font-normal", !startDate && "text-muted-foreground")}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {startDate ? format(startDate, "PPP") : "Start date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={startDate}
                                    onSelect={(date) => setStartDate(date)}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <span className="text-muted-foreground">→</span>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn("w-[240px] justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {endDate ? format(endDate, "PPP") : "End date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={endDate}
                                    onSelect={(date) => setEndDate(date)}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>


                    <div className="space-y-10">
                        <p className="text-sm text-red-500">
                            Choose a destination to start planning
                        </p>
                        <div onClick={(e) => e.stopPropagation()} // Add this to prevent click from bubbling
                        >
                            <Input
                                id="country"
                                type="text"
                                placeholder="Where do you want to go?"
                                className="text-base py-6"
                                value={countryInput}
                                onChange={handleCountryChange}
                                onKeyDown={handleKeyDown}
                                onFocus={() => {
                                    if (countryInput.trim() && filteredCountries.length > 0) {
                                        setShowDropdown(true)
                                    }
                                }}
                            />
                            {showDropdown && filteredCountries.length > 0 && (
                                <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
                                    {filteredCountries.map((country, index) => (
                                        <div
                                            key={country.id}
                                            className={cn(
                                                "px-3 py-2 cursor-pointer hover:bg-secondary hover:text-secondary-foreground",
                                                activeIndex === index && "bg-secondary text-secondary-foreground",
                                            )}
                                            onClick={(e) => handleCountrySelect(country, e)}
                                            onMouseEnter={() => setActiveIndex(index)}
                                        >
                                            {country.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="my-10">
                        <Button variant="outline" onClick={handleVisibilityToggle}>
                            {visibility === "public" ? "Make Private" : "Make Public"}
                        </Button>
                    </div>

                    <div className="my-10">
                        <Button onClick={handleUpdateItinerary}>Update Itinerary</Button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1fr,400px] min-h-[600px]">
                    <div className="flex flex-col gap-6">
                        <ActivityContainer />
                        <ExpenseSplitter />
                    </div>
                    <div className="h-full">
                        <ChatBox />
                    </div>
                </div>
            </div>
        </div>
    );
}