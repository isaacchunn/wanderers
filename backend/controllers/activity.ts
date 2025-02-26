import { Request, Response } from "express";

interface AuthenticatedRequest extends Request {
  user?: { id: number };
}
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
export const createActivityController = async (req: AuthenticatedRequest, res: Response) => {
  let responseCode = HttpCode.ResourceCreated;
  let responseBody: any = {};

  try {
    const parsed = activitySchema.safeParse(req.body);
    if (!parsed.success) {
      throw new Error(
        parsed.error.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join(", ")
      );
    }

    const activity = await createActivity({ ...parsed.data });
    responseBody = activity;
  } catch (error: any) {
    responseCode = HttpCode.BadRequest;
    responseBody = { message: error.message || "Internal Server Error" };
  }

  res.status(responseCode).json(responseBody);
};


// @desc    Get activity by id
// @route   GET /api/activity/:id
// @access  Private
export const getActivityByIdController = async (req: AuthenticatedRequest, res: Response) => {
  let responseCode = HttpCode.OK;
  let responseBody: any = {};

  try {
    const activity = await getActivityById(parseInt(req.params.id));
    if (!activity) {
      responseCode = HttpCode.NotFound
      throw new Error("Activity not found");
    }
    if (!activity.active) {
      responseCode = HttpCode.NotFound
      throw new Error("Activity has been deleted");
    }

    responseBody = activity;
  } catch (error: any) {
    responseCode = responseCode || HttpCode.BadRequest;
    responseBody = { message: error.message || "Internal Server Error" };
  }

  res.status(responseCode).json(responseBody);
};


// @desc    Get activities by itinerary id
// @route   GET /api/activity/itinerary/:itinerary_id
// @access  Private
export const getActivitiesByItineraryIdController = async (req: AuthenticatedRequest, res: Response) => {
  let responseCode = HttpCode.OK;
  let responseBody: any = {};

  try {
    const activities = await getActivitiesByItineraryId(parseInt(req.params.itinerary_id));
    responseBody = activities;
  } catch (error: any) {
    responseCode = HttpCode.BadRequest;
    responseBody = { message: error.message || "Internal Server Error" };
  }

  res.status(responseCode).json(responseBody);
};


// @desc    Update activity by id
// @route   PUT /api/activity/:id
// @access  Private
export const updateActivityController = async (req: AuthenticatedRequest, res: Response) => {
  let responseCode = HttpCode.OK;
  let responseBody: any = {};

  try {
    const activity = await getActivityById(parseInt(req.params.id));
    if (!activity) {
      throw new Error("Activity not found");
    }

    const parsed = activitySchema.safeParse(req.body);
    if (!parsed.success) {
      throw new Error(
        parsed.error.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join(", ")
      );
    }

    const updatedActivity = await updateActivity(parseInt(req.params.id), parsed.data);
    responseBody = updatedActivity;
  } catch (error: any) {
    responseCode = HttpCode.BadRequest;
    responseBody = { message: error.message || "Internal Server Error" };
  }

  res.status(responseCode).json(responseBody);
};

// @desc    Soft delete activity by id
// @route   DELETE /api/activity/:id
// @access  Private
export const deleteActivityController = async (req: AuthenticatedRequest, res: Response) => {
  let responseCode = HttpCode.OK;
  let responseBody: any = {};

  try {
    const activity = await getActivityById(parseInt(req.params.id));
    if (!activity) {
      throw new Error("Activity not found");
    }

    const deletedActivity = await deleteActivity(parseInt(req.params.id));
    responseBody = deletedActivity;
  } catch (error: any) {
    responseCode = HttpCode.BadRequest;
    responseBody = { message: error.message || "Internal Server Error" };
  }

  res.status(responseCode).json(responseBody);
};
