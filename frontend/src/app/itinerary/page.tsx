import { ChatBox } from "../../components/ui/chat-box";
import { ExpenseSplitter } from "../../components/ui/expense-splitter";
import { SortableItinerary } from "../../components/sortable-itinerary";

export default async function ItineraryPage() {
    try {
        const response = await fetch(
            "http://localhost:4000/api/public/itinerary",
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                cache: "no-store", // Ensures fresh data on every request
            }
        );

        if (!response.ok) {
            throw new Error(
                `Failed to fetch itinerary: ${response.status} ${response.statusText}`
            );
        }

        const data = await response.json();
        console.log("Fetched itinerary:", data);
    } catch (error) {
        console.error("Error fetching itinerary:", error);
    }

    return (
        <div className="bg-background p-6 md:p-12 flex items-center justify-items-center">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight">
                            Paris Itinerary
                        </h1>
                        <p className="mt-2 text-muted-foreground">
                            Drag and drop to reorder your itinerary for the day
                        </p>
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-[1fr,300px]">
                        <SortableItinerary />
                        <ChatBox />
                    </div>
                    <div>
                        <ExpenseSplitter />
                    </div>
                </div>
            </div>
        </div>
    );
}
