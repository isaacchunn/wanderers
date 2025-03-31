import { Request, Response } from "express";
import { HttpCode } from "../../lib/httpCodes";
import * as profileService from "../../services/profile";
import * as imageService from "../../services/image";
import {
  updateProfileDescriptionApi,
  uploadProfilePictureApi,
  deleteProfilePictureApi
} from "../../controllers/profile";

// Mock environment variables
process.env.S3_IMAGE_GET_ENDPOINT = "https://example.com";

// Mock the profile service
jest.mock("../../services/profile", () => ({
  updateProfileDescription: jest.fn(),
  updateProfileImagePath: jest.fn()
}));

// Mock the image service
jest.mock("../../services/image", () => ({
  uploadS3ProfileImage: jest.fn(),
  deleteS3ProfileImage: jest.fn()
}));

// Mock zod schema validation
jest.mock("../../zod/schemas", () => ({
  updateProfileDescriptionSchema: {
    safeParse: jest.fn()
  }
}));

describe("Profile Controller Tests", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Setup request and response objects
    req = {
      body: {},
      user: { id: 1 },
      // @ts-ignore
      file: {
        fieldname: 'file',
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        buffer: Buffer.from('test'),
        size: 4,
        destination: '',
        filename: '',
        path: ''
      }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Default successful schema validation
    require("../../zod/schemas").updateProfileDescriptionSchema.safeParse = jest.fn().mockReturnValue({
      success: true,
      data: {
        profile_description: "Test description"
      }
    });
  });

  describe("updateProfileDescriptionApi", () => {
    it("should update profile description with valid data", async () => {
      await updateProfileDescriptionApi(req as any, res as Response);

      expect(profileService.updateProfileDescription).toHaveBeenCalledWith(1, "Test description");
      expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
      expect(res.json).toHaveBeenCalledWith({ message: "Profile Updated" });
    });

    it("should handle null description by using empty string", async () => {
      require("../../zod/schemas").updateProfileDescriptionSchema.safeParse = jest.fn().mockReturnValue({
        success: true,
        data: {
          profile_description: null
        }
      });

      await updateProfileDescriptionApi(req as any, res as Response);

      expect(profileService.updateProfileDescription).toHaveBeenCalledWith(1, "");
    });

    it("should return 400 when validation fails", async () => {
      require("../../zod/schemas").updateProfileDescriptionSchema.safeParse = jest.fn().mockReturnValue({
        success: false,
        error: { errors: [{ path: ["profile_description"], message: "Description too long" }] }
      });

      await updateProfileDescriptionApi(req as any, res as Response);

      expect(res.status).toHaveBeenCalledWith(HttpCode.BadRequest);
      expect(res.json).toHaveBeenCalledWith({ message: "profile_description: Description too long" });
    });

    it("should handle service errors", async () => {
      (profileService.updateProfileDescription as jest.Mock).mockRejectedValue(new Error("Service error"));

      await updateProfileDescriptionApi(req as any, res as Response);

      expect(res.status).toHaveBeenCalledWith(HttpCode.InternalServerError);
      expect(res.json).toHaveBeenCalledWith({ message: "Service error" });
    });
  });

  describe("uploadProfilePictureApi", () => {
    it("should upload profile picture successfully", async () => {
      (imageService.uploadS3ProfileImage as jest.Mock).mockResolvedValue("profiles/1/image.jpg");

      await uploadProfilePictureApi(req as any, res as Response);

      expect(imageService.uploadS3ProfileImage).toHaveBeenCalledWith(1, req.file);
      expect(profileService.updateProfileImagePath).toHaveBeenCalledWith(
        1,
        "https://example.com/profiles/1/image.jpg"
      );
      expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
      expect(res.json).toHaveBeenCalledWith({
        full_image_path: "https://example.com/profiles/1/image.jpg"
      });
    });

    it("should return 400 when no file is uploaded", async () => {
      req.file = undefined;

      await uploadProfilePictureApi(req as any, res as Response);

      expect(res.status).toHaveBeenCalledWith(HttpCode.BadRequest);
      expect(res.json).toHaveBeenCalledWith({ message: "No file uploaded" });
    });

    it("should handle S3 upload failure", async () => {
      (imageService.uploadS3ProfileImage as jest.Mock).mockResolvedValue(null);

      await uploadProfilePictureApi(req as any, res as Response);

      expect(res.status).toHaveBeenCalledWith(HttpCode.InternalServerError);
      expect(res.json).toHaveBeenCalledWith({ message: "There was an error when uploading the file" });
    });

    it("should handle service errors", async () => {
      (imageService.uploadS3ProfileImage as jest.Mock).mockRejectedValue(new Error("Service error"));

      await uploadProfilePictureApi(req as any, res as Response);

      expect(res.status).toHaveBeenCalledWith(HttpCode.InternalServerError);
      expect(res.json).toHaveBeenCalledWith({ message: "Service error" });
    });
  });

  describe("deleteProfilePictureApi", () => {
    it("should delete profile picture successfully", async () => {
      await deleteProfilePictureApi(req as any, res as Response);

      expect(imageService.deleteS3ProfileImage).toHaveBeenCalledWith("1");
      expect(profileService.updateProfileImagePath).toHaveBeenCalledWith(1, "");
      expect(res.status).toHaveBeenCalledWith(HttpCode.OK);
      expect(res.json).toHaveBeenCalledWith({ message: "Profile picture deleted" });
    });

    it("should handle service errors", async () => {
      (imageService.deleteS3ProfileImage as jest.Mock).mockRejectedValue(new Error("Service error"));

      await deleteProfilePictureApi(req as any, res as Response);

      expect(res.status).toHaveBeenCalledWith(HttpCode.InternalServerError);
      expect(res.json).toHaveBeenCalledWith({ message: "Service error" });
    });
  });
});