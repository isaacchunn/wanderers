import { ChatBox } from "../../../components/ui/chat-box";
import { ExpenseSplitter } from "@/components/ui/expense-splitter";
import { fetchItinerary } from "@/lib/itineraryHandler";
import { ActivityContainer } from "@/components/activity-container";

export default async function ItineraryPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const itineraryId = (await params).id;
    const data = await fetchItinerary(itineraryId);

    if (!data) {
        return (
            <div className="bg-background p-6 md:p-12 flex items-center justify-items-center">
                <div className="mx-auto max-w-6xl">
                    <h1 className="text-4xl font-bold tracking-tight">Error</h1>
                    <p className="mt-2 text-muted-foreground">
                        There was an error fetching the itinerary data. Please
                        try again later.
                    </p>
                </div>
            </div>
        );
    } else {
        return (
            <div className="bg-background p-6 md:p-12 flex items-center justify-items-center">
                <div className="mx-auto max-w-6xl w-full">
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight">
                                Paris Itinerary
                            </h1>
                            <p className="mt-2 text-muted-foreground">
                                Drag and drop to reorder your itinerary for the
                                day
                            </p>
                        </div>
                    </div>
                    <div className="grid gap-6 lg:grid-cols-[1fr,400px] min-h-[600px]">
                        <div className="flex flex-col gap-6">
                            <ActivityContainer />
                            <ExpenseSplitter />
                        </div>
                        <div className="h-full">
                            <ChatBox />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
