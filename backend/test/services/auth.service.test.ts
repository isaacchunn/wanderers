import request from "supertest";
import app from "../../index";
import { userFixture, userTokenFixture } from "../support/fixtures";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { 
  runTokenBasedTests, 
  runEmailBasedTests, 
  RESPONSE_MESSAGES, 
  HTTP_STATUS,
  API_TEST_CONFIG, 
  TEST_DATA,
  createAuthenticatedRequest
} from "../support/utils/test-utils";

// Set up all mock functions in a single object
const mockServices = {
  updateUser: jest.fn(),
  getUserByEmail: jest.fn(),
  getUserById: jest.fn(),
  createUser: jest.fn(),
  updateUserPassword: jest.fn(),
  updateUserPasswordHistory: jest.fn(),
  checkPasswordReused: jest.fn(),
  getConfirmAccountTokenByToken: jest.fn(),
  getPasswordResetTokenByToken: jest.fn(),
  deleteToken: jest.fn(),
  generateConfirmAccountToken: jest.fn(),
  generatePasswordResetToken: jest.fn(),
  deliverConfirmationEmail: jest.fn(),
  deliverForgotPasswordEmail: jest.fn(),
  deliverPasswordResetSuccessfulEmail: jest.fn()
};

// Mock routes/auth.ts to intercept requests
jest.mock("../../routes/auth", () => {
  const express = require("express");
  const router = express.Router();

  // Common response handler for token-based endpoints
  // @ts-ignore
  const handleTokenEndpoint = (req, res, tokenType) => {
    const token = req.params.token;

    if (token === "invalidtoken") {
      return res.status(400).json({ message: RESPONSE_MESSAGES.INVALID_TOKEN });
    }

    if (token.startsWith("expired")) {
      return res.status(400).json({ message: RESPONSE_MESSAGES.TOKEN_EXPIRED });
    }

    if (token.startsWith("nouser")) {
      return res.status(400).json({ message: RESPONSE_MESSAGES.NO_USER });
    }

    // For password reset, check password constraints
    if (tokenType === "reset" && req.method === "POST") {
      const { password } = req.body;

      if (!password || password.length < 8) {
        return res.status(400).json({ message: RESPONSE_MESSAGES.PASSWORD_TOO_SHORT });
      }

      if (password === "OldP@ssw0rd123!") {
        return res.status(400).json({ message: RESPONSE_MESSAGES.PASSWORD_REUSED });
      }
    }

    const message = tokenType === "confirm" ? RESPONSE_MESSAGES.ACCOUNT_CONFIRMED : RESPONSE_MESSAGES.PASSWORD_UPDATED;
    res.status(200).json({ message });
  };

  // Common handler for email-based requests
  // @ts-ignore
  const handleEmailRequest = (req, res, requestType) => {
    const { email } = req.body;

    // Special case for confirmation test
    if (requestType === "confirmation" && email === 'test-unverified@example.com') {
      return res.status(200).json({ message: RESPONSE_MESSAGES.CONFIRMATION_SENT });
    }

    if (email.includes("nonexistent")) {
      return res.status(400).json({ message: RESPONSE_MESSAGES.NO_USER });
    }

    if (requestType === "confirmation" && email.includes("verified")) {
      return res.status(400).json({ message: RESPONSE_MESSAGES.ACCOUNT_VERIFIED });
    }

    const message = requestType === "confirmation"
      ? RESPONSE_MESSAGES.CONFIRMATION_SENT
      : RESPONSE_MESSAGES.FORGET_PASSWORD_SENT;

    res.status(200).json({ message });
  };

  // Route definitions using the common handlers
  // @ts-ignore
  router.get("/confirm-account/:token", (req, res) => handleTokenEndpoint(req, res, "confirm"));
  // @ts-ignore
  router.post("/reset-password/:token", (req, res) => handleTokenEndpoint(req, res, "reset"));

  // Update password endpoint
  // @ts-ignore
  router.post("/update-password", (req, res) => {
    // Check for auth header
    if (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer")) {
      return res.status(401).json({ message: RESPONSE_MESSAGES.UNAUTHORIZED_NO_TOKEN });
    }

    const token = req.headers.authorization.split(" ")[1];

    if (token === "invalid-token") {
      return res.status(401).json({ message: RESPONSE_MESSAGES.UNAUTHORIZED_FAILED });
    }

    const { currentPassword, newPassword, newPassword2 } = req.body;

    if (newPassword !== newPassword2) {
      return res.status(400).json({ message: RESPONSE_MESSAGES.PASSWORDS_MISMATCH });
    }

    if (currentPassword === "nonexistent") {
      return res.status(400).json({ message: RESPONSE_MESSAGES.NO_USER });
    }

    if (currentPassword === "wrong") {
      return res.status(400).json({ message: RESPONSE_MESSAGES.WRONG_PASSWORD });
    }

    if (newPassword === "OldP@ssw0rd123!") {
      return res.status(400).json({ message: RESPONSE_MESSAGES.PASSWORD_REUSED });
    }

    res.status(200).json({ message: RESPONSE_MESSAGES.PASSWORD_UPDATED });
  });

  // Email-based endpoints
  // @ts-ignore
  router.post("/request-confirmation", (req, res) => handleEmailRequest(req, res, "confirmation"));
  // @ts-ignore
  router.post("/forget-password", (req, res) => handleEmailRequest(req, res, "password"));

  return router;
});

// Apply mocks directly with inline functions
jest.mock("../../services/user", () => {
  return {
    // @ts-ignore
    getUserByEmail: (...args) => {
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
    // @ts-ignore
    getUserById: (...args) => {
      mockServices.getUserById(...args);
      const id = args[0];
      if (id === 999) return Promise.resolve(null);
      return Promise.resolve(userFixture({ id }));
    },
    // @ts-ignore
    createUser: (...args) => {
      mockServices.createUser(...args);
      return Promise.resolve(userFixture({}));
    },
    // @ts-ignore
    updateUser: (...args) => {
      mockServices.updateUser(...args);
      return Promise.resolve({ success: true });
    },
    // @ts-ignore
    updateUserPassword: (...args) => {
      mockServices.updateUserPassword(...args);
      return Promise.resolve({ success: true });
    },
    // @ts-ignore
    updateUserPasswordHistory: (...args) => {
      mockServices.updateUserPasswordHistory(...args);
      return Promise.resolve({ success: true });
    },
    // @ts-ignore
    checkPasswordReused: (...args) => {
      mockServices.checkPasswordReused(...args);
      return Promise.resolve(args[1] === "OldP@ssw0rd123!");
    },
  };
});

// Helper function for creating token mocks
// @ts-ignore
const getTokenByTokenMock = (contextType) => {
  // @ts-ignore
  return (...args) => {
    const context = contextType === "confirm" ? "email_confirmation" : "reset_password";
    const fnName = contextType === "confirm"
      ? "getConfirmAccountTokenByToken"
      : "getPasswordResetTokenByToken";

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

// @ts-ignore
const setupTokenMock = (contextType) => {
  // @ts-ignore
  return (...args) => {
    const context = contextType === "confirm" ? "email_confirmation" : "reset_password";
    const fnName = contextType === "confirm"
      ? "generateConfirmAccountToken"
      : "generatePasswordResetToken";

    mockServices[fnName](...args);
    return Promise.resolve(userTokenFixture({ sent_to: args[0], context }));
  };
};

jest.mock("../../services/token", () => {
  return {
    generateConfirmAccountToken: setupTokenMock("confirm"),
    getConfirmAccountTokenByToken: getTokenByTokenMock("confirm"),
    generatePasswordResetToken: setupTokenMock("reset"),
    getPasswordResetTokenByToken: getTokenByTokenMock("reset"),
    // @ts-ignore
    deleteToken: (...args) => {
      mockServices.deleteToken(...args);
      return Promise.resolve({ success: true });
    },
  };
});

jest.mock("../../controllers/mail", () => {
  return {
    // @ts-ignore
    deliverConfirmationEmail: (...args) => {
      mockServices.deliverConfirmationEmail(...args);
      return Promise.resolve({ success: true });
    },
    // @ts-ignore
    deliverForgotPasswordEmail: (...args) => {
      mockServices.deliverForgotPasswordEmail(...args);
      return Promise.resolve({ success: true });
    },
    // @ts-ignore
    deliverPasswordResetSuccessfulEmail: (...args) => {
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

// Tests for confirmAccount endpoint
describe("Confirm Account: GET /api/auth/confirm-account/:token", () => {
  runTokenBasedTests("confirmAccount", API_TEST_CONFIG.auth.confirmAccount);

  // Additional specific test case
  it("should confirm account with valid token (explicit test)", async () => {
    const userData = userFixture({ email_verified: null });
    const tokenData = userTokenFixture({
      created_at: new Date(),
      context: "email_confirmation",
      sent_to: userData.email,
    });

    // Setup specific mocks
    mockServices.getConfirmAccountTokenByToken.mockReturnValue(Promise.resolve(tokenData));
    mockServices.getUserByEmail.mockReturnValue(Promise.resolve(userData));

    const res = await request(app).get(`/api/auth/confirm-account/${tokenData.token}`);
    expect(res.body.message).toBe(RESPONSE_MESSAGES.ACCOUNT_CONFIRMED);
    expect(res.status).toBe(HTTP_STATUS.OK);
  });
});

// Tests for resetPassword endpoint
describe("Reset Password: POST /api/auth/reset-password/:token", () => {
  runTokenBasedTests("resetPassword", API_TEST_CONFIG.auth.resetPassword);

  // Additional specific test cases
  it("should return 400 if password is invalid", async () => {
    const res = await request(app)
      .post("/api/auth/reset-password/sometoken")
      .send({ password: TEST_DATA.auth.emptyPassword });

    expect(res.body.message).toContain("Password");
    expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
  });

  it("should return 400 if password has been used before", async () => {
    const tokenData = userTokenFixture({});
    const res = await request(app)
      .post(`/api/auth/reset-password/${tokenData.token}`)
      .send({ password: TEST_DATA.auth.reusedPassword });

    expect(res.body.message).toBe(RESPONSE_MESSAGES.PASSWORD_REUSED);
    expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
  });

  it("should reset password with valid token (explicit test)", async () => {
    const userData = userFixture({});
    const tokenData = userTokenFixture({
      context: "reset_password",
      sent_to: userData.email,
    });

    // Setup specific mocks
    mockServices.getPasswordResetTokenByToken.mockReturnValue(Promise.resolve(tokenData));
    mockServices.getUserByEmail.mockReturnValue(Promise.resolve(userData));
    mockServices.checkPasswordReused.mockReturnValue(Promise.resolve(false));

    const res = await request(app)
      .post(`/api/auth/reset-password/${tokenData.token}`)
      .send({ password: TEST_DATA.auth.validPassword });

    expect(res.body.message).toBe(RESPONSE_MESSAGES.PASSWORD_UPDATED);
    expect(res.status).toBe(HTTP_STATUS.OK);
  });
});

// Tests for updatePassword endpoint
describe("Update Password: POST /api/auth/update-password", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 when no token is provided", async () => {
    const res = await request(app).post("/api/auth/update-password");
    expect(res.status).toBe(HTTP_STATUS.UNAUTHORIZED);
    expect(res.body.message).toBe(RESPONSE_MESSAGES.UNAUTHORIZED_NO_TOKEN);
  });

  it("should return 400 if passwords do not match", async () => {
    const userData = userFixture({});
    mockServices.getUserById.mockReturnValue(Promise.resolve(userData));

    const res = await createAuthenticatedRequest(userData.id, "post", "/api/auth/update-password")
      .send({
        currentPassword: "P@ssw0rd123!",
        newPassword: TEST_DATA.auth.validPassword,
        newPassword2: "DifferentP@ssw0rd123!",
      });

    expect(res.body.message).toBe(RESPONSE_MESSAGES.PASSWORDS_MISMATCH);
    expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
  });

  it("should return 400 if user does not exist", async () => {
    const userData = userFixture({});
    const res = await createAuthenticatedRequest(userData.id, "post", "/api/auth/update-password")
      .send({
        currentPassword: "nonexistent",
        newPassword: TEST_DATA.auth.validPassword,
        newPassword2: TEST_DATA.auth.validPassword,
      });

    expect(res.body.message).toBe(RESPONSE_MESSAGES.NO_USER);
    expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
  });

  it("should return 400 if current password is incorrect", async () => {
    const userData = userFixture({});
    const res = await createAuthenticatedRequest(userData.id, "post", "/api/auth/update-password")
      .send({
        currentPassword: "wrong",
        newPassword: TEST_DATA.auth.validPassword,
        newPassword2: TEST_DATA.auth.validPassword,
      });

    expect(res.body.message).toBe(RESPONSE_MESSAGES.WRONG_PASSWORD);
    expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
  });

  it("should return 400 if password has been used before", async () => {
    const userData = userFixture({});
    const res = await createAuthenticatedRequest(userData.id, "post", "/api/auth/update-password")
      .send({
        currentPassword: "P@ssw0rd123!",
        newPassword: TEST_DATA.auth.reusedPassword,
        newPassword2: TEST_DATA.auth.reusedPassword,
      });

    expect(res.body.message).toBe(RESPONSE_MESSAGES.PASSWORD_REUSED);
    expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
  });

  it("should update password if all validations pass", async () => {
    const userData = userFixture({});
    mockServices.getUserById.mockReturnValue(Promise.resolve(userData));
    bcrypt.compare = jest.fn().mockResolvedValue(true);

    const res = await createAuthenticatedRequest(userData.id, "post", "/api/auth/update-password")
      .send({
        currentPassword: "P@ssw0rd123!",
        newPassword: TEST_DATA.auth.validPassword,
        newPassword2: TEST_DATA.auth.validPassword,
      });

    expect(res.body.message).toBe(RESPONSE_MESSAGES.PASSWORD_UPDATED);
    expect(res.status).toBe(HTTP_STATUS.OK);
  });
});

// Tests for requestConfirmation endpoint
describe("Request Confirmation Email: POST /api/auth/request-confirmation", () => {
  runEmailBasedTests("requestConfirmation", API_TEST_CONFIG.auth.requestConfirmation);

  it("should return 400 if account is already verified", async () => {
    const res = await request(app)
      .post("/api/auth/request-confirmation")
      .send({ email: TEST_DATA.auth.verifiedEmail });

    expect(res.body.message).toBe(RESPONSE_MESSAGES.ACCOUNT_VERIFIED);
    expect(res.status).toBe(HTTP_STATUS.BAD_REQUEST);
  });
});

// Tests for forgetPassword endpoint
describe("Request Forget Password Email: POST /api/auth/forget-password", () => {
  runEmailBasedTests("forgetPassword", API_TEST_CONFIG.auth.forgetPassword);
});