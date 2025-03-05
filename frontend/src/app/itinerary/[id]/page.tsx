import { ChatBox } from "@/components/chat-box";
import { ExpenseSplitter } from "@/components/expense-splitter";
import { ActivityContainer } from "@/components/activity-container";
import { DropdownSetting } from "@/components/dropdown-menuI";
import { ItineraryTitle } from "@/components/itinerary-title";
import { fetchItineraryById } from "@/lib/itineraryHandler";
import EditCalendar from "@/components/edit-i-calendar";

export default async function ItineraryPage({
    params,
}: Readonly<{
    params: Promise<{ id: string }>;
}>) {
    const itineraryId = (await params).id;
    const itinerary = await fetchItineraryById(itineraryId);

    if (!itinerary) {
        return (
            <div className="bg-background p-6 md:p-12 flex items-center justify-center ">
                <h1 className="text-4xl font-bold">Itinerary not found.</h1>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 w-fit">
            <div className="flex flex-row justify-between items-start">
                <div className="w-fit flex flex-col gap-2">
                    <ItineraryTitle itinerary={itinerary} />
                    <div className="w-fit space-x-6">
                        <EditCalendar
                            itinerary={itinerary}
                        />
                    </div>
                </div>
                <DropdownSetting itinerary={itinerary} itineraryId={itineraryId} />
            </div>
            <div className="flex flex-col gap-2">
                <div className="grid gap-6 lg:grid-cols-[1fr,400px] min-h-[600px]">
                    <div className="flex flex-col gap-6">
                        <ActivityContainer itinerary={itinerary} />
                        <ExpenseSplitter itinerary={itinerary} />
                    </div>
                    <div className="h-full -mt-9">
                        <ChatBox itinerary={itinerary} />
                    </div>
                </div>
            </div>
        </div>
    );
}