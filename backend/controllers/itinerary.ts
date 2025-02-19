import { Request, Response } from "express";
import { createItinerarySchema, updateItinerarySchema } from "../zod/schemas";
import {
  createItinerary,
  deleteItinerary,
  getCollabItineraries,
  getCreatedItineraries,
  getItineraries,
  getItineraryById,
  updateItinerary,
} from "../services/itinerary";

///////////////////////// Public //////////////////////////////////

// @desc    Access all itineraries
// @route   GET /api/public/itinerary?page=1&limit=10
// @access  Public
export const getItinerariesPublicApi = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const itineraries = await getItineraries(page, limit);
    res.status(200).json(itineraries);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

// @desc    Access all created itineraries by the user
// @route   GET /api/public/itinerary/:ownerId/created?page=1&limit=10
// @access  Public
export const getCreatedItinerariesPublicApi = async (
  req: Request,
  res: Response,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const ownerId = parseInt(req.params.ownerId);
    const itineraries =
      (await getCreatedItineraries(ownerId, false, page, limit)) || {};
    res.status(200).json(itineraries);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

// @desc    Access an exisiting itinerary
// @route   GET /api/public/itinerary/:itineraryId
// @access  Public
export const getItineraryPublicApi = async (req: Request, res: Response) => {
  try {
    const itineraryId = parseInt(req.params.itineraryId);
    const itinerary = await getItineraryById(itineraryId, null);
    if (!itinerary) {
      res.status(404).json({ message: "Itinerary not found" });
    } else {
      res.status(200).json(itinerary);
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

///////////////////////// Protected //////////////////////////////////

// @desc    Creates a new itinerary
// @route   POST /api/itinerary
// @access  Protected
export const createItineraryApi = async (req: Request, res: Response) => {
  try {
    const ownerId = 1; // todo change this
    // const ownerId = req.user.id;
    const validatedFields = createItinerarySchema.safeParse(req.body);
    if (!validatedFields.success) {
      res.status(400).json({
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
        ownerId,
        title,
        location,
        visibility,
        start_date,
        end_date,
        collaborators,
      );
      res.status(201).json(itinerary);
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

// @desc    Access all created itineraries by the user
// @route   GET /api/itinerary/:ownerId/created?page=1&limit=10
// @access  Protected
export const getCreatedItinerariesProtectedApi = async (
  req: Request,
  res: Response,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const ownerId = parseInt(req.params.ownerId);
    const userId = 1; // todo change this
    // const userId = req.user.id;
    let itineraries =
      (await getCreatedItineraries(ownerId, ownerId == userId, page, limit)) ||
      {};
    res.status(200).json(itineraries);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

// @desc    Access all collaborated itineraries by the user
// @route   GET /api/itinerary/collaborated?page=1&limit=10
// @access  Protected
export const getCollabItinerariesApi = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const userId = 1; // todo change this
    // const userId = req.user.id;
    const itineraries = (await getCollabItineraries(userId, page, limit)) || {};
    res.status(200).json(itineraries);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

// @desc    Access an exisiting itinerary
// @route   GET /api/itinerary/:itineraryId
// @access  Protected
export const getItineraryProtectedApi = async (req: Request, res: Response) => {
  try {
    const itineraryId = parseInt(req.params.itineraryId);
    const userId = 1; // todo change this
    // const userId = req.user.id;
    const itinerary = await getItineraryById(itineraryId, userId);
    if (!itinerary) {
      res.status(404).json({ message: "Itinerary not found" });
    } else {
      res.status(200).json(itinerary);
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

// @desc    Update an itinerary
// @route   PUT /api/itinerary/:itineraryId
// @access  Protected
export const updateItineraryApi = async (req: Request, res: Response) => {
  try {
    const validatedFields = await updateItinerarySchema.safeParseAsync(
      req.body,
    );
    if (!validatedFields.success) {
      res.status(400).json({
        message: validatedFields.error.errors
          .map((err) => `${err.path.join(".")}: ${err.message}`)
          .join(", "),
      });
    } else {
      const { title, location, visibility, photo_url, start_date, end_date } =
        validatedFields.data;
      const itineraryId = parseInt(req.params.itineraryId);
      let itinerary = await updateItinerary(
        itineraryId,
        title,
        location,
        photo_url || null, 
        visibility,
        start_date,
        end_date,
      );
      res.status(200).json(itinerary);
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

// @desc    Delete an itinerary
// @route   DELETE /api/itinerary/:itineraryId
// @access  Protected
export const deleteItineraryApi = async (req: Request, res: Response) => {
  try {
    const itineraryId = parseInt(req.params.itineraryId);
    const itinerary = await deleteItinerary(itineraryId);
    if (itinerary.count < 1) {
      res.status(404).json({ message: "Itinerary not found" });
    } else {
      res.status(200).json({ message: "Succcessfully deleted itinerary" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};
