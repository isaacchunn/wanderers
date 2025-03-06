import { db } from "../controllers/db";

export const createMessage = async (
  userId: number | null,
  itineraryId: number | null,
  message: string
) => {
  try {
    if (userId && itineraryId) {
      const chatMessage = await db.chatMessage.create({
        data: {
          chat_message_by_id: userId,
          itinerary_id: itineraryId,
          chat_message: message,
        },
        include: {
          chat_message_by: {
            select: {
              username: true,
            },
          },
        },
      });
      return chatMessage;
    }
  } catch (error: any) {
    return null;
  }
  return null;
};

export const getAllMessagesByItineraryId = async (itineraryId: number) => {
  const messages = await db.chatMessage.findMany({
    where: {
      itinerary_id: itineraryId,
    },
    include: {
      chat_message_by: {
        select: {
          username: true,
        },
      },
    },
  });

  return messages;
};
