import {
  createActivity,
  getActivityById,
  getActivitiesByItineraryId,
  updateActivity,
  updateActivitySequence,
  deleteActivity,
  ActivityData
} from "../../services/activity";
import { db } from "../../controllers/db";
import { ExpenseSplitType } from "prisma/prisma-client";
import { HTTP_STATUS, RESPONSE_MESSAGES, TEST_DATA, createMockServices } from "../support/utils/test-utils";

// Create a centralized mock services object
const mockServices = {
  create: jest.fn(),
  findUnique: jest.fn(),
  findMany: jest.fn(),
  update: jest.fn()
};

// Mock the Prisma client
jest.mock("../../controllers/db", () => ({
  db: {
    activity: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn()
    }
  }
}));

describe("Activity Service Tests", () => {
  // Sample activity data for testing
  const sampleActivity: ActivityData = {
    title: "Test Activity",
    description: "Test Description",
    itinerary_id: 1,
    lat: 40.7128,
    lon: -74.0060,
    expense: 100,
    split: "EQUAL" as ExpenseSplitType,
    sequence: 1,
    photo_url: "https://example.com/photo.jpg",
    start_date: new Date(),
    end_date: new Date(),
    place_id: "place123",
    formatted_address: "123 Test St, Test City, TC 12345",
    types: ["tourist_attraction", "point_of_interest"],
    rating: 4.5,
    user_ratings_total: 1000,
    international_phone_number: "+1234567890",
    website: "https://example.com",
    opening_hours: ["Monday: 9am-5pm", "Tuesday: 9am-5pm"],
    google_maps_url: "https://maps.google.com/?q=test"
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe("createActivity", () => {
    it("should create a new activity with all fields", async () => {
      // Setup the mock to return the created activity
      (db.activity.create as jest.Mock).mockResolvedValue({
        id: 1,
        ...sampleActivity,
        created_at: new Date(),
        updated_at: new Date(),
        active: true
      });

      // Call the service function
      const result = await createActivity(sampleActivity);

      // Assertions
      expect(db.activity.create).toHaveBeenCalledWith({
        data: expect.objectContaining(sampleActivity)
      });
      expect(result).toEqual(expect.objectContaining({
        id: 1,
        ...sampleActivity
      }));
    });

    it("should create activity with minimal required fields", async () => {
      // Create minimal activity data
      const minimalActivity: ActivityData = {
        title: "Minimal Activity",
        description: null,
        itinerary_id: 1,
        lat: 0,
        lon: 0,
        expense: 0,
        split: "EQUAL" as ExpenseSplitType,
        sequence: 1,
        start_date: new Date(),
        end_date: new Date()
      };

      // Setup the mock
      (db.activity.create as jest.Mock).mockResolvedValue({
        id: 2,
        ...minimalActivity,
        created_at: new Date(),
        updated_at: new Date(),
        active: true
      });

      // Call the service function
      const result = await createActivity(minimalActivity);

      // Assertions
      expect(db.activity.create).toHaveBeenCalledWith({
        data: expect.objectContaining(minimalActivity)
      });
      expect(result).toEqual(expect.objectContaining({
        id: 2,
        ...minimalActivity
      }));
    });

    it("should handle database errors during creation", async () => {
      // Setup the mock to throw an error
      const dbError = new Error("Database error");
      (db.activity.create as jest.Mock).mockRejectedValue(dbError);

      // Call the service function and expect it to throw
      await expect(createActivity(sampleActivity)).rejects.toThrow(dbError);
      expect(db.activity.create).toHaveBeenCalledWith({
        data: expect.objectContaining(sampleActivity)
      });
    });
  });

  describe("getActivityById", () => {
    it("should return an activity when it exists", async () => {
      // Setup the mock
      const mockActivity = {
        id: 1,
        ...sampleActivity,
        created_at: new Date(),
        updated_at: new Date(),
        active: true
      };
      (db.activity.findUnique as jest.Mock).mockResolvedValue(mockActivity);

      // Call the service function
      const result = await getActivityById(1);

      // Assertions
      expect(db.activity.findUnique).toHaveBeenCalledWith({
        where: { id: 1 }
      });
      expect(result).toEqual(mockActivity);
    });

    it("should return null when activity does not exist", async () => {
      // Setup the mock
      (db.activity.findUnique as jest.Mock).mockResolvedValue(null);

      // Call the service function
      const result = await getActivityById(999);

      // Assertions
      expect(db.activity.findUnique).toHaveBeenCalledWith({
        where: { id: 999 }
      });
      expect(result).toBeNull();
    });

    it("should handle database errors", async () => {
      // Setup the mock to throw an error
      const dbError = new Error("Database error");
      (db.activity.findUnique as jest.Mock).mockRejectedValue(dbError);

      // Call the service function and expect it to throw
      await expect(getActivityById(1)).rejects.toThrow(dbError);
      expect(db.activity.findUnique).toHaveBeenCalledWith({
        where: { id: 1 }
      });
    });
  });

  describe("getActivitiesByItineraryId", () => {
    it("should return activities for an itinerary", async () => {
      // Setup mock data
      const mockActivities = [
        {
          id: 1,
          ...sampleActivity,
          created_at: new Date(),
          updated_at: new Date(),
          active: true
        },
        {
          id: 2,
          ...sampleActivity,
          title: "Another Activity",
          sequence: 2,
          created_at: new Date(),
          updated_at: new Date(),
          active: true
        }
      ];
      (db.activity.findMany as jest.Mock).mockResolvedValue(mockActivities);

      // Call the service function
      const result = await getActivitiesByItineraryId(1);

      // Assertions
      expect(db.activity.findMany).toHaveBeenCalledWith({
        where: { itinerary_id: 1, active: true }
      });
      expect(result).toEqual(mockActivities);
      expect(result.length).toBe(2);
    });

    it("should return empty array when no activities exist", async () => {
      // Setup the mock
      (db.activity.findMany as jest.Mock).mockResolvedValue([]);

      // Call the service function
      const result = await getActivitiesByItineraryId(999);

      // Assertions
      expect(db.activity.findMany).toHaveBeenCalledWith({
        where: { itinerary_id: 999, active: true }
      });
      expect(result).toEqual([]);
    });

    it("should handle database errors", async () => {
      // Setup the mock to throw an error
      const dbError = new Error("Database error");
      (db.activity.findMany as jest.Mock).mockRejectedValue(dbError);

      // Call the service function and expect it to throw
      await expect(getActivitiesByItineraryId(1)).rejects.toThrow(dbError);
      expect(db.activity.findMany).toHaveBeenCalledWith({
        where: { itinerary_id: 1, active: true }
      });
    });
  });

  describe("updateActivity", () => {
    it("should update an activity with all fields", async () => {
      // Setup mock data
      const updatedActivity = {
        ...sampleActivity,
        title: "Updated Title",
        description: "Updated Description"
      };
      
      const mockResult = {
        id: 1,
        ...updatedActivity,
        created_at: new Date(),
        updated_at: new Date(),
        active: true
      };
      
      (db.activity.update as jest.Mock).mockResolvedValue(mockResult);

      // Call the service function
      const result = await updateActivity(1, updatedActivity);

      // Assertions
      expect(db.activity.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining(updatedActivity)
      });
      expect(result).toEqual(mockResult);
    });

    it("should handle database errors during update", async () => {
      // Setup the mock to throw an error
      const dbError = new Error("Database error");
      (db.activity.update as jest.Mock).mockRejectedValue(dbError);

      // Call the service function and expect it to throw
      await expect(updateActivity(1, sampleActivity)).rejects.toThrow(dbError);
      expect(db.activity.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining(sampleActivity)
      });
    });
  });

  describe("updateActivitySequence", () => {
    it("should update only the sequence of an activity", async () => {
      // Setup mock data
      const newSequence = 3;
      
      const mockResult = {
        id: 1,
        ...sampleActivity,
        sequence: newSequence,
        created_at: new Date(),
        updated_at: new Date(),
        active: true
      };
      
      (db.activity.update as jest.Mock).mockResolvedValue(mockResult);

      // Call the service function
      const result = await updateActivitySequence(1, newSequence);

      // Assertions
      expect(db.activity.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { sequence: newSequence }
      });
      expect(result).toEqual(mockResult);
      expect(result.sequence).toBe(newSequence);
    });

    it("should handle database errors during sequence update", async () => {
      // Setup the mock to throw an error
      const dbError = new Error("Database error");
      (db.activity.update as jest.Mock).mockRejectedValue(dbError);

      // Call the service function and expect it to throw
      await expect(updateActivitySequence(1, 3)).rejects.toThrow(dbError);
      expect(db.activity.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { sequence: 3 }
      });
    });
  });

  describe("deleteActivity", () => {
    it("should soft delete an activity by setting active to false", async () => {
      // Setup mock data
      const mockResult = {
        id: 1,
        ...sampleActivity,
        active: false,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      (db.activity.update as jest.Mock).mockResolvedValue(mockResult);

      // Call the service function
      const result = await deleteActivity(1);

      // Assertions
      expect(db.activity.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { active: false }
      });
      expect(result).toEqual(mockResult);
      expect(result.active).toBe(false);
    });

    it("should handle database errors during deletion", async () => {
      // Setup the mock to throw an error
      const dbError = new Error("Database error");
      (db.activity.update as jest.Mock).mockRejectedValue(dbError);

      // Call the service function and expect it to throw
      await expect(deleteActivity(1)).rejects.toThrow(dbError);
      expect(db.activity.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { active: false }
      });
    });
  });
});