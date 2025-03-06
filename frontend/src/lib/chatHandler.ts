import { ChatMessage } from "@/lib/types";
import { getToken } from "./auth";

const NEXT_PUBLIC_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Fetches all chat messages by itinerary ID
export async function fetchChatMessages(
  itineraryId: string
): Promise<ChatMessage[] | undefined> {
  try {
    const token = await getToken();
    const response = await fetch(
      `${NEXT_PUBLIC_BACKEND_URL}/api/chat/${itineraryId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch chat messages: ${response.status} ${response.statusText}`
      );
    }

    const data: ChatMessage[] = await response.json();
    return data;
  } catch (error) {
    console.error("ChatMessages - Error fetching chat messages:", error);
    return undefined;
  }
}
