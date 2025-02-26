"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { places } from "@/lib/utils";
export function CountrySearch({
    onSearch,
}: {
    onSearch: (term: string) => void;
}) {
    const [search, setSearch] = React.useState(""); //stores the selected location
    const [selectedCountry, setSelectedCountry] = React.useState("");
    const [selectedIndex, setSelectedIndex] = React.useState(-1);
    const [showDropdown, setShowDropdown] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    const filteredCountries = React.useMemo(() => {
        if (!search) return [];
        return places
            .filter((place) =>
                place.toLowerCase().includes(search.toLowerCase())
            )
            .slice(0, 5);
    }, [search]);

    const handleSelection = (term: string) => {
        setSelectedCountry(term);
        setSearch("");
        setSelectedIndex(-1);
        setShowDropdown(false);
        onSearch(term);
        console.log(selectedCountry);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex((prev) =>
                prev < filteredCountries.length - 1 ? prev + 1 : prev
            );
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === "Enter" && selectedIndex >= 0) {
            handleSelection(filteredCountries[selectedIndex]);
        } else if (e.key === "Escape") {
            setSelectedIndex(-1);
            setShowDropdown(false);
        }
    };

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                !inputRef.current?.contains(event.target as Node)
            ) {
                setSelectedIndex(-1);
                setShowDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="relative w-full max-w-sm">
            <Input
                ref={inputRef}
                type="text"
                placeholder="Add a place..."
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value);
                    setSelectedIndex(-1);
                    setShowDropdown(true);
                }}
                onKeyDown={handleKeyDown}
                className="w-full"
                role="combobox"
                aria-expanded={filteredCountries.length > 0 && showDropdown}
                aria-controls="country-listbox"
                aria-activedescendant={
                    selectedIndex >= 0
                        ? `country-option-${selectedIndex}`
                        : undefined
                }
            />
            {filteredCountries.length > 0 && showDropdown && (
                <div
                    ref={dropdownRef}
                    className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-background shadow-md animate-in fade-in-0 zoom-in-95"
                    role="listbox"
                    id="country-listbox"
                >
                    <div className="py-1">
                        {filteredCountries.map((country, index) => (
                            <div
                                key={country}
                                className={`relative flex cursor-default select-none items-center px-2 py-1.5 text-sm outline-none transition-colors ${
                                    index === selectedIndex
                                        ? "bg-accent text-accent-foreground"
                                        : "hover:bg-muted"
                                }`}
                                role="option"
                                id={`country-option-${index}`}
                                aria-selected={index === selectedIndex}
                                onClick={() => handleSelection(country)}
                                onMouseEnter={() => setSelectedIndex(index)}
                            >
                                <span className="flex-1">{country}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
