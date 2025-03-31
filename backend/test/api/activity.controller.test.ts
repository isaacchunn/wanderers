import { Request, Response } from "express";
import {
  createActivityController,
  getActivityByIdController,
  getActivitiesByItineraryIdController,
  updateActivityController,
  updateActivitySequenceController,
  deleteActivityController
} from "../../controllers/activity";
import * as activityService from "../../services/activity";
import { HttpCode } from "../../lib/httpCodes";

// Mock the activity service
jest.mock("../../services/activity", () => ({
  createActivity: jest.fn(),
  getActivityById: jest.fn(),
  getActivitiesByItineraryId: jest.fn(),
  updateActivity: jest.fn(),
  updateActivitySequence: jest.fn(),
  deleteActivity: jest.fn()
}));

// Mock zod schema validation
jest.mock("../../zod/schemas", () => ({
  activitySchema: {
    safeParse: jest.fn()
  }
}));

describe("Activity Controller Tests", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Setup request and response objects
    req = {
      body: {},
      params: {},
      // @ts-ignore
      user: { id: 1 }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Mock successful schema validation by default
    require("../../zod/schemas").activitySchema.safeParse = jest.fn().mockReturnValue({
      success: true,
      data: { name: "Test Activity", itinerary_id: 1 }
    });
  });

  describe("createActivityController", () => {
    it("should create activity and return 201 status when valid data is provided", async () => {
      const mockActivity = { id: 1, name: "Test Activity", itinerary_id: 1 };
      (activityService.createActivity as jest.Mock).mockResolvedValue(mockActivity);

      await createActivityController(req as any, res as any);

      expect(activityService.createActivity).toHaveBeenCalledWith(expect.objectContaining({
        name: "Test Activity",
        itinerary_id: 1
      }));
      expect(res.status).toHaveBeenCalledWith(HttpCode.ResourceCreated);
      expect(res.json).toHaveBeenCalledWith(mockActivity);
    });

    it("should return 400 status when validation fails", async () => {
      require("../../zod/schemas").activitySchema.safeParse = jest.fn().mockReturnValue({
        success: false,
        error: { errors: [{ path: ["name"], message: "Name is required" }] }
      });

      await createActivityController(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(HttpCode.BadRequest);
      expect(res.json).toHaveBeenCalledWith({ message: "name: Name is required" });
    });

    it("should return 400 status when service throws an error", async () => {
      (activityService.createActivity as jest.Mock).mockRejectedValue(new Error("Service error"));

      await createActivityController(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(HttpCode.BadRequest);
      expect(res.json).toHaveBeenCalledWith({ message: "Service error" });
    });
  });

  describe("getActivityByIdController", () => {
    it("should fetch activity and return 200 status when activity exists", async () => {
      const mockActivity = { id: 1, name: "Test Activity", active: true };
      req.params = { id: "1" };
      (activityService.getActivityById as jest.Mock).mockResolvedValue(mockActivity);

      await getActivityByIdController(req as any, res as any);

      expect(activityService.getActivityById).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
      expect(res.json).toHaveBeenCalledWith(mockActivity);
    });

    it("should return 404 status when activity is not found", async () => {
      req.params = { id: "999" };
      (activityService.getActivityById as jest.Mock).mockResolvedValue(null);

      await getActivityByIdController(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(HttpCode.NotFound);
      expect(res.json).toHaveBeenCalledWith({ message: "Activity not found" });
    });

    it("should return 404 status when activity is not active", async () => {
      const mockActivity = { id: 1, name: "Test Activity", active: false };
      req.params = { id: "1" };
      (activityService.getActivityById as jest.Mock).mockResolvedValue(mockActivity);

      await getActivityByIdController(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(HttpCode.NotFound);
      expect(res.json).toHaveBeenCalledWith({ message: "Activity has been deleted" });
    });

    it("should return 400 status when service throws an error", async () => {
      req.params = { id: "1" };
      (activityService.getActivityById as jest.Mock).mockRejectedValue(new Error("Service error"));

      await getActivityByIdController(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(HttpCode.BadRequest);
      expect(res.json).toHaveBeenCalledWith({ message: "Service error" });
    });
  });

  describe("getActivitiesByItineraryIdController", () => {
    it("should fetch activities and return 200 status", async () => {
      const mockActivities = [
        { id: 1, name: "Activity 1", itinerary_id: 1 },
        { id: 2, name: "Activity 2", itinerary_id: 1 }
      ];
      req.params = { itinerary_id: "1" };
      (activityService.getActivitiesByItineraryId as jest.Mock).mockResolvedValue(mockActivities);

      await getActivitiesByItineraryIdController(req as any, res as any);

      expect(activityService.getActivitiesByItineraryId).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
      expect(res.json).toHaveBeenCalledWith(mockActivities);
    });

    it("should return 400 status when service throws an error", async () => {
      req.params = { itinerary_id: "1" };
      (activityService.getActivitiesByItineraryId as jest.Mock).mockRejectedValue(new Error("Service error"));

      await getActivitiesByItineraryIdController(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(HttpCode.BadRequest);
      expect(res.json).toHaveBeenCalledWith({ message: "Service error" });
    });
  });

  describe("updateActivityController", () => {
    it("should update activity and return 200 status when valid data is provided", async () => {
      const mockActivity = { id: 1, name: "Updated Activity" };
      req.params = { id: "1" };
      req.body = { name: "Updated Activity" };

      (activityService.getActivityById as jest.Mock).mockResolvedValue({ id: 1, name: "Test Activity" });
      (activityService.updateActivity as jest.Mock).mockResolvedValue(mockActivity);

      await updateActivityController(req as any, res as any);

      expect(activityService.updateActivity).toHaveBeenCalledWith(1, expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
      expect(res.json).toHaveBeenCalledWith(mockActivity);
    });

    it("should return 400 status when activity is not found", async () => {
      req.params = { id: "999" };
      (activityService.getActivityById as jest.Mock).mockResolvedValue(null);

      await updateActivityController(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(HttpCode.BadRequest);
      expect(res.json).toHaveBeenCalledWith({ message: "Activity not found" });
    });

    it("should return 400 status when validation fails", async () => {
      req.params = { id: "1" };
      (activityService.getActivityById as jest.Mock).mockResolvedValue({ id: 1, name: "Test Activity" });

      require("../../zod/schemas").activitySchema.safeParse = jest.fn().mockReturnValue({
        success: false,
        error: { errors: [{ path: ["name"], message: "Name is required" }] }
      });

      await updateActivityController(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(HttpCode.BadRequest);
      expect(res.json).toHaveBeenCalledWith({ message: "name: Name is required" });
    });
  });

  describe("updateActivitySequenceController", () => {
    it("should update activity sequences and return 200 status when valid data is provided", async () => {
      const mockActivities = [
        { id: 1, sequence: 1 },
        { id: 2, sequence: 2 }
      ];

      req.body = {
        activities: [
          { id: 1, sequence: 2 },
          { id: 2, sequence: 1 }
        ]
      };

      (activityService.updateActivitySequence as jest.Mock)
        .mockResolvedValueOnce({ id: 1, sequence: 2 })
        .mockResolvedValueOnce({ id: 2, sequence: 1 });

      await updateActivitySequenceController(req as any, res as any);

      expect(activityService.updateActivitySequence).toHaveBeenCalledTimes(2);
      expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
      expect(res.json).toHaveBeenCalledWith([
        { id: 1, sequence: 2 },
        { id: 2, sequence: 1 }
      ]);
    });

    it("should return 400 status when activities array is empty", async () => {
      req.body = { activities: [] };

      await updateActivitySequenceController(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(HttpCode.BadRequest);
      expect(res.json).toHaveBeenCalledWith({ message: "Activities array is empty" });
    });

    it("should return 400 status when sequences are not unique", async () => {
      req.body = {
        activities: [
          { id: 1, sequence: 1 },
          { id: 2, sequence: 1 }
        ]
      };

      await updateActivitySequenceController(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(HttpCode.BadRequest);
      expect(res.json).toHaveBeenCalledWith({ message: "Activity sequences must be unique" });
    });
  });

  describe("deleteActivityController", () => {
    it("should delete activity and return 200 status when activity exists", async () => {
      const mockActivity = { id: 1, name: "Deleted Activity", active: false };
      req.params = { id: "1" };

      (activityService.getActivityById as jest.Mock).mockResolvedValue({ id: 1, name: "Test Activity" });
      (activityService.deleteActivity as jest.Mock).mockResolvedValue(mockActivity);

      await deleteActivityController(req as any, res as any);

      expect(activityService.deleteActivity).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
      expect(res.json).toHaveBeenCalledWith(mockActivity);
    });

    it("should return 400 status when activity is not found", async () => {
      req.params = { id: "999" };
      (activityService.getActivityById as jest.Mock).mockResolvedValue(null);

      await deleteActivityController(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(HttpCode.BadRequest);
      expect(res.json).toHaveBeenCalledWith({ message: "Activity not found" });
    });

    it("should return 400 status when service throws an error", async () => {
      req.params = { id: "1" };
      (activityService.getActivityById as jest.Mock).mockResolvedValue({ id: 1, name: "Test Activity" });
      (activityService.deleteActivity as jest.Mock).mockRejectedValue(new Error("Service error"));

      await deleteActivityController(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(HttpCode.BadRequest);
      expect(res.json).toHaveBeenCalledWith({ message: "Service error" });
    });
  });
});