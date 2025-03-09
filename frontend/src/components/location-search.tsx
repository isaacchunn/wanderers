"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { debounce } from "lodash" // Using lodash for debouncing

interface SearchProps {
    onSearch: (term: string) => void
    onSelect: (term: string) => void
    autoCompleteResults: string[]
    initialValue?: string
}

export function LocationSearch({ onSearch, onSelect, autoCompleteResults, initialValue = "" }: Readonly<SearchProps>) {
    const [search, setSearch] = React.useState(initialValue)
    const [selectedIndex, setSelectedIndex] = React.useState(-1)
    const [showDropdown, setShowDropdown] = React.useState(false)
    const [locationSelected, setLocationSelected] = React.useState(false) // Track if a location is selected
    const inputRef = React.useRef<HTMLInputElement>(null)
    const dropdownRef = React.useRef<HTMLDivElement>(null)
    const lastSearchRef = React.useRef<string>("")
    const searchInProgressRef = React.useRef<boolean>(false)

    // Update search state when initialValue changes
    React.useEffect(() => {
        if (initialValue) {
            setSearch(initialValue)
        }
    }, [initialValue])

    // Update dropdown visibility when results change
    React.useEffect(() => {
        if (autoCompleteResults.length > 0) {
            setShowDropdown(true)
        }
    }, [autoCompleteResults])

    // Adjust debounce to trigger on 1 letter, while waiting before sending request
    const debouncedSearch = React.useMemo(
        () =>
            debounce((term: string) => {
                // Only search if the term has changed, is not empty, and location is not selected
                if (term && term !== lastSearchRef.current && !searchInProgressRef.current && !locationSelected) {
                    lastSearchRef.current = term
                    searchInProgressRef.current = true

                    // Call the search function
                    onSearch(term)

                    // Reset the in-progress flag after a reasonable time
                    setTimeout(() => {
                        searchInProgressRef.current = false
                    }, 2000) // Wait 2 seconds before allowing another search
                }
            }, 1000), // Decrease debounce delay to 1 second
        [onSearch, locationSelected],
    )

    // Cleanup debounce on unmount
    React.useEffect(() => {
        return () => {
            debouncedSearch.cancel()
        }
    }, [debouncedSearch])

    // Trigger search when search term changes
    React.useEffect(() => {
        // Only search if term is at least 1 character and location is not selected
        if (search && search.length >= 1 && !locationSelected) {
            debouncedSearch(search)
        }

        // Clear results if search is cleared
        if (!search) {
            lastSearchRef.current = ""
            setShowDropdown(false)
        }
    }, [search, debouncedSearch, locationSelected])

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                !inputRef.current?.contains(event.target as Node)
            ) {
                setShowDropdown(false)
                setSelectedIndex(-1)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    const handleSelection = (term: string) => {
        setSearch(term)
        onSelect(term)
        setSelectedIndex(-1)
        setShowDropdown(false)
        setLocationSelected(true) // Mark location as selected
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "ArrowDown") {
            e.preventDefault()
            setSelectedIndex((prev) => Math.min(prev + 1, autoCompleteResults.length - 1))
        } else if (e.key === "ArrowUp") {
            e.preventDefault()
            setSelectedIndex((prev) => Math.max(prev - 1, 0))
        } else if (e.key === "Enter" && selectedIndex >= 0) {
            handleSelection(autoCompleteResults[selectedIndex])
        } else if (e.key === "Escape") {
            setSelectedIndex(-1)
            setShowDropdown(false)
        }
    }

    return (
        <div className="relative w-full">
            <Input
                ref={inputRef}
                type="text"
                placeholder="Search for a place..."
                value={search}
                onChange={(e) => {
                    const value = e.target.value
                    setSearch(value)

                    // Hide dropdown when input is cleared
                    if (value.length < 1) {
                        setShowDropdown(false)
                    }

                    setSelectedIndex(-1)
                    setLocationSelected(false) // Reset location selection on change
                }}
                onFocus={() => {
                    // Show dropdown on focus if we have results
                    if (autoCompleteResults.length > 0) {
                        setShowDropdown(true)
                    }
                }}
                onKeyDown={handleKeyDown}
                className="w-full"
                role="combobox"
                aria-expanded={showDropdown}
                aria-controls="place-listbox"
                aria-activedescendant={selectedIndex >= 0 ? `place-option-${selectedIndex}` : undefined}
            />
            {autoCompleteResults.length > 0 && showDropdown && (
                <div
                    ref={dropdownRef}
                    className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-background shadow-md"
                    role="listbox"
                    id="place-listbox"
                >
                    <div className="py-1">
                        {autoCompleteResults.map((place, index) => (
                            <button
                                key={place}
                                className={`relative flex cursor-pointer select-none items-center px-2 py-1.5 text-sm outline-none transition-colors text-left w-full ${index === selectedIndex ? "bg-accent text-accent-foreground" : "hover:bg-muted"
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
    )
}