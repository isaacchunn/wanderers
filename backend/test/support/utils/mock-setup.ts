import { userFixture } from "../fixtures";
import { createMockServices, getTokenByTokenMock, setupTokenMock } from "./test-utils";

/**
 * Sets up common mocks for authentication tests
 */
export const setupAuthMocks = () => {
  const mockServices = createMockServices();

  // Mock user service
  jest.mock("../../../services/user", () => {
    return {
      getUserByEmail: (...args: any[]) => {
        mockServices.getUserByEmail(...args);
        const email = args[0];
        if (email.includes("nonexistent")) return Promise.resolve(null);
        if (email.includes("verified")) {
          return Promise.resolve(userFixture({
            email,
            email_verified: new Date()
          }));
        }
        return Promise.resolve(userFixture({ email }));
      },
      getUserById: (...args: any[]) => {
        mockServices.getUserById(...args);
        const id = args[0];
        if (id === 999) return Promise.resolve(null);
        return Promise.resolve(userFixture({ id }));
      },
      createUser: (...args: any[]) => {
        mockServices.createUser(...args);
        return Promise.resolve(userFixture({}));
      },
      updateUser: (...args: any[]) => {
        mockServices.updateUser(...args);
        return Promise.resolve({ success: true });
      },
      updateUserPassword: (...args: any[]) => {
        mockServices.updateUserPassword(...args);
        return Promise.resolve({ success: true });
      },
      updateUserPasswordHistory: (...args: any[]) => {
        mockServices.updateUserPasswordHistory(...args);
        return Promise.resolve({ success: true });
      },
      checkPasswordReused: (...args: any[]) => {
        mockServices.checkPasswordReused(...args);
        return Promise.resolve(args[1] === "OldP@ssw0rd123!");
      },
    };
  });

  // Mock token service
  jest.mock("../../../services/token", () => {
    return {
      generateConfirmAccountToken: setupTokenMock("confirm"),
      getConfirmAccountTokenByToken: getTokenByTokenMock("confirm"),
      generatePasswordResetToken: setupTokenMock("reset"),
      getPasswordResetTokenByToken: getTokenByTokenMock("reset"),
      deleteToken: (...args: any[]) => {
        mockServices.deleteToken(...args);
        return Promise.resolve({ success: true });
      },
    };
  });

  // Mock mail controller
  jest.mock("../../../controllers/mail", () => {
    return {
      deliverConfirmationEmail: (...args: any[]) => {
        mockServices.deliverConfirmationEmail(...args);
        return Promise.resolve({ success: true });
      },
      deliverForgotPasswordEmail: (...args: any[]) => {
        mockServices.deliverForgotPasswordEmail(...args);
        return Promise.resolve({ success: true });
      },
      deliverPasswordResetSuccessfulEmail: (...args: any[]) => {
        mockServices.deliverPasswordResetSuccessfulEmail(...args);
        return Promise.resolve({ success: true });
      },
    };
  });

  // Mock bcrypt
  jest.mock("bcryptjs", () => ({
    compare: jest.fn(() => Promise.resolve(true)),
    hash: jest.fn(() => Promise.resolve("hashedpassword"))
  }));

  // Mock jsonwebtoken
  jest.mock("jsonwebtoken", () => ({
    sign: jest.fn().mockReturnValue("mock-jwt-token"),
    verify: jest.fn().mockImplementation((token, secret, callback) => {
      if (token === "invalid-token") {
        callback(new Error("Invalid token"));
      } else {
        callback(null, { id: 1 });
      }
    })
  }));

  return mockServices;
};

/**
 * Sets up common mocks for activity tests
 */
export const setupActivityMocks = () => {
  const mockServices = createMockServices();

  // Mock Prisma client
  jest.mock("../../../controllers/db", () => ({
    db: {
      activity: {
        create: jest.fn(({ data }) => {
          mockServices.createActivity(data);
          return Promise.resolve({
            id: 1,
            ...data,
            created_at: new Date(),
            updated_at: new Date(),
            active: true
          });
        }),
        findUnique: jest.fn(({ where }) => {
          mockServices.getActivityById(where.id);
          if (where.id === 999) return Promise.resolve(null);
          return Promise.resolve({
            id: where.id,
            title: "Test Activity",
            description: "Test Description",
            itinerary_id: 1,
            created_at: new Date(),
            updated_at: new Date(),
            active: true,
            lat: 40.7128,
            lon: -74.0060,
            expense: 100,
            split: "EQUAL",
            sequence: 1
          });
        }),
        findMany: jest.fn(({ where }) => {
          mockServices.getActivitiesByItineraryId(where.itinerary_id);
          if (where.itinerary_id === 999) return Promise.resolve([]);
          return Promise.resolve([
            {
              id: 1,
              title: "Activity 1",
              description: "Description 1",
              itinerary_id: where.itinerary_id,
              created_at: new Date(),
              updated_at: new Date(),
              active: true,
              lat: 40.7128,
              lon: -74.0060,
              expense: 100,
              split: "EQUAL",
              sequence: 1
            },
            {
              id: 2,
              title: "Activity 2",
              description: "Description 2",
              itinerary_id: where.itinerary_id,
              created_at: new Date(),
              updated_at: new Date(),
              active: true,
              lat: 41.7128,
              lon: -75.0060,
              expense: 200,
              split: "EQUAL",
              sequence: 2
            }
          ]);
        }),
        update: jest.fn(({ where, data }) => {
          if (data.active === false) {
            mockServices.deleteActivity(where.id);
          } else if (data.sequence !== undefined) {
            mockServices.updateActivitySequence(where.id, data.sequence);
          } else {
            mockServices.updateActivity(where.id, data);
          }
          return Promise.resolve({
            id: where.id,
            ...data,
            title: data.title || "Test Activity",
            description: data.description || "Test Description",
            created_at: new Date(),
            updated_at: new Date(),
            active: data.active !== undefined ? data.active : true
          });
        })
      }
    }
  }));

  return mockServices;
};

/**
 * Sets up common mocks for itinerary tests
 */
export const setupItineraryMocks = () => {
  const mockServices = createMockServices();

  // Mock Prisma client for itinerary
  jest.mock("../../../controllers/db", () => ({
    db: {
      itinerary: {
        create: jest.fn(({ data }) => {
          mockServices.createItinerary(data);
          return Promise.resolve({
            id: 1,
            ...data,
            created_at: new Date(),
            updated_at: new Date(),
            active: true
          });
        }),
        findUnique: jest.fn(({ where }) => {
          mockServices.getItineraryById(where.id);
          if (where.id === 999) return Promise.resolve(null);
          return Promise.resolve({
            id: where.id,
            title: "Test Itinerary",
            location: "Test Location",
            owner_id: 1,
            created_at: new Date(),
            updated_at: new Date(),
            active: true,
            visibility: "public",
            start_date: new Date(),
            end_date: new Date(),
            collaborators: [],
            activities: []
          });
        }),
        findMany: jest.fn(({ where }) => {
          mockServices.getItinerariesByUserId(where.owner_id);
          if (where.owner_id === 999) return Promise.resolve([]);
          return Promise.resolve([
            {
              id: 1,
              title: "Itinerary 1",
              location: "Location 1",
              owner_id: where.owner_id,
              created_at: new Date(),
              updated_at: new Date(),
              active: true,
              visibility: "public",
              start_date: new Date(),
              end_date: new Date()
            },
            {
              id: 2,
              title: "Itinerary 2",
              location: "Location 2",
              owner_id: where.owner_id,
              created_at: new Date(),
              updated_at: new Date(),
              active: true,
              visibility: "private",
              start_date: new Date(),
              end_date: new Date()
            }
          ]);
        }),
        update: jest.fn(({ where, data }) => {
          if (data.active === false) {
            mockServices.deleteItinerary(where.id);
          } else {
            mockServices.updateItinerary(where.id, data);
          }
          return Promise.resolve({
            id: where.id,
            ...data,
            title: data.title || "Test Itinerary",
            location: data.location || "Test Location",
            created_at: new Date(),
            updated_at: new Date(),
            active: data.active !== undefined ? data.active : true
          });
        })
      }
    }
  }));

  return mockServices;
};

/**
 * Sets up common mocks for profile tests
 */
export const setupProfileMocks = () => {
  const mockServices = createMockServices();

  // Mock Prisma client for profile
  jest.mock("../../../controllers/db", () => ({
    db: {
      user: {
        findUnique: jest.fn(({ where }) => {
          mockServices.getProfileByUserId(where.id);
          if (where.id === 999) return Promise.resolve(null);
          return Promise.resolve({
            id: where.id,
            username: "testuser",
            email: "test@example.com",
            created_at: new Date(),
            updated_at: new Date(),
            profile_description: "Test profile description",
            user_photo: "test-photo-url.jpg"
          });
        }),
        update: jest.fn(({ where, data }) => {
          mockServices.updateProfile(where.id, data);
          return Promise.resolve({
            id: where.id,
            ...data,
            username: data.username || "testuser",
            email: "test@example.com",
            created_at: new Date(),
            updated_at: new Date()
          });
        })
      }
    }
  }));

  return mockServices;
};

/**
 * Sets up common mocks for image tests
 */
export const setupImageMocks = () => {
  const mockServices = createMockServices();

  // Mock image service
  jest.mock("../../../services/image", () => {
    return {
      uploadImage: (...args: any[]) => {
        mockServices.uploadImage(...args);
        return Promise.resolve({
          url: "https://example.com/uploaded-image.jpg",
          public_id: "test-public-id"
        });
      },
      deleteImage: (...args: any[]) => {
        mockServices.deleteImage(...args);
        return Promise.resolve({ result: "ok" });
      }
    };
  });

  return mockServices;
};
