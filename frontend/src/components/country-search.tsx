import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import countriesData from "@/lib/constants/countries.json";
import { cn } from "@/lib/utils";
import { SelectedCountry } from "@/lib/types";

interface Country {
    id: number;
    alpha2: string;
    alpha3: string;
    name: string;
}

interface CountryProps {
    onCountryChange: (country: SelectedCountry) => void;
}

export function CountrySearch({ onCountryChange }: Readonly<CountryProps>) {
    const [countryInput, setCountryInput] = useState("");
    const [country, setCountry] = useState<SelectedCountry>({
        name: "",
        code: "",
    });
    const [showDropdown, setShowDropdown] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

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

    const filteredCountries = (countriesData.countries as Country[]).filter(
        (c) =>
            countryInput
                ? c.name.toLowerCase().includes(countryInput.toLowerCase())
                : true
    );

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
        onCountryChange({
            name: selectedCountry.name,
            code: selectedCountry.alpha2,
        });
        console.log(country);
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

    return (
        <div>
            <div className="relative w-full">
                <Input
                    id="country"
                    type="text"
                    placeholder="Where do you want to go?"
                    className=" py-2"
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
                    <div
                        className="absolute left-0 top-full mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md z-50"
                        style={{
                            maxHeight: "500px",
                            overflowY: "auto",
                        }}
                    >
                        {filteredCountries.map((country, index) => (
                            <div
                                key={country.id}
                                className={cn(
                                    "px-3 py-2 cursor-pointer hover:bg-secondary hover:text-secondary-foreground",
                                    activeIndex === index &&
                                        "bg-secondary text-secondary-foreground"
                                )}
                                onClick={(e) => handleCountrySelect(country, e)}
                                onMouseEnter={() => setActiveIndex(index)}
                                onKeyDown={handleKeyDown}
                            >
                                {country.name}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
