import OpeningHoursDropdown from './OpeningHoursDropdown'; // Adjust import path

interface RenderOpeningHoursProps {
    openingHours: string[];
}

const isOpen24Hours = (openingHours: string[]) => {
    return openingHours.every((day) => day.includes("Open 24 hours"));
};

const RenderOpeningHours = ({ openingHours }: RenderOpeningHoursProps) => {
    const isAlwaysOpen = isOpen24Hours(openingHours);

    return isAlwaysOpen ? (
        <span className="text-green-600 font-medium">Open 24 Hours</span>
    ) : (
        <OpeningHoursDropdown openingHours={openingHours} />
    );
};

export default RenderOpeningHours;