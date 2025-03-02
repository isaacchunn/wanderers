import { Request, Response } from "express";
import { HttpStatusCode } from "axios";
import { getAllMessagesByItineraryId } from "../services/chat";
import { isOwnerOrCollaborator } from "../services/itinerary";

interface AuthenticatedRequest extends Request {
  user?: { id: number };
}

// @desc    Get chat messages by itinerary id
// @route   GET /api/chat/:itineraryId
// @access  Protected
export const getChatMessagesApi = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user!.id;
    const itineraryId = parseInt(req.params.itineraryId);

    if (!(await isOwnerOrCollaborator(userId, itineraryId))) {
      res
        .status(HttpStatusCode.Unauthorized)
        .json({ message: "You are not allowed to view the chat messages" });
    } else {
      const messages = await getAllMessagesByItineraryId(itineraryId);
      res.status(HttpStatusCode.Ok).json(messages);
    }
  } catch (error: any) {
    res
      .status(HttpStatusCode.InternalServerError)
      .json({ message: error.message || "Internal Server Error" });
  }
};
