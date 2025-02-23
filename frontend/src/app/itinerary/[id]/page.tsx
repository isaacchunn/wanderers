import { ChatBox } from "@/components/chat-box";
import { ExpenseSplitter } from "@/components/ui/expense-splitter";
import { ActivityContainer } from "@/components/activity-container";
import { DropdownSetting } from "@/components/dropdown-menu";
import { ItineraryTitle } from "@/components/itinerary-title";
import StartEndDateCalendar from "@/components/update-itinerary-calendar";

import { fetchItineraryById } from "@/lib/itineraryHandler";

interface ItineraryPageProps {
    params: { id: string };
}
export default async function ItineraryPage({ params }: ItineraryPageProps) {
    const itineraryId = await params.id;
    const itinerary = await fetchItineraryById(itineraryId);

    if (!itinerary) {
        return (
            <div className="bg-background p-6 md:p-12 flex items-center justify-center ">
                <h1 className="text-4xl font-bold">Loading itinerary...</h1>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-10 w-fit">
            <div className="flex flex-row justify-between">
                <div className="flex flex-col gap-2">
                    <ItineraryTitle itinerary={itinerary} />
                    <StartEndDateCalendar itinerary={itinerary} />
                </div>
                <DropdownSetting itineraryId={itineraryId} />
            </div>
            <div className="flex flex-col gap-11">
                <div className="grid gap-6 lg:grid-cols-[1fr,400px] min-h-[600px]">
                    <div className="flex flex-col gap-6">
                        <ActivityContainer itinerary={itinerary} />
                        <ExpenseSplitter itinerary={itinerary} />
                    </div>
                    <div className="h-full">
                        <ChatBox itinerary={itinerary} />
                    </div>
                </div>
            </div>
        </div>
    );
}
