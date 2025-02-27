"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";

interface SearchProps {
    onSearch: (term: string) => void;
    onSelect: (term: string) => void;
    autoCompleteResults: string[];
}

export function LocationSearch({
    onSearch,
    onSelect,
    autoCompleteResults,
}: Readonly<SearchProps>) {
    const [search, setSearch] = React.useState("");
    const [selectedIndex, setSelectedIndex] = React.useState(-1);
    const [showDropdown, setShowDropdown] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    // Debounced search to prevent firing API request on every key press
    React.useEffect(() => {
        const handler = setTimeout(() => {
            if (search) onSearch(search);
        }, 500);

        return () => clearTimeout(handler);
    }, [search, onSearch]);

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                !inputRef.current?.contains(event.target as Node)
            ) {
                setShowDropdown(false);
                setSelectedIndex(-1);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    const handleSelection = (term: string) => {
        setSearch(term);
        onSelect(term);
        setSelectedIndex(-1);
        setShowDropdown(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex((prev) =>
                prev < autoCompleteResults.length - 1 ? prev + 1 : prev
            );
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === "Enter" && selectedIndex >= 0) {
            handleSelection(autoCompleteResults[selectedIndex]);
        } else if (e.key === "Escape") {
            setSelectedIndex(-1);
            setShowDropdown(false);
        }
    };

    return (
        <div className="relative w-full">
            <Input
                ref={inputRef}
                type="text"
                placeholder="Search for a place..."
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value);
                    setShowDropdown(true);
                    setSelectedIndex(-1);
                }}
                onKeyDown={handleKeyDown}
                className="w-full"
                role="combobox"
                aria-expanded={autoCompleteResults.length > 0 && showDropdown}
                aria-controls="place-listbox"
                aria-activedescendant={
                    selectedIndex >= 0
                        ? `place-option-${selectedIndex}`
                        : undefined
                }
            />
            {autoCompleteResults.length > 0 && showDropdown && (
                <div
                    ref={dropdownRef}
                    className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-background shadow-md animate-in fade-in-0 zoom-in-95"
                    role="listbox"
                    id="place-listbox"
                >
                    <div className="py-1">
                        {autoCompleteResults.map((place, index) => (
                            <button
                                key={place}
                                className={`relative flex cursor-default select-none items-center px-2 py-1.5 text-sm outline-none transition-colors text-left w-full ${
                                    index === selectedIndex
                                        ? "bg-accent text-accent-foreground"
                                        : "hover:bg-muted"
                                }`}
                                role="option"
                                id={`place-option-${index}`}
                                aria-selected={index === selectedIndex}
                                onClick={() => handleSelection(place)}
                                onMouseEnter={() => setSelectedIndex(index)}
                            >
                                <span className="flex-1">{place}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
