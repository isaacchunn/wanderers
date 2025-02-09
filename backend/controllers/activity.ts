import { Request, Response } from "express";
import {
  createActivity,
  getActivityById,
  getActivitiesByItineraryId,
  updateActivity,
  deleteActivity,
} from "../services/activity";
import { activitySchema } from "../zod/schemas";

// @desc    Create new activity
// @route   POST /api/activity
// @access  Private
export const createActivityController = async (req: Request, res: Response) => {
  try {
    const parsed = activitySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        message: parsed.error.errors
          .map((err) => `${err.path.join(".")}: ${err.message}`)
          .join(", "),
      });
    } else {
      const { title, description, itinerary_id, expense, split, sequence } =
        parsed.data;
      let activity = await createActivity(
        title,
        description,
        itinerary_id,
        expense,
        split,
        sequence,
      );

      res.status(201).json(activity);
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
      res.status(404).json({ message: "Activity not found" });
    } else {
      res.status(200).json(activity);
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
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
    res.status(200).json(activities);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

// @desc    Update activity by id
// @route   PUT /api/activity/:id
// @access  Private
export const updateActivityController = async (req: Request, res: Response) => {
  try {
    const parsed = activitySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        message: parsed.error.errors
          .map((err) => `${err.path.join(".")}: ${err.message}`)
          .join(", "),
      });
    } else {
      const { title, description, itinerary_id, expense, split, sequence } =
        parsed.data;
      let activity = await updateActivity(
        parseInt(req.params.id),
        title,
        description,
        itinerary_id,
        expense,
        split,
        sequence,
      );

      res.status(200).json(activity);
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

// @desc    Soft deletes activity by id
// @route   DELETE /api/activity/:id
// @access  Private
export const deleteActivityController = async (req: Request, res: Response) => {
  try {
    let activity = await deleteActivity(parseInt(req.params.id));
    if (!activity) {
      res.status(404).json({ message: "Activity not found" });
    } else {
      res.status(200).json(activity);
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};
