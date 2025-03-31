import { Request, Response } from "express";
import { HttpStatusCode } from "axios";
import * as itineraryService from "../../services/itinerary";
import {
  createItineraryApi,
  getCreatedItinerariesProtectedApi,
  getCreatedItinerariesPublicApi,
  getCollabItinerariesApi,
  getItineraryProtectedApi,
  getItineraryPublicApi,
  getItinerariesPublicApi,
  updateItineraryApi,
  deleteItineraryApi,
  undoDeleteItineraryApi
} from "../../controllers/itinerary";

// Mock the itinerary service
jest.mock("../../services/itinerary", () => ({
  createItinerary: jest.fn(),
  getItineraries: jest.fn(),
  getCreatedItineraries: jest.fn(),
  getCollabItineraries: jest.fn(),
  getItineraryById: jest.fn(),
  updateItinerary: jest.fn(),
  deleteItinerary: jest.fn(),
  undoDeleteItinerary: jest.fn()
}));

// Mock zod schema validation
jest.mock("../../zod/schemas", () => ({
  createItinerarySchema: {
    safeParse: jest.fn()
  },
  updateItinerarySchema: {
    safeParseAsync: jest.fn()
  }
}));

describe("Itinerary Controller Tests", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Setup request and response objects
    req = {
      body: {},
      params: {},
      query: {},
      // @ts-ignore
      user: { id: 1 }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Default successful schema validation
    require("../../zod/schemas").createItinerarySchema.safeParse = jest.fn().mockReturnValue({
      success: true,
      data: {
        title: "Test Itinerary",
        location: "Test Location",
        visibility: "public",
        start_date: new Date(),
        end_date: new Date(),
        collaborators: []
      }
    });

    require("../../zod/schemas").updateItinerarySchema.safeParseAsync = jest.fn().mockResolvedValue({
      success: true,
      data: {
        title: "Updated Itinerary",
        location: "Updated Location",
        visibility: "public",
        photo_url: "https://example.com/photo.jpg",
        start_date: new Date(),
        end_date: new Date()
      }
    });
  });

  // Public API Tests
  describe("Public API", () => {
    describe("getItinerariesPublicApi", () => {
      it("should fetch itineraries with default pagination", async () => {
        const mockItineraries = { data: [{ id: 1 }], total: 1 };
        (itineraryService.getItineraries as jest.Mock).mockResolvedValue(mockItineraries);

        await getItinerariesPublicApi(req as Request, res as Response);

        expect(itineraryService.getItineraries).toHaveBeenCalledWith(1, 10);
        expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
        expect(res.json).toHaveBeenCalledWith(mockItineraries);
      });

      it("should use provided pagination parameters", async () => {
        req.query = { page: "2", limit: "20" };
        const mockItineraries = { data: [{ id: 1 }], total: 1 };
        (itineraryService.getItineraries as jest.Mock).mockResolvedValue(mockItineraries);

        await getItinerariesPublicApi(req as Request, res as Response);

        expect(itineraryService.getItineraries).toHaveBeenCalledWith(2, 20);
      });

      it("should handle errors", async () => {
        (itineraryService.getItineraries as jest.Mock).mockRejectedValue(new Error("Service error"));

        await getItinerariesPublicApi(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(HttpStatusCode.InternalServerError);
        expect(res.json).toHaveBeenCalledWith({ message: "Service error" });
      });
    });

    describe("getCreatedItinerariesPublicApi", () => {
      it("should fetch created itineraries for a user", async () => {
        req.params = { ownerId: "2" };
        const mockItineraries = { data: [{ id: 1 }], total: 1 };
        (itineraryService.getCreatedItineraries as jest.Mock).mockResolvedValue(mockItineraries);

        await getCreatedItinerariesPublicApi(req as Request, res as Response);

        expect(itineraryService.getCreatedItineraries).toHaveBeenCalledWith(2, false, 1, 10);
        expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
        expect(res.json).toHaveBeenCalledWith(mockItineraries);
      });
    });

    describe("getItineraryPublicApi", () => {
      it("should fetch a specific itinerary", async () => {
        req.params = { itineraryId: "1" };
        const mockItinerary = { id: 1, title: "Test Itinerary" };
        (itineraryService.getItineraryById as jest.Mock).mockResolvedValue(mockItinerary);

        await getItineraryPublicApi(req as Request, res as Response);

        expect(itineraryService.getItineraryById).toHaveBeenCalledWith(1, -1);
        expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
        expect(res.json).toHaveBeenCalledWith(mockItinerary);
      });

      it("should return 404 if itinerary not found", async () => {
        req.params = { itineraryId: "999" };
        (itineraryService.getItineraryById as jest.Mock).mockResolvedValue(null);

        await getItineraryPublicApi(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(HttpStatusCode.NotFound);
        expect(res.json).toHaveBeenCalledWith({ message: "Itinerary not found" });
      });
    });
  });

  // Protected API Tests
  describe("Protected API", () => {
    describe("createItineraryApi", () => {
      it("should create a new itinerary with valid data", async () => {
        const mockItinerary = { id: 1, title: "Test Itinerary" };
        (itineraryService.createItinerary as jest.Mock).mockResolvedValue(mockItinerary);

        await createItineraryApi(req as any, res as Response);

        expect(itineraryService.createItinerary).toHaveBeenCalledWith(
          1, // userId
          "Test Itinerary",
          "Test Location",
          "public",
          expect.any(Date),
          expect.any(Date),
          []
        );
        expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Created);
        expect(res.json).toHaveBeenCalledWith(mockItinerary);
      });

      it("should return 400 when validation fails", async () => {
        require("../../zod/schemas").createItinerarySchema.safeParse = jest.fn().mockReturnValue({
          success: false,
          error: { errors: [{ path: ["title"], message: "Title is required" }] }
        });

        await createItineraryApi(req as any, res as Response);

        expect(res.status).toHaveBeenCalledWith(HttpStatusCode.BadRequest);
        expect(res.json).toHaveBeenCalledWith({ message: "title: Title is required" });
      });
    });

    describe("getCreatedItinerariesProtectedApi", () => {
      it("should fetch created itineraries for the requesting user", async () => {
        req.params = { ownerId: "1" }; // Same as authenticated user
        const mockItineraries = { data: [{ id: 1 }], total: 1 };
        (itineraryService.getCreatedItineraries as jest.Mock).mockResolvedValue(mockItineraries);

        await getCreatedItinerariesProtectedApi(req as any, res as Response);

        expect(itineraryService.getCreatedItineraries).toHaveBeenCalledWith(1, true, 1, 10);
        expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
        expect(res.json).toHaveBeenCalledWith(mockItineraries);
      });

      it("should fetch created itineraries for a different user", async () => {
        req.params = { ownerId: "2" }; // Different from authenticated user
        const mockItineraries = { data: [{ id: 1 }], total: 1 };
        (itineraryService.getCreatedItineraries as jest.Mock).mockResolvedValue(mockItineraries);

        await getCreatedItinerariesProtectedApi(req as any, res as Response);

        expect(itineraryService.getCreatedItineraries).toHaveBeenCalledWith(2, false, 1, 10);
      });
    });

    describe("getCollabItinerariesApi", () => {
      it("should fetch collaborated itineraries for the user", async () => {
        const mockItineraries = { data: [{ id: 1 }], total: 1 };
        (itineraryService.getCollabItineraries as jest.Mock).mockResolvedValue(mockItineraries);

        await getCollabItinerariesApi(req as any, res as Response);

        expect(itineraryService.getCollabItineraries).toHaveBeenCalledWith(1, 1, 10);
        expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
        expect(res.json).toHaveBeenCalledWith(mockItineraries);
      });
    });

    describe("getItineraryProtectedApi", () => {
      it("should fetch a specific itinerary with user permissions", async () => {
        req.params = { itineraryId: "1" };
        const mockItinerary = { id: 1, title: "Test Itinerary" };
        (itineraryService.getItineraryById as jest.Mock).mockResolvedValue(mockItinerary);

        await getItineraryProtectedApi(req as any, res as Response);

        expect(itineraryService.getItineraryById).toHaveBeenCalledWith(1, 1);
        expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
        expect(res.json).toHaveBeenCalledWith(mockItinerary);
      });

      it("should return 404 if itinerary not found", async () => {
        req.params = { itineraryId: "999" };
        (itineraryService.getItineraryById as jest.Mock).mockResolvedValue(null);

        await getItineraryProtectedApi(req as any, res as Response);

        expect(res.status).toHaveBeenCalledWith(HttpStatusCode.NotFound);
        expect(res.json).toHaveBeenCalledWith({ message: "Itinerary not found" });
      });
    });

    describe("updateItineraryApi", () => {
      it("should update an itinerary with valid data", async () => {
        req.params = { itineraryId: "1" };
        const mockItinerary = { id: 1, title: "Updated Itinerary" };
        (itineraryService.updateItinerary as jest.Mock).mockResolvedValue(mockItinerary);

        await updateItineraryApi(req as any, res as Response);

        expect(itineraryService.updateItinerary).toHaveBeenCalledWith({
          userId: 1,
          itineraryId: 1,
          title: "Updated Itinerary",
          location: "Updated Location",
          visibility: "public",
          photo_url: "https://example.com/photo.jpg",
          start_date: expect.any(Date),
          end_date: expect.any(Date)
        });
        expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
        expect(res.json).toHaveBeenCalledWith(mockItinerary);
      });

      it("should return 400 when validation fails", async () => {
        req.params = { itineraryId: "1" };
        require("../../zod/schemas").updateItinerarySchema.safeParseAsync = jest.fn().mockResolvedValue({
          success: false,
          error: { errors: [{ path: ["title"], message: "Title is required" }] }
        });

        await updateItineraryApi(req as any, res as Response);

        expect(res.status).toHaveBeenCalledWith(HttpStatusCode.BadRequest);
        expect(res.json).toHaveBeenCalledWith({ message: "title: Title is required" });
      });
    });

    describe("deleteItineraryApi", () => {
      it("should delete an itinerary", async () => {
        req.params = { itineraryId: "1" };
        (itineraryService.deleteItinerary as jest.Mock).mockResolvedValue(1); // 1 row affected

        await deleteItineraryApi(req as any, res as Response);

        expect(itineraryService.deleteItinerary).toHaveBeenCalledWith(1, 1);
        expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
        expect(res.json).toHaveBeenCalledWith({ deletedItineraryId: 1 });
      });

      it("should return 404 if itinerary not found", async () => {
        req.params = { itineraryId: "999" };
        (itineraryService.deleteItinerary as jest.Mock).mockResolvedValue(0); // 0 rows affected

        await deleteItineraryApi(req as any, res as Response);

        expect(res.status).toHaveBeenCalledWith(HttpStatusCode.NotFound);
        expect(res.json).toHaveBeenCalledWith({ message: "Itinerary not found" });
      });
    });

    describe("undoDeleteItineraryApi", () => {
      it("should restore a deleted itinerary", async () => {
        req.params = { itineraryId: "1" };
        const mockItinerary = { id: 1, title: "Restored Itinerary" };
        (itineraryService.undoDeleteItinerary as jest.Mock).mockResolvedValue(1); // 1 row affected
        (itineraryService.getItineraryById as jest.Mock).mockResolvedValue(mockItinerary);

        await undoDeleteItineraryApi(req as any, res as Response);

        expect(itineraryService.undoDeleteItinerary).toHaveBeenCalledWith(1, 1);
        expect(itineraryService.getItineraryById).toHaveBeenCalledWith(1, 1);
        expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
        expect(res.json).toHaveBeenCalledWith(mockItinerary);
      });

      it("should return 404 if itinerary not found", async () => {
        req.params = { itineraryId: "999" };
        (itineraryService.undoDeleteItinerary as jest.Mock).mockResolvedValue(0); // 0 rows affected

        await undoDeleteItineraryApi(req as any, res as Response);

        expect(res.status).toHaveBeenCalledWith(HttpStatusCode.NotFound);
        expect(res.json).toHaveBeenCalledWith({ message: "Itinerary not found" });
      });
    });
  });

  // Common error handling tests
  describe("Error Handling", () => {
    it("should handle service errors in protected routes", async () => {
      (itineraryService.createItinerary as jest.Mock).mockRejectedValue(new Error("Service error"));

      await createItineraryApi(req as any, res as Response);

      expect(res.status).toHaveBeenCalledWith(HttpStatusCode.InternalServerError);
      expect(res.json).toHaveBeenCalledWith({ message: "Service error" });
    });
  });
});
