"use client";

import { CalendarIcon, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useState } from "react";

export default function TripPlannerForm() {
    const [startDate, setStartDate] = useState<Date>();
    const [endDate, setEndDate] = useState<Date>();

    return (
        <Card className="w-full max-w-xl mx-auto mt-20">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">
                    Plan a new trip
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Input
                        type="text"
                        placeholder="e.g. Paris, Hawaii, Japan"
                        className="text-base py-6"
                    />
                    <p className="text-sm text-red-500">
                        Choose a destination to start planning
                    </p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">
                        Dates (optional)
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

                <div className="flex items-center justify-between">
                    <Button variant="ghost" className="text-muted-foreground">
                        <Plus className="mr-2 h-4 w-4" />
                        Invite tripmates
                    </Button>
                    <Button variant="outline" className="text-muted-foreground">
                        <Users className="mr-2 h-4 w-4" />
                        Friends
                    </Button>
                </div>

                <div className="space-y-4">
                    <Button className="w-full py-6 text-base bg-[#FF5D51] hover:bg-[#FF5D51]/90">
                        Start planning
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
