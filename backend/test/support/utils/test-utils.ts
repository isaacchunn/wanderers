import request from "supertest";
import app from "../../../index";
import { userFixture, userTokenFixture } from "../fixtures";
import jwt from "jsonwebtoken";

/**
 * Common HTTP status codes used in tests
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
};

/**
 * Common response messages used across tests
 */
export const RESPONSE_MESSAGES = {
  // Auth related messages
  INVALID_TOKEN: "Invalid token",
  TOKEN_EXPIRED: "Token has expired",
  NO_USER: "User does not exist",
  PASSWORD_TOO_SHORT: "Password must be at least 8 characters",
  PASSWORD_REUSED: "Password has been used before",
  PASSWORDS_MISMATCH: "New passwords do not match",
  WRONG_PASSWORD: "Old password is incorrect",
  ACCOUNT_CONFIRMED: "Account confirmed",
  PASSWORD_UPDATED: "Password updated",
  CONFIRMATION_SENT: "Confirmation email sent",
  FORGET_PASSWORD_SENT: "Forget password email sent",
  ACCOUNT_VERIFIED: "Account already verified",
  UNAUTHORIZED_NO_TOKEN: "Not authorized, no token",
  UNAUTHORIZED_FAILED: "Not authorized, token failed",

  // Activity related messages
  ACTIVITY_CREATED: "Activity created successfully",
  ACTIVITY_UPDATED: "Activity updated successfully",
  ACTIVITY_DELETED: "Activity deleted successfully",
  ACTIVITY_NOT_FOUND: "Activity not found",

  // Itinerary related messages
  ITINERARY_CREATED: "Itinerary created successfully",
  ITINERARY_UPDATED: "Itinerary updated successfully",
  ITINERARY_DELETED: "Itinerary deleted successfully",
  ITINERARY_NOT_FOUND: "Itinerary not found",

  // Profile related messages
  PROFILE_UPDATED: "Profile updated successfully",
  PROFILE_NOT_FOUND: "Profile not found",

  // Generic messages
  INVALID_INPUT: "Invalid input data",
  SUCCESS: "Success",
  NOT_FOUND: "Resource not found",
  SERVER_ERROR: "Server error"
};

/**
 * Common test data used across tests
 */
export const TEST_DATA = {
  // Auth related test data
  auth: {
    validPassword: "NewP@ssw0rd123!",
    reusedPassword: "OldP@ssw0rd123!",
    emptyPassword: "",
    validToken: "valid-token",
    invalidToken: "invalidtoken",
    expiredTokenPrefix: "expired-",
    noUserTokenPrefix: "nouser-",
    nonexistentEmail: "nonexistent@gmail.com",
    verifiedEmail: "verified@gmail.com",
    unverifiedEmail: "test-unverified@example.com"
  },

  // Activity related test data
  activity: {
    validTitle: "Test Activity",
    validDescription: "Test Description",
    validExpense: 100
  },

  // Itinerary related test data
  itinerary: {
    validTitle: "Test Itinerary",
    validLocation: "Test Location"
  }
};

/**
 * Helper to create an authenticated request with JWT token
 * @param userId The user ID to include in the token
 * @param method The HTTP method to use
 * @param path The API path
 * @returns An initialized supertest request with authentication header
 */
export const createAuthenticatedRequest = (userId: number, method: string, path: string) => {
  const token = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || "test-secret"
  );

  let req;

  switch (method.toLowerCase()) {
    case 'get':
      req = request(app).get(path);
      break;
    case 'post':
      req = request(app).post(path);
      break;
    case 'put':
      req = request(app).put(path);
      break;
    case 'delete':
      req = request(app).delete(path);
      break;
    default:
      req = request(app).get(path);
  }

  return req.set("Authorization", `Bearer ${token}`);
};

/**
 * Helper for token-based tests like account confirmation, password reset
 * @param endpoint The endpoint configuration
 * @param config The test configuration
 */
export const runTokenBasedTests = (endpoint: string, config: any) => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const makeRequest = (token: string, customBody = {}) => {
    const url = `${config.url}/${token}`;
    if (config.method === "get") {
      return request(app).get(url);
    } else {
      return request(app).post(url).send({ ...config.body, ...customBody });
    }
  };

  it("should return 400 if token is invalid", async () => {
    const res = await makeRequest(TEST_DATA.auth.invalidToken);
    expect(res.body.message).toBe(RESPONSE_MESSAGES.INVALID_TOKEN);
    expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
  });

  it("should return 400 if token is expired", async () => {
    const tokenData = userTokenFixture({
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    });

    const res = await makeRequest(`${TEST_DATA.auth.expiredTokenPrefix}${tokenData.token}`);
    expect(res.body.message).toBe(RESPONSE_MESSAGES.TOKEN_EXPIRED);
    expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
  });

  it("should return 400 if user does not exist", async () => {
    const tokenData = userTokenFixture({});
    const res = await makeRequest(`${TEST_DATA.auth.noUserTokenPrefix}${tokenData.token}`);
    expect(res.body.message).toBe(RESPONSE_MESSAGES.NO_USER);
    expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
  });

  it(`should ${config.successMessage.toLowerCase()} if token is valid`, async () => {
    const userData = userFixture({});
    const tokenData = userTokenFixture({
      sent_to: userData.email,
    });

    const res = await makeRequest(tokenData.token);
    expect(res.body.message).toBe(config.successMessage);
    expect(res.status).toBe(HTTP_STATUS.OK);
  });
};

/**
 * Helper for email-based tests like confirmation request, password reset request
 * @param endpoint The endpoint name 
 * @param config The test configuration
 */
export const runEmailBasedTests = (endpoint: string, config: any) => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const makeRequest = (email: string) => {
    return request(app)
      .post(config.url)
      .send({ email });
  };

  it("should return 400 if user does not exist", async () => {
    const res = await makeRequest(TEST_DATA.auth.nonexistentEmail);
    expect(res.body.message).toBe(RESPONSE_MESSAGES.NO_USER);
    expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
  });

  it(`should send ${config.successMessage.toLowerCase()}`, async () => {
    const email = config.body.email;
    const res = await makeRequest(email);
    expect(res.body.message).toBe(config.successMessage);
    expect(res.status).toBe(HTTP_STATUS.OK);
  });
};

/**
 * Creates a mock service object with all common service methods
 * @returns A mock service object with all methods mocked
 */
export const createMockServices = () => {
  return {
    // User service methods
    updateUser: jest.fn(),
    getUserByEmail: jest.fn(),
    getUserById: jest.fn(),
    createUser: jest.fn(),
    updateUserPassword: jest.fn(),
    updateUserPasswordHistory: jest.fn(),
    checkPasswordReused: jest.fn(),

    // Token service methods
    getConfirmAccountTokenByToken: jest.fn(),
    getPasswordResetTokenByToken: jest.fn(),
    deleteToken: jest.fn(),
    generateConfirmAccountToken: jest.fn(),
    generatePasswordResetToken: jest.fn(),

    // Mail service methods
    deliverConfirmationEmail: jest.fn(),
    deliverForgotPasswordEmail: jest.fn(),
    deliverPasswordResetSuccessfulEmail: jest.fn(),

    // Activity service methods
    createActivity: jest.fn(),
    getActivityById: jest.fn(),
    getActivitiesByItineraryId: jest.fn(),
    updateActivity: jest.fn(),
    updateActivitySequence: jest.fn(),
    deleteActivity: jest.fn(),

    // Itinerary service methods
    createItinerary: jest.fn(),
    getItineraryById: jest.fn(),
    getItinerariesByUserId: jest.fn(),
    updateItinerary: jest.fn(),
    deleteItinerary: jest.fn(),

    // Profile service methods
    getProfileByUserId: jest.fn(),
    updateProfile: jest.fn(),

    // Image service methods
    uploadImage: jest.fn(),
    deleteImage: jest.fn()
  };
};

/**
 * Helper for creating token related mock functions
 * @param contextType The context type (confirm or reset)
 * @returns A mock function for the token
 */
export const getTokenByTokenMock = (contextType: string) => {
  return (...args: any[]) => {
    const context = contextType === "confirm" ? "email_confirmation" : "reset_password";
    const fnName = contextType === "confirm"
      ? "getConfirmAccountTokenByToken"
      : "getPasswordResetTokenByToken";

    const mockServices = createMockServices();
    mockServices[fnName](...args);
    const token = args[0];

    if (token === "invalidtoken") return Promise.resolve(null);

    if (token.startsWith("expired")) {
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() - 3);
      return Promise.resolve(userTokenFixture({
        token,
        created_at: expiredDate,
        context
      }));
    }

    return Promise.resolve(userTokenFixture({ token, context }));
  };
};

/**
 * Helper for creating token generation mock functions
 * @param contextType The context type (confirm or reset)
 * @returns A mock function for token generation
 */
export const setupTokenMock = (contextType: string) => {
  return (...args: any[]) => {
    const context = contextType === "confirm" ? "email_confirmation" : "reset_password";
    const fnName = contextType === "confirm"
      ? "generateConfirmAccountToken"
      : "generatePasswordResetToken";

    const mockServices = createMockServices();
    mockServices[fnName](...args);
    return Promise.resolve(userTokenFixture({ sent_to: args[0], context }));
  };
};

/**
 * Helper for common API test configurations
 */
export const API_TEST_CONFIG = {
  auth: {
    confirmAccount: {
      method: "get",
      url: "/api/auth/confirm-account",
      successMessage: RESPONSE_MESSAGES.ACCOUNT_CONFIRMED
    },
    resetPassword: {
      method: "post",
      url: "/api/auth/reset-password",
      successMessage: RESPONSE_MESSAGES.PASSWORD_UPDATED,
      body: { password: "NewP@ssw0rd123!" }
    },
    requestConfirmation: {
      method: "post",
      url: "/api/auth/request-confirmation",
      successMessage: RESPONSE_MESSAGES.CONFIRMATION_SENT,
      body: { email: "test-unverified@example.com" }
    },
    forgetPassword: {
      method: "post",
      url: "/api/auth/forget-password",
      successMessage: RESPONSE_MESSAGES.FORGET_PASSWORD_SENT,
      body: { email: "test@example.com" }
    }
  }
};
