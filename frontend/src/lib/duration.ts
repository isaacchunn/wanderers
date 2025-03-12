// utils/activityUtils.ts
import { differenceInMilliseconds } from "date-fns";

export function calculateDuration(startDate: Date | undefined, endDate: Date | undefined) {
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
