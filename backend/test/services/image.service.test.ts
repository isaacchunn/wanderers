import { uploadS3ProfileImage, deleteS3ProfileImage } from "../../services/image";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand
} from "@aws-sdk/client-s3";

// Mock AWS SDK
jest.mock("@aws-sdk/client-s3", () => {
  const mockSend = jest.fn();
  return {
    S3Client: jest.fn().mockImplementation(() => ({
      send: mockSend
    })),
    PutObjectCommand: jest.fn(),
    DeleteObjectCommand: jest.fn()
  };
});

describe("Image Service Tests", () => {
  const originalEnv = process.env;
  const mockFile = {
    fieldname: "file",
    originalname: "test-image.jpg",
    encoding: "7bit",
    mimetype: "image/jpeg",
    buffer: Buffer.from("mock file content"),
    size: 12345,
    destination: "",
    filename: "",
    path: ""
  } as Express.Multer.File;

  beforeEach(() => {
    // Set up environment variables for testing
    process.env = {
      ...originalEnv,
      S3_BUCKET_NAME: "test-bucket",
      S3_IMAGE_UPLOAD_ENDPOINT: "https://test-s3-endpoint.com",
      S3_ACCESS_KEY: "test-access-key",
      S3_SECRET_ACCESS_KEY: "test-secret-key"
    };

    // Reset mocks
    jest.clearAllMocks();
    const mockS3Client = new S3Client({});
    (mockS3Client.send as jest.Mock).mockResolvedValue({});
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe("uploadS3ProfileImage", () => {
    it("should upload an image to S3 and return the file path", async () => {
      // Set up mock response
      const mockS3Client = new S3Client({});
      (mockS3Client.send as jest.Mock).mockResolvedValue({});

      // Call the function
      const result = await uploadS3ProfileImage(123, mockFile);

      // Assertions
      expect(PutObjectCommand).toHaveBeenCalledWith({
        Bucket: "test-bucket",
        Key: "user/123",
        Body: mockFile.buffer,
        ContentType: "image/jpeg"
      });
      expect(result).toBe("user/123");
    });

    it("should handle different image types correctly", async () => {
      const pngFile = {
        ...mockFile,
        mimetype: "image/png"
      };
      
      // Call the function
      await uploadS3ProfileImage(123, pngFile);

      // Assertions
      expect(PutObjectCommand).toHaveBeenCalledWith({
        Bucket: "test-bucket",
        Key: "user/123",
        Body: pngFile.buffer,
        ContentType: "image/png"
      });
    });

    it("should return null if the upload fails", async () => {
      // Set up mock error response
      const mockS3Client = new S3Client({});
      (mockS3Client.send as jest.Mock).mockRejectedValue(new Error("S3 upload error"));

      // Call the function
      const result = await uploadS3ProfileImage(123, mockFile);

      // Assertions
      expect(PutObjectCommand).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it("should handle missing environment variables", async () => {
      // Remove environment variables
      delete process.env.S3_BUCKET_NAME;
      
      // Call the function
      const result = await uploadS3ProfileImage(123, mockFile);

      // Assertions
      expect(PutObjectCommand).toHaveBeenCalledWith({
        Bucket: "",
        Key: "user/123",
        Body: mockFile.buffer,
        ContentType: "image/jpeg"
      });
      // The function should still work, just with empty values
      expect(result).toBe("user/123");
    });
  });

  describe("deleteS3ProfileImage", () => {
    it("should delete an image from S3", async () => {
      // Set up mock response
      const mockS3Client = new S3Client({});
      (mockS3Client.send as jest.Mock).mockResolvedValue({});

      // Call the function
      await deleteS3ProfileImage("123");

      // Assertions
      expect(DeleteObjectCommand).toHaveBeenCalledWith({
        Bucket: "test-bucket",
        Key: "user/123"
      });
    });

    it("should throw an error if the deletion fails", async () => {
      // Set up mock error response
      const mockS3Client = new S3Client({});
      (mockS3Client.send as jest.Mock).mockRejectedValue(new Error("S3 deletion error"));

      // Call the function and expect it to throw
      await expect(deleteS3ProfileImage("123")).rejects.toThrow("S3 deletion error");

      // Assertions
      expect(DeleteObjectCommand).toHaveBeenCalledWith({
        Bucket: "test-bucket",
        Key: "user/123"
      });
    });

    it("should handle missing environment variables", async () => {
      // Remove environment variables
      delete process.env.S3_BUCKET_NAME;
      
      // Set up mock response
      const mockS3Client = new S3Client({});
      (mockS3Client.send as jest.Mock).mockResolvedValue({});
      
      // Call the function
      await deleteS3ProfileImage("123");

      // Assertions
      expect(DeleteObjectCommand).toHaveBeenCalledWith({
        Bucket: "",
        Key: "user/123"
      });
      // Function still works with empty bucket name
    });
  });
});