"use client";

import { CalendarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { createItinerary } from "@/lib/itineraryHandler";
import countriesData from "@/lib/constants/countries.json";

interface Country {
    id: number;
    alpha2: string;
    alpha3: string;
    name: string;
}

interface SelectedCountry {
    name: string;
    code: string;
}

const EmailInput = ({
    emails,
    setEmails,
}: {
    emails: string[];
    setEmails: (emails: string[]) => void;
}) => {
    const [input, setInput] = useState("");

    const isValidEmail = (email: string) => {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(email);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && input.trim()) {
            e.preventDefault();
            if (isValidEmail(input.trim())) {
                setEmails([...emails, input.trim()]);
                setInput("");
            } else {
                alert("Please enter a valid email address");
            }
        } else if (e.key === "Backspace" && input === "" && emails.length > 0) {
            e.preventDefault();
            const newEmails = [...emails];
            newEmails.pop();
            setEmails(newEmails);
        }
    };

    const removeEmail = (emailToRemove: string) => {
        setEmails(emails.filter((email) => email !== emailToRemove));
    };

    return (
        <div className="flex flex-wrap items-center gap-2 p-2 border rounded">
            {emails.map((email) => (
                <div
                    key={email}
                    className="flex items-center bg-gray-200 text-gray-700 px-2 py-1 rounded-full"
                >
                    <span>{email}</span>
                    <button
                        onClick={() => removeEmail(email)}
                        className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                        <X size={14} />
                    </button>
                </div>
            ))}
            <Input
                type="text"
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                placeholder="Add collaborator email and press Enter"
                className="flex-grow border-none focus:ring-0"
            />
        </div>
    );
};

export default function TripPlannerForm() {
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [title, setTitle] = useState("");
    const [country, setCountry] = useState<SelectedCountry>({
        name: "",
        code: "",
    });
    const [countryInput, setCountryInput] = useState("");
    const [visibility, setVisibility] = useState<"public" | "private">(
        "private"
    );
    const [showDropdown, setShowDropdown] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [collaborators, setCollaborators] = useState<string[]>([]);

    const filteredCountries = (countriesData.countries as Country[]).filter(
        (c) =>
            countryInput
                ? c.name.toLowerCase().includes(countryInput.toLowerCase())
                : true
    );

    const handleCountrySelect = (
        selectedCountry: Country,
        e?: React.MouseEvent
    ) => {
        e?.preventDefault(); // Prevent any default behavior
        e?.stopPropagation(); // Stop event from bubbling up
        setCountry({
            name: selectedCountry.name,
            code: selectedCountry.alpha2,
        });
        setCountryInput(selectedCountry.name);
        setShowDropdown(false);
        setActiveIndex(-1);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showDropdown) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((prev) =>
                Math.min(prev + 1, filteredCountries.length - 1)
            );
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((prev) => Math.max(prev - 1, 0));
        } else if (e.key === "Enter" && activeIndex !== -1) {
            e.preventDefault();
            // Make sure we have a valid index and pass the specific country
            if (filteredCountries.length > 0 && activeIndex >= 0) {
                const selectedCountry = filteredCountries[activeIndex];
                handleCountrySelect(selectedCountry);
            }
        } else if (e.key === "Escape") {
            setShowDropdown(false);
            setActiveIndex(-1);
        }
    };

    const handleCountryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setCountryInput(value);
        // Reset the selected country if input changes
        setCountry({ name: "", code: "" });

        if (value.trim()) {
            const filtered = (countriesData.countries as Country[]).filter(
                (c) => c.name.toLowerCase().includes(value.toLowerCase())
            );
            setShowDropdown(filtered.length > 0);
        } else {
            setShowDropdown(false);
        }
        setActiveIndex(-1);
    };

    // Update click outside handler
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            const countrySelector = document.querySelector(".country-selector");
            if (countrySelector && !countrySelector.contains(target)) {
                setShowDropdown(false);
                setActiveIndex(-1);
            }
        };

        // Add escape key handler
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setShowDropdown(false);
                setActiveIndex(-1);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscapeKey);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscapeKey);
        };
    }, []);

    const handleFormSubmit = async () => {
        // You can call the createItinerary function here
        const itineraryData = await createItinerary(
            title,
            country.code.toUpperCase(), // Set your location or get it from input
            visibility, // Set visibility based on your choice
            startDate,
            endDate,
            collaborators // Format the collaborators correctly
        );
        console.log(itineraryData); // Do something with the response
    };

    return (
        <Card className="w-full max-w-xl mx-auto mt-20">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">
                    Plan a new trip
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <p className="text-sm text-black">
                        Name your itinerary plan
                    </p>
                    <Input
                        type="text"
                        placeholder="e.g. Winter Wonderland"
                        className="text-base py-6"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <br />
                    <p className="text-sm text-red-500">
                        Choose a destination to start planning
                    </p>
                    <div
                        onClick={(e) => e.stopPropagation()} // Add this to prevent click from bubbling
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
                                if (
                                    countryInput.trim() &&
                                    filteredCountries.length > 0
                                ) {
                                    setShowDropdown(true);
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
                                            activeIndex === index &&
                                                "bg-secondary text-secondary-foreground"
                                        )}
                                        onClick={(e) =>
                                            handleCountrySelect(country, e)
                                        }
                                        onMouseEnter={() =>
                                            setActiveIndex(index)
                                        }
                                    >
                                        {country.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm text-black">
                        Enter the start and end dates of the your desired trip
                    </label>
                    <div className="flex gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !startDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {startDate
                                        ? format(startDate, "PPP")
                                        : "Start date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={startDate}
                                    onSelect={setStartDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !endDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {endDate
                                        ? format(endDate, "PPP")
                                        : "End date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={endDate}
                                    onSelect={setEndDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>
                        Choose &apos;Public&apos; to share your plan with the
                        world!
                    </Label>
                    <RadioGroup
                        value={visibility}
                        onValueChange={(value: "public" | "private") =>
                            setVisibility(value)
                        }
                        className="flex gap-4"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="private" id="private" />
                            <Label htmlFor="private" className="cursor-pointer">
                                Private
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="public" id="public" />
                            <Label htmlFor="public" className="cursor-pointer">
                                Public
                            </Label>
                        </div>
                    </RadioGroup>
                </div>

                <div>
                    <label className="text-sm text-muted-foreground">
                        Invite tripmates
                    </label>
                    <EmailInput
                        emails={collaborators}
                        setEmails={setCollaborators}
                    />
                </div>

                <div className="space-y-4">
                    <Button
                        onClick={handleFormSubmit}
                        className="w-full py-6 text-base bg-[#FF5D51] hover:bg-[#FF5D51]/90"
                    >
                        Start planning
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
