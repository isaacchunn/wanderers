// utils/activityUtils.ts
import { differenceInMilliseconds } from "date-fns";

export const calculateDuration = (startDate: Date | undefined, endDate: Date | undefined) => {
    if (!startDate || !endDate) return "";

    const diffMs = differenceInMilliseconds(endDate, startDate);

    // Calculate days and hours
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days === 0) {
        return `${hours} hour${hours !== 1 ? "s" : ""}`;
    } else if (hours === 0) {
        return `${days} day${days !== 1 ? "s" : ""}`;
    } else {
        return `${days} day${days !== 1 ? "s" : ""} and ${hours} hour${hours !== 1 ? "s" : ""}`;
    }
};

export const handleDateChange = (newDateRange: {
    startDate: Date | undefined;
    endDate: Date | undefined;
}, dateTimeRange: { startDate: Date | undefined, endDate: Date | undefined }) => {
    if (newDateRange.startDate && dateTimeRange.startDate) {
        newDateRange.startDate.setHours(dateTimeRange.startDate.getHours(), dateTimeRange.startDate.getMinutes(), 0, 0);
    }

    if (newDateRange.endDate && dateTimeRange.endDate) {
        newDateRange.endDate.setHours(dateTimeRange.endDate.getHours(), dateTimeRange.endDate.getMinutes(), 0, 0);
    }

    return newDateRange;
};

export const handleStartTimeChange = (newTime: string | null, dateTimeRange: { startDate: Date | undefined }) => {
    if (newTime && dateTimeRange.startDate) {
        const [hours, minutes] = newTime.split(":").map(Number);
        const newStartDate = new Date(dateTimeRange.startDate);
        newStartDate.setHours(hours, minutes, 0, 0);

        return { startDate: newStartDate };
    }

    return null;
};

export const handleEndTimeChange = (newTime: string | null, dateTimeRange: { endDate: Date | undefined }) => {
    if (newTime && dateTimeRange.endDate) {
        const [hours, minutes] = newTime.split(":").map(Number);
        const newEndDate = new Date(dateTimeRange.endDate);
        newEndDate.setHours(hours, minutes, 0, 0);

        return { endDate: newEndDate };
    }

    return null;
};