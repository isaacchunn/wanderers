import { Request, Response } from "express";
import { createItinerarySchema, updateItinerarySchema } from "../zod/schemas";
import {
  createItinerary,
  deleteItinerary,
  getCollabItineraries,
  getCreatedItineraries,
  getItineraries,
  getItineraryById,
  undoDeleteItinerary,
  updateItinerary,
} from "../services/itinerary";
import { HttpStatusCode } from "axios";

interface AuthenticatedRequest extends Request {
  user?: { id: number };
}

///////////////////////// Public //////////////////////////////////

// @desc    Access all itineraries
// @route   GET /api/public/itinerary?page=1&limit=10
// @access  Public
export const getItinerariesPublicApi = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const itineraries = await getItineraries(page, limit);
    res.status(HttpStatusCode.Ok).json(itineraries);
  } catch (error: any) {
    res
      .status(HttpStatusCode.InternalServerError)
      .json({ message: error.message || "Internal Server Error" });
  }
};

// @desc    Access all created itineraries by the user
// @route   GET /api/public/itinerary/:ownerId/created?page=1&limit=10
// @access  Public
export const getCreatedItinerariesPublicApi = async (
  req: Request,
  res: Response
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const ownerId = parseInt(req.params.ownerId);
    const itineraries =
      (await getCreatedItineraries(ownerId, false, page, limit)) || {};
    res.status(HttpStatusCode.Ok).json(itineraries);
  } catch (error: any) {
    res
      .status(HttpStatusCode.InternalServerError)
      .json({ message: error.message || "Internal Server Error" });
  }
};

// @desc    Access an exisiting itinerary
// @route   GET /api/public/itinerary/:itineraryId
// @access  Public
export const getItineraryPublicApi = async (req: Request, res: Response) => {
  try {
    const itineraryId = parseInt(req.params.itineraryId);
    const itinerary = await getItineraryById(itineraryId, -1);
    if (!itinerary) {
      res
        .status(HttpStatusCode.NotFound)
        .json({ message: "Itinerary not found" });
    } else {
      res.status(HttpStatusCode.Ok).json(itinerary);
    }
  } catch (error: any) {
    res
      .status(HttpStatusCode.InternalServerError)
      .json({ message: error.message || "Internal Server Error" });
  }
};

///////////////////////// Protected //////////////////////////////////

// @desc    Creates a new itinerary
// @route   POST /api/itinerary
// @access  Protected
export const createItineraryApi = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user!.id;
    const validatedFields = createItinerarySchema.safeParse(req.body);
    if (!validatedFields.success) {
      res.status(HttpStatusCode.BadRequest).json({
        message: validatedFields.error.errors
          .map((err) => `${err.path.join(".")}: ${err.message}`)
          .join(", "),
      });
    } else {
      const {
        title,
        location,
        visibility,
        start_date,
        end_date,
        collaborators,
      } = validatedFields.data;
      let itinerary = await createItinerary(
        userId,
        title,
        location,
        visibility,
        start_date,
        end_date,
        collaborators
      );
      res.status(HttpStatusCode.Created).json(itinerary);
    }
  } catch (error: any) {
    res
      .status(HttpStatusCode.InternalServerError)
      .json({ message: error.message || "Internal Server Error" });
  }
};

// @desc    Access all created itineraries by the user
// @route   GET /api/itinerary/:ownerId/created?page=1&limit=10
// @access  Protected
export const getCreatedItinerariesProtectedApi = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const ownerId = parseInt(req.params.ownerId);
    const userId = req.user!.id;
    let itineraries =
      (await getCreatedItineraries(ownerId, ownerId == userId, page, limit)) ||
      {};
    res.status(HttpStatusCode.Ok).json(itineraries);
  } catch (error: any) {
    res
      .status(HttpStatusCode.InternalServerError)
      .json({ message: error.message || "Internal Server Error" });
  }
};

// @desc    Access all collaborated itineraries by the user
// @route   GET /api/itinerary/collaborated?page=1&limit=10
// @access  Protected
export const getCollabItinerariesApi = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const userId = req.user!.id;
    const itineraries = (await getCollabItineraries(userId, page, limit)) || {};
    res.status(HttpStatusCode.Ok).json(itineraries);
  } catch (error: any) {
    res
      .status(HttpStatusCode.InternalServerError)
      .json({ message: error.message || "Internal Server Error" });
  }
};

// @desc    Access an exisiting itinerary
// @route   GET /api/itinerary/:itineraryId
// @access  Protected
export const getItineraryProtectedApi = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user!.id;
    const itineraryId = parseInt(req.params.itineraryId);
    const itinerary = await getItineraryById(itineraryId, userId);
    if (!itinerary) {
      res
        .status(HttpStatusCode.NotFound)
        .json({ message: "Itinerary not found" });
    } else {
      res.status(HttpStatusCode.Ok).json(itinerary);
    }
  } catch (error: any) {
    res
      .status(HttpStatusCode.InternalServerError)
      .json({ message: error.message || "Internal Server Error" });
  }
};

// @desc    Update an itinerary
// @route   PUT /api/itinerary/:itineraryId
// @access  Protected
export const updateItineraryApi = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user!.id;
    const itineraryId = parseInt(req.params.itineraryId);
    const validatedFields = await updateItinerarySchema.safeParseAsync(
      req.body
    );
    if (!validatedFields.success) {
      res.status(HttpStatusCode.BadRequest).json({
        message: validatedFields.error.errors
          .map((err) => `${err.path.join(".")}: ${err.message}`)
          .join(", "),
      });
    } else {
      const { title, location, visibility, photo_url, start_date, end_date } =
        validatedFields.data;
      let itinerary = await updateItinerary({
        userId,
        itineraryId,
        title,
        location,
        visibility,
        photo_url,
        start_date,
        end_date,
      });
      res.status(HttpStatusCode.Ok).json(itinerary);
    }
  } catch (error: any) {
    res
      .status(HttpStatusCode.InternalServerError)
      .json({ message: error.message || "Internal Server Error" });
  }
};

// @desc    Delete an itinerary
// @route   DELETE /api/itinerary/:itineraryId
// @access  Protected
export const deleteItineraryApi = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user!.id;
    const itineraryId = parseInt(req.params.itineraryId);
    const affectedRows = await deleteItinerary(userId, itineraryId);
    if (affectedRows < 1) {
      res
        .status(HttpStatusCode.NotFound)
        .json({ message: "Itinerary not found" });
    } else {
      res.status(HttpStatusCode.Ok).json({ deletedItineraryId: itineraryId });
    }
  } catch (error: any) {
    res
      .status(HttpStatusCode.InternalServerError)
      .json({ message: error.message || "Internal Server Error" });
  }
};

// @desc    Restore a deleted itinerary
// @route   PUT /api/itinerary/:itineraryId/restore
// @access  Protected
export const undoDeleteItineraryApi = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user!.id;
    const itineraryId = parseInt(req.params.itineraryId);
    const affectedRows = await undoDeleteItinerary(userId, itineraryId);
    if (affectedRows < 1) {
      res
        .status(HttpStatusCode.NotFound)
        .json({ message: "Itinerary not found" });
    } else {
      const itinerary = await getItineraryById(itineraryId, userId);
      res.status(HttpStatusCode.Ok).json(itinerary);
    }
  } catch (error: any) {
    res
      .status(HttpStatusCode.InternalServerError)
      .json({ message: error.message || "Internal Server Error" });
  }
};
