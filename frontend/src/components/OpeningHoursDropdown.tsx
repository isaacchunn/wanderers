import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface OpeningHoursDropdownProps {
    openingHours: string[];
}

const OpeningHoursDropdown = ({ openingHours }: OpeningHoursDropdownProps) => (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="p-0">
                <span className="text-muted-foreground font-medium">Opening Hours</span>
                <ChevronDown className="h-4 w-4" />
            </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-64">
            {openingHours.map((day) => (
                <DropdownMenuItem key={day}>{day}</DropdownMenuItem>
            ))}
        </DropdownMenuContent>
    </DropdownMenu>
);

export default OpeningHoursDropdown;