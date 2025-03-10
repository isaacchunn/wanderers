import { useState } from "react";
import TimePicker from 'react-time-picker';
import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimePickerProps {
    value?: Date;
    onChange: (time: string | null) => void;  // Update type to handle string or null
    className?: string;
    label?: string;
    disabled?: boolean;
}

export function TimePick({ value, onChange, className, label, disabled = false }: TimePickerProps) {
    const [selectedTime, setSelectedTime] = useState<string | null>(
        value ? value.toISOString().slice(11, 16) : null
    );  // Initialize with formatted time string or null

    const handleTimeChange = (time: string | null) => {
        setSelectedTime(time);  // Store the time as string or null
        onChange(time);  // Call the parent function with the time (which could be string or null)
    };

    return (
        <div className={cn("space-y-2", className)}>
            {label && <Label>{label}</Label>}
            <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <TimePicker
                    value={selectedTime}  // Pass time as string or null
                    onChange={handleTimeChange}
                    disableClock={true}
                    format="HH:mm"
                    disabled={disabled}
                />
            </div>
        </div>
    );
}