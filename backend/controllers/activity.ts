import e, { Request, Response } from "express";
import {
  createActivity,
  getActivityById,
  getActivitiesByItineraryId,
  updateActivity,
  deleteActivity,
} from "../services/activity";
import { activitySchema } from "../zod/schemas";
import { HttpCode } from "../lib/httpCodes";

// @desc    Create new activity
// @route   POST /api/activity
// @access  Private
export const createActivityController = async (req: Request, res: Response) => {
  try {
    const parsed = activitySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(HttpCode.BadRequest).json({
        message: parsed.error.errors
          .map((err) => `${err.path.join(".")}: ${err.message}`)
          .join(", "),
      });
    } else {
      const {
        title,
        description,
        itinerary_id,
        lat,
        lon,
        expense,
        split,
        sequence,
        start_date,
        end_date,
        photo_url
      } = parsed.data;
      let activity = await createActivity(
        title,
        description,
        itinerary_id,
        lat,
        lon,
        expense,
        split,
        sequence,
        photo_url || null,
        start_date,
        end_date,
      );

      res.status(HttpCode.ResourceCreated).json(activity);
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

// @desc    Get activity by id
// @route   POST /api/activity/:id
// @access  Private
export const getActivityByIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    let activity = await getActivityById(parseInt(req.params.id));
    if (!activity) {
      res.status(HttpCode.NotFound).json({ message: "Activity not found" });
    } else {
      res.status(HttpCode.OK).json(activity);
    }
  } catch (error: any) {
    res.status(HttpCode.InternalServerError).json({ message: error.message || "Internal Server Error" });
  }
};

// @desc    Get activities by itinerary id
// @route   POST /api/activity/itinerary/:itinerary_id
// @access  Private
export const getActivitiesByItineraryIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    let activities = await getActivitiesByItineraryId(
      parseInt(req.params.itinerary_id),
    );
    res.status(HttpCode.OK).json(activities);
  } catch (error: any) {
    res.status(HttpCode.InternalServerError).json({ message: error.message || "Internal Server Error" });
  }
};

// @desc    Update activity by id
// @route   PUT /api/activity/:id
// @access  Private
export const updateActivityController = async (req: Request, res: Response) => {
  try {
    const parsed = activitySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(HttpCode.BadRequest).json({
        message: parsed.error.errors
          .map((err) => `${err.path.join(".")}: ${err.message}`)
          .join(", "),
      });
    } else {
      const {
        title,
        description,
        itinerary_id,
        lat,
        lon,
        expense,
        split,
        sequence,
        photo_url,
        start_date,
        end_date,
      } = parsed.data;
      let activity = await updateActivity(
        parseInt(req.params.id),
        title,
        description,
        itinerary_id,
        lat,
        lon,
        expense,
        split,
        sequence,
        photo_url || null,
        start_date,
        end_date,
      );

      res.status(HttpCode.OK).json(activity);
    }
  } catch (error: any) {
    res.status(HttpCode.InternalServerError).json({ message: error.message || "Internal Server Error" });
  }
};

// @desc    Soft deletes activity by id
// @route   DELETE /api/activity/:id
// @access  Private
export const deleteActivityController = async (req: Request, res: Response) => {
  try {
    let activity = await deleteActivity(parseInt(req.params.id));
    if (!activity) {
      res.status(HttpCode.NotFound).json({ message: "Activity not found" });
    } else {
      res.status(HttpCode.OK).json(activity);
    }
  } catch (error: any) {
    res.status(HttpCode.InternalServerError).json({ message: error.message || "Internal Server Error" });
  }
};
