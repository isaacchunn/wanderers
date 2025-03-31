import {
  isOwnerOrCollaborator,
  createItinerary,
  getItineraries,
  getItineraryById,
  getCreatedItineraries,
  getCollabItineraries,
  updateItinerary,
  deleteItinerary,
  undoDeleteItinerary
} from "../../services/itinerary";
import { db } from "../../controllers/db";
import { getUserByEmail } from "../../services/user";
import { deliverItineraryCollabEmail } from "../../controllers/mail";
import { ItineraryVisibility } from "prisma/prisma-client";

// Mock dependencies
jest.mock("../../controllers/db", () => ({
  db: {
    itinerary: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn()
    },
    user: {
      findFirst: jest.fn()
    }
  }
}));

jest.mock("../../services/user", () => ({
  getUserByEmail: jest.fn()
}));

jest.mock("../../controllers/mail", () => ({
  deliverItineraryCollabEmail: jest.fn()
}));

describe("Itinerary Service Tests", () => {
  // Common test data
  const mockItinerary = {
    id: 1,
    title: "Trip to Paris",
    location: "Paris, France",
    visibility: "public" as ItineraryVisibility,
    start_date: new Date("2023-06-01"),
    end_date: new Date("2023-06-10"),
    owner_id: 1,
    active: true,
    created_at: new Date(),
    updated_at: new Date(),
    photo_url: "https://example.com/paris.jpg",
    collaborators: [{ id: 2, username: "collaborator", email: "collab@example.com" }]
  };

  const mockUser = {
    id: 1,
    username: "testuser",
    email: "test@example.com",
    user_photo: "https://example.com/photo.jpg"
  };

  const mockCollaborator = {
    id: 2,
    username: "collaborator",
    email: "collab@example.com",
    user_photo: "https://example.com/collab.jpg"
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("isOwnerOrCollaborator", () => {
    it("should return true if user is the owner", async () => {
      // Setup mock
      (db.itinerary.findUnique as jest.Mock).mockResolvedValue({
        owner_id: 1,
        collaborators: []
      });

      const result = await isOwnerOrCollaborator(1, 1);

      expect(db.itinerary.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: { owner_id: true, collaborators: true }
      });
      expect(result).toBe(true);
    });

    it("should return true if user is a collaborator", async () => {
      // Setup mock
      (db.itinerary.findUnique as jest.Mock).mockResolvedValue({
        owner_id: 1,
        collaborators: [{ id: 2 }]
      });

      const result = await isOwnerOrCollaborator(2, 1);

      expect(db.itinerary.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: { owner_id: true, collaborators: true }
      });
      expect(result).toBe(true);
    });

    it("should return false if user is neither owner nor collaborator", async () => {
      // Setup mock
      (db.itinerary.findUnique as jest.Mock).mockResolvedValue({
        owner_id: 1,
        collaborators: [{ id: 2 }]
      });

      const result = await isOwnerOrCollaborator(3, 1);

      expect(result).toBe(false);
    });

    it("should return false if itinerary doesn't exist", async () => {
      // Setup mock
      (db.itinerary.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await isOwnerOrCollaborator(1, 999);

      expect(result).toBe(false);
    });
  });

  describe("createItinerary", () => {
    it("should create an itinerary without collaborators", async () => {
      // Setup mocks
      (db.itinerary.create as jest.Mock).mockResolvedValue({
        id: 1,
        title: "Trip to Paris",
        location: "Paris, France",
        visibility: "public",
        start_date: new Date("2023-06-01"),
        end_date: new Date("2023-06-10"),
        owner_id: 1
      });

      (db.user.findFirst as jest.Mock).mockResolvedValue({
        username: "testuser"
      });

      (db.itinerary.findFirst as jest.Mock).mockResolvedValue({
        ...mockItinerary,
        owner: {
          username: "testuser",
          user_photo: "https://example.com/photo.jpg"
        },
        collaborators: [],
        _count: {
          votes: 0
        }
      });

      const result = await createItinerary(
        1,
        "Trip to Paris",
        "Paris, France",
        "public",
        new Date("2023-06-01"),
        new Date("2023-06-10"),
        undefined
      );

      expect(db.itinerary.create).toHaveBeenCalledWith({
        data: {
          title: "Trip to Paris",
          location: "Paris, France",
          visibility: "public",
          start_date: expect.any(Date),
          end_date: expect.any(Date),
          owner_id: 1
        }
      });

      expect(db.itinerary.findFirst).toHaveBeenCalledWith({
        where: {
          id: 1,
          active: true
        },
        include: expect.any(Object)
      });

      expect(result).toEqual(expect.objectContaining({
        id: 1,
        title: "Trip to Paris",
        owner: expect.any(Object),
        collaborators: expect.any(Array)
      }));
    });

    it("should create an itinerary with collaborators", async () => {
      // Setup mocks
      (db.itinerary.create as jest.Mock).mockResolvedValue({
        id: 1,
        title: "Trip to Paris",
        location: "Paris, France",
        visibility: "public",
        start_date: new Date("2023-06-01"),
        end_date: new Date("2023-06-10"),
        owner_id: 1
      });

      (db.user.findFirst as jest.Mock).mockResolvedValue({
        username: "testuser"
      });

      (getUserByEmail as jest.Mock).mockResolvedValue({
        id: 2,
        username: "collaborator",
        email: "collab@example.com"
      });

      (db.itinerary.update as jest.Mock).mockResolvedValue({});

      (db.itinerary.findFirst as jest.Mock).mockResolvedValue({
        ...mockItinerary,
        owner: {
          username: "testuser",
          user_photo: "https://example.com/photo.jpg"
        },
        collaborators: [mockCollaborator],
        _count: {
          votes: 0
        }
      });

      const result = await createItinerary(
        1,
        "Trip to Paris",
        "Paris, France",
        "public",
        new Date("2023-06-01"),
        new Date("2023-06-10"),
        ["collab@example.com"]
      );

      expect(getUserByEmail).toHaveBeenCalledWith("collab@example.com");
      expect(db.itinerary.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          collaborators: {
            connect: { id: 2 }
          }
        }
      });
      expect(deliverItineraryCollabEmail).toHaveBeenCalled();
      // @ts-ignore
      expect(result.collaborators).toHaveLength(1);
    });

    it("should not add the owner as a collaborator", async () => {
      // Setup mocks
      (db.itinerary.create as jest.Mock).mockResolvedValue({
        id: 1,
        title: "Trip to Paris",
        location: "Paris, France",
        owner_id: 1
      });

      (db.user.findFirst as jest.Mock).mockResolvedValue({
        username: "testuser"
      });

      // Mock that the collaborator email belongs to the owner
      (getUserByEmail as jest.Mock).mockResolvedValue({
        id: 1, // Same as owner_id
        username: "testuser",
        email: "owner@example.com"
      });

      (db.itinerary.findFirst as jest.Mock).mockResolvedValue({
        ...mockItinerary,
        collaborators: [],
        _count: { votes: 0 }
      });

      await createItinerary(
        1,
        "Trip to Paris",
        "Paris, France",
        "public",
        new Date("2023-06-01"),
        new Date("2023-06-10"),
        ["owner@example.com"]
      );

      // Should not connect owner as collaborator
      expect(db.itinerary.update).not.toHaveBeenCalled();
      expect(deliverItineraryCollabEmail).not.toHaveBeenCalled();
    });
  });

  describe("getItineraries", () => {
    it("should return public itineraries with pagination", async () => {
      // Setup mock
      const mockItineraries = [
        {
          ...mockItinerary,
          owner: mockUser,
          _count: { votes: 5 }
        },
        {
          ...mockItinerary,
          id: 2,
          title: "Trip to London",
          owner: mockUser,
          _count: { votes: 3 }
        }
      ];

      (db.itinerary.findMany as jest.Mock).mockResolvedValue(mockItineraries);

      const result = await getItineraries(1, 10);

      expect(db.itinerary.findMany).toHaveBeenCalledWith({
        where: {
          active: true,
          visibility: "public"
        },
        include: expect.any(Object),
        orderBy: { created_at: "desc" },
        skip: 0,
        take: 10
      });

      expect(result).toEqual(mockItineraries);
    });

    it("should handle pagination correctly", async () => {
      // Setup mock
      (db.itinerary.findMany as jest.Mock).mockResolvedValue([]);

      await getItineraries(2, 5);

      expect(db.itinerary.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5, // (page-1) * limit
          take: 5
        })
      );
    });
  });

  describe("getItineraryById", () => {
    it("should return a public itinerary to any user", async () => {
      // Setup mock
      const mockPublicItinerary = {
        ...mockItinerary,
        visibility: "public",
        owner: mockUser,
        _count: { votes: 5 }
      };

      (db.itinerary.findFirst as jest.Mock).mockResolvedValue(mockPublicItinerary);

      const result = await getItineraryById(1, 999); // User 999 is neither owner nor collaborator

      expect(db.itinerary.findFirst).toHaveBeenCalledWith({
        where: {
          id: 1,
          active: true
        },
        include: expect.any(Object)
      });

      expect(result).toEqual(mockPublicItinerary);
    });

    it("should return a private itinerary to its owner", async () => {
      // Setup mock
      const mockPrivateItinerary = {
        ...mockItinerary,
        visibility: "private",
        owner: mockUser,
        _count: { votes: 0 }
      };

      (db.itinerary.findFirst as jest.Mock).mockResolvedValue(mockPrivateItinerary);
      // Mock isOwnerOrCollaborator check
      (db.itinerary.findUnique as jest.Mock).mockResolvedValue({
        owner_id: 1,
        collaborators: []
      });

      const result = await getItineraryById(1, 1); // User 1 is the owner

      expect(result).toEqual(mockPrivateItinerary);
    });

    it("should return a private itinerary to a collaborator", async () => {
      // Setup mock
      const mockPrivateItinerary = {
        ...mockItinerary,
        visibility: "private",
        owner: mockUser,
        collaborators: [mockCollaborator],
        _count: { votes: 0 }
      };

      (db.itinerary.findFirst as jest.Mock).mockResolvedValue(mockPrivateItinerary);
      // Mock isOwnerOrCollaborator check
      (db.itinerary.findUnique as jest.Mock).mockResolvedValue({
        owner_id: 1,
        collaborators: [{ id: 2 }]
      });

      const result = await getItineraryById(1, 2); // User 2 is a collaborator

      expect(result).toEqual(mockPrivateItinerary);
    });

    it("should return null if a private itinerary is requested by an unauthorized user", async () => {
      // Setup mock
      const mockPrivateItinerary = {
        ...mockItinerary,
        visibility: "private",
        owner: mockUser,
        _count: { votes: 0 }
      };

      (db.itinerary.findFirst as jest.Mock).mockResolvedValue(mockPrivateItinerary);
      // Mock isOwnerOrCollaborator check - returns false
      (db.itinerary.findUnique as jest.Mock).mockResolvedValue({
        owner_id: 1,
        collaborators: [{ id: 2 }]
      });

      const result = await getItineraryById(1, 3); // User 3 is neither owner nor collaborator

      expect(result).toBeNull();
    });

    it("should return null if itinerary doesn't exist", async () => {
      // Setup mock
      (db.itinerary.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await getItineraryById(999, 1);

      expect(result).toBeNull();
    });
  });

  describe("getCreatedItineraries", () => {
    it("should return all created itineraries for the owner", async () => {
      // Setup mock
      const mockUserItineraries = {
        itineraries: [
          {
            ...mockItinerary,
            visibility: "public",
            owner: mockUser,
            _count: { votes: 5 }
          },
          {
            ...mockItinerary,
            id: 2,
            visibility: "private",
            owner: mockUser,
            _count: { votes: 0 }
          }
        ]
      };

      (db.user.findFirst as jest.Mock).mockResolvedValue(mockUserItineraries);

      const result = await getCreatedItineraries(1, true, 1, 10);

      expect(db.user.findFirst).toHaveBeenCalledWith({
        where: { id: 1 },
        include: expect.objectContaining({
          itineraries: expect.objectContaining({
            where: { active: true } // Should include both public and private
          })
        })
      });

      expect(result).toEqual(mockUserItineraries.itineraries);
    });

    it("should return only public itineraries for non-owners", async () => {
      // Setup mock
      const mockUserItineraries = {
        itineraries: [
          {
            ...mockItinerary,
            visibility: "public",
            owner: mockUser,
            _count: { votes: 5 }
          }
        ]
      };

      (db.user.findFirst as jest.Mock).mockResolvedValue(mockUserItineraries);

      await getCreatedItineraries(1, false, 1, 10);

      expect(db.user.findFirst).toHaveBeenCalledWith({
        where: { id: 1 },
        include: expect.objectContaining({
          itineraries: expect.objectContaining({
            where: {
              active: true,
              visibility: "public" // Should only include public
            }
          })
        })
      });
    });

    it("should handle pagination correctly", async () => {
      // Setup mock
      (db.user.findFirst as jest.Mock).mockResolvedValue({ itineraries: [] });

      await getCreatedItineraries(1, true, 2, 5);

      expect(db.user.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            itineraries: expect.objectContaining({
              skip: 5, // (page-1) * limit
              take: 5
            })
          })
        })
      );
    });

    it("should return undefined if user doesn't exist", async () => {
      // Setup mock
      (db.user.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await getCreatedItineraries(999, true);

      expect(result).toBeUndefined();
    });
  });

  describe("getCollabItineraries", () => {
    it("should return itineraries the user collaborates on", async () => {
      // Setup mock
      const mockCollabItineraries = {
        collaborated_itineraries: [
          {
            ...mockItinerary,
            owner_id: 3,
            owner: { username: "owner", user_photo: null },
            _count: { votes: 2 }
          }
        ]
      };

      (db.user.findFirst as jest.Mock).mockResolvedValue(mockCollabItineraries);

      const result = await getCollabItineraries(2, 1, 10);

      expect(db.user.findFirst).toHaveBeenCalledWith({
        where: { id: 2 },
        include: expect.objectContaining({
          collaborated_itineraries: expect.objectContaining({
            where: { active: true }
          })
        })
      });

      expect(result).toEqual(mockCollabItineraries.collaborated_itineraries);
    });

    it("should handle pagination correctly", async () => {
      // Setup mock
      (db.user.findFirst as jest.Mock).mockResolvedValue({ collaborated_itineraries: [] });

      await getCollabItineraries(2, 2, 5);

      expect(db.user.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            collaborated_itineraries: expect.objectContaining({
              skip: 5, // (page-1) * limit
              take: 5
            })
          })
        })
      );
    });

    it("should return undefined if user doesn't exist", async () => {
      // Setup mock
      (db.user.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await getCollabItineraries(999);

      expect(result).toBeUndefined();
    });
  });

  describe("updateItinerary", () => {
    it("should update an itinerary with valid data", async () => {
      // Setup mock
      const updateData = {
        userId: 1,
        itineraryId: 1,
        title: "Updated Paris Trip",
        location: "Paris, France",
        visibility: "public" as "public" | "private",
        start_date: new Date("2023-07-01"),
        end_date: new Date("2023-07-10"),
        photo_url: "https://example.com/paris_updated.jpg"
      };

      const mockUpdatedItinerary = {
        ...mockItinerary,
        ...updateData,
        owner: mockUser,
        _count: { votes: 5 }
      };

      (db.itinerary.update as jest.Mock).mockResolvedValue(mockUpdatedItinerary);

      const result = await updateItinerary(updateData);

      expect(db.itinerary.update).toHaveBeenCalledWith({
        where: {
          id: 1,
          owner_id: 1,
          active: true
        },
        data: {
          title: updateData.title,
          location: updateData.location,
          photo_url: updateData.photo_url,
          visibility: updateData.visibility,
          start_date: updateData.start_date,
          end_date: updateData.end_date
        },
        include: expect.any(Object)
      });

      expect(result).toEqual(mockUpdatedItinerary);
    });

    it("should throw an error if itinerary doesn't exist or user is not the owner", async () => {
      // Setup mock
      const updateData = {
        userId: 2, // Not the owner
        itineraryId: 1,
        title: "Updated Paris Trip",
        location: "Paris, France",
        visibility: "public" as "public" | "private",
        start_date: new Date("2023-07-01"),
        end_date: new Date("2023-07-10"),
        photo_url: "https://example.com/paris_updated.jpg"
      };

      // Mock the update to throw a Prisma error
      (db.itinerary.update as jest.Mock).mockRejectedValue(new Error("Itinerary not found"));

      await expect(updateItinerary(updateData)).rejects.toThrow();
    });
  });

  describe("deleteItinerary", () => {
    it("should soft delete an itinerary", async () => {
      // Setup mock
      (db.itinerary.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      const result = await deleteItinerary(1, 1);

      expect(db.itinerary.updateMany).toHaveBeenCalledWith({
        where: {
          id: 1,
          owner_id: 1,
          active: true
        },
        data: {
          active: false
        }
      });

      expect(result).toBe(1);
    });

    it("should return 0 if itinerary doesn't exist or user is not the owner", async () => {
      // Setup mock
      (db.itinerary.updateMany as jest.Mock).mockResolvedValue({ count: 0 });

      const result = await deleteItinerary(2, 1); // User 2 is not the owner

      expect(result).toBe(0);
    });
  });

  describe("undoDeleteItinerary", () => {
    it("should restore a soft-deleted itinerary", async () => {
      // Setup mock
      (db.itinerary.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      const result = await undoDeleteItinerary(1, 1);

      expect(db.itinerary.updateMany).toHaveBeenCalledWith({
        where: {
          id: 1,
          owner_id: 1,
          active: false
        },
        data: {
          active: true
        }
      });

      expect(result).toBe(1);
    });

    it("should return 0 if itinerary doesn't exist or user is not the owner", async () => {
      // Setup mock
      (db.itinerary.updateMany as jest.Mock).mockResolvedValue({ count: 0 });

      const result = await undoDeleteItinerary(2, 1); // User 2 is not the owner

      expect(result).toBe(0);
    });
  });
});
