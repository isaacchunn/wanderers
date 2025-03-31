import {
  updateProfileDescription,
  updateProfileImagePath
} from "../../services/profile";
import { db } from "../../controllers/db";

// Mock the Prisma client
jest.mock("../../controllers/db", () => ({
  db: {
    user: {
      updateMany: jest.fn()
    }
  }
}));

describe("Profile Service Tests", () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe("updateProfileDescription", () => {
    it("should update user profile description", async () => {
      // Setup the mock to return a successful update
      (db.user.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      // Call the service function
      await updateProfileDescription(1, "This is my new profile description");

      // Assertions
      expect(db.user.updateMany).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { profile_description: "This is my new profile description" }
      });
    });

    it("should handle empty descriptions", async () => {
      // Setup the mock to return a successful update
      (db.user.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      // Call the service function with empty description
      await updateProfileDescription(1, "");

      // Assertions
      expect(db.user.updateMany).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { profile_description: "" }
      });
    });

    it("should handle database errors", async () => {
      // Setup the mock to throw an error
      const dbError = new Error("Database error");
      (db.user.updateMany as jest.Mock).mockRejectedValue(dbError);

      // Call the service function and expect it to throw
      await expect(updateProfileDescription(1, "Test description")).rejects.toThrow(dbError);
      
      expect(db.user.updateMany).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { profile_description: "Test description" }
      });
    });

    it("should handle non-existent users", async () => {
      // Setup the mock to return no affected rows
      (db.user.updateMany as jest.Mock).mockResolvedValue({ count: 0 });

      // Call the service function
      await updateProfileDescription(999, "Description for non-existent user");

      // Assertions
      expect(db.user.updateMany).toHaveBeenCalledWith({
        where: { id: 999 },
        data: { profile_description: "Description for non-existent user" }
      });
      // Note: The function doesn't check if any rows were affected
    });
  });

  describe("updateProfileImagePath", () => {
    it("should update user profile image path", async () => {
      // Setup the mock to return a successful update
      (db.user.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      // Call the service function
      const imagePath = "https://example.com/images/profile123.jpg";
      await updateProfileImagePath(1, imagePath);

      // Assertions
      expect(db.user.updateMany).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { user_photo: imagePath }
      });
    });

    it("should handle empty image paths (removing profile image)", async () => {
      // Setup the mock to return a successful update
      (db.user.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      // Call the service function with empty path
      await updateProfileImagePath(1, "");

      // Assertions
      expect(db.user.updateMany).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { user_photo: "" }
      });
    });

    it("should handle database errors", async () => {
      // Setup the mock to throw an error
      const dbError = new Error("Database error");
      (db.user.updateMany as jest.Mock).mockRejectedValue(dbError);

      // Call the service function and expect it to throw
      const imagePath = "https://example.com/images/profile123.jpg";
      await expect(updateProfileImagePath(1, imagePath)).rejects.toThrow(dbError);
      
      expect(db.user.updateMany).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { user_photo: imagePath }
      });
    });

    it("should handle non-existent users", async () => {
      // Setup the mock to return no affected rows
      (db.user.updateMany as jest.Mock).mockResolvedValue({ count: 0 });

      // Call the service function
      const imagePath = "https://example.com/images/profile123.jpg";
      await updateProfileImagePath(999, imagePath);

      // Assertions
      expect(db.user.updateMany).toHaveBeenCalledWith({
        where: { id: 999 },
        data: { user_photo: imagePath }
      });
      // Note: The function doesn't check if any rows were affected
    });
  });
});