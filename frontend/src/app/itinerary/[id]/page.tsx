import { ChatBox } from "@/components/chat-box";
import { ExpenseSplitter } from "@/components/expense-splitter";
import { ActivityContainer } from "@/components/activity-container";
import { DropdownSetting } from "@/components/dropdown-menu";
import { ItineraryTitle } from "@/components/itinerary-title";
import { fetchItineraryById } from "@/lib/itineraryHandler";
import { DateRangePicker } from "@/components/calendar-picker";
import { cookies } from "next/headers";
import { fetchChatMessages } from "@/lib/chatHandler";

export default async function ItineraryPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const itineraryId = (await params).id;
  const itinerary = await fetchItineraryById(itineraryId);
  const cookieStore = await cookies();
  const userData = cookieStore.get("user")?.value;
  let chatMessages = undefined;

  if (!itinerary) {
    return (
      <div className="bg-background p-6 md:p-12 flex items-center justify-center ">
        <h1 className="text-4xl font-bold">Loading itinerary...</h1>
      </div>
    );
  }

  let isOwnerOrCollab = false;
  let userId = null;
  if (userData) {
    const jsonUserData = JSON.parse(userData);
    isOwnerOrCollab =
      itinerary.owner_id === jsonUserData.id ||
      itinerary.collaborators.some((collab) => collab.id === jsonUserData.id);
    if (isOwnerOrCollab) {
      chatMessages = await fetchChatMessages(itineraryId);
      userId = jsonUserData.id;
    }
  }

  return (
    <div className="container mx-auto py-8 w-fit">
      <div className="flex flex-row justify-between items-start">
        <div className="flex flex-col gap-2">
          <ItineraryTitle itinerary={itinerary} />
          <div className="flex gap-72">
            <DateRangePicker itinerary={itinerary} />
          </div>
        </div>
        <DropdownSetting itineraryId={itineraryId} />
      </div>
      <div className="flex flex-col gap-2">
        <div className="grid gap-6 lg:grid-cols-[1fr,400px] min-h-[600px]">
          <div className="flex flex-col gap-6">
            <ActivityContainer itinerary={itinerary} />
            <ExpenseSplitter itinerary={itinerary} />
          </div>
          {isOwnerOrCollab && (
            <div className="h-full -mt-9">
              <ChatBox
                itinerary={itinerary}
                chatMessages={chatMessages}
                userId={userId}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
