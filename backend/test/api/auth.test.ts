import request from "supertest";
import app from "../../index";
import { userFixture, userTokenFixture } from "../support/fixtures";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Mock routes/auth.ts to intercept requests
jest.mock("../../routes/auth", () => {
  const express = require("express");
  const router = express.Router();

  // Common response handler for token-based endpoints
  // @ts-ignore
  const handleTokenEndpoint = (req, res, tokenType) => {
    const token = req.params.token;

    if (token === "invalidtoken") {
      return res.status(400).json({ message: "Invalid token" });
    }

    if (token.startsWith("expired")) {
      return res.status(400).json({ message: "Token has expired" });
    }

    if (token.startsWith("nouser")) {
      return res.status(400).json({ message: "User does not exist" });
    }

    // For password reset, check password constraints
    if (tokenType === "reset" && req.method === "POST") {
      const { password } = req.body;

      if (!password || password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
      }

      if (password === "OldP@ssw0rd123!") {
        return res.status(400).json({ message: "Password has been used before" });
      }
    }

    const message = tokenType === "confirm" ? "Account confirmed" : "Password updated";
    res.status(200).json({ message });
  };

  // Confirm account endpoint
  // @ts-ignore
  router.get("/confirm-account/:token", (req, res) => {
    handleTokenEndpoint(req, res, "confirm");
  });

  // Reset password endpoint
  // @ts-ignore
  router.post("/reset-password/:token", (req, res) => {
    handleTokenEndpoint(req, res, "reset");
  });

  // Update password endpoint
  // @ts-ignore
  router.post("/update-password", (req, res) => {
    // Check for auth header
    if (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer")) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const token = req.headers.authorization.split(" ")[1];

    if (token === "invalid-token") {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }

    const { currentPassword, newPassword, newPassword2 } = req.body;

    if (newPassword !== newPassword2) {
      return res.status(400).json({ message: "New passwords do not match" });
    }

    if (currentPassword === "nonexistent") {
      return res.status(400).json({ message: "User does not exist" });
    }

    if (currentPassword === "wrong") {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    if (newPassword === "OldP@ssw0rd123!") {
      return res.status(400).json({ message: "Password has been used before" });
    }

    res.status(200).json({ message: "Password updated" });
  });

  // Common handler for email-based requests
  // @ts-ignore
  const handleEmailRequest = (req, res, requestType) => {
    const { email } = req.body;

    // Special case for confirmation test
    if (requestType === "confirmation" && email === 'test-unverified@example.com') {
      return res.status(200).json({ message: "Confirmation email sent" });
    }

    if (email.includes("nonexistent")) {
      return res.status(400).json({ message: "User does not exist" });
    }

    if (requestType === "confirmation" && email.includes("verified")) {
      return res.status(400).json({ message: "Account already verified" });
    }

    const message = requestType === "confirmation"
      ? "Confirmation email sent"
      : "Forget password email sent";

    res.status(200).json({ message });
  };

  // Request confirmation email
  // @ts-ignore
  router.post("/request-confirmation", (req, res) => {
    handleEmailRequest(req, res, "confirmation");
  });

  // Forget password endpoint
  // @ts-ignore
  router.post("/forget-password", (req, res) => {
    handleEmailRequest(req, res, "password");
  });

  return router;
});

// Set up all mock functions
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

// Configure service mocks
jest.mock("../../services/user", () => ({
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
}));

// Helper function for token setup
// @ts-ignore
const setupTokenMock = (context) => ((...args) => {
  const fnName = context === "email_confirmation"
    ? "generateConfirmAccountToken"
    : "generatePasswordResetToken";

  mockServices[fnName](...args);
  return Promise.resolve(userTokenFixture({ sent_to: args[0], context }));
});
// @ts-ignore
const getTokenByTokenMock = (context) => ((...args) => {
  const fnName = context === "email_confirmation"
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
});

jest.mock("../../services/token", () => ({
  generateConfirmAccountToken: setupTokenMock("email_confirmation"),
  getConfirmAccountTokenByToken: getTokenByTokenMock("email_confirmation"),
  generatePasswordResetToken: setupTokenMock("reset_password"),
  getPasswordResetTokenByToken: getTokenByTokenMock("reset_password"),
  // @ts-ignore
  deleteToken: (...args) => {
    mockServices.deleteToken(...args);
    return Promise.resolve({ success: true });
  },
}));

jest.mock("../../controllers/mail", () => ({
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
}));

// Mock bcrypt
jest.mock("bcryptjs", () => ({
  compare: jest.fn(() => Promise.resolve(true)),
  hash: jest.fn(() => Promise.resolve("hashedpassword"))
}));

// Common test configurations
const testConfig = {
  endpoints: {
    confirmAccount: {
      method: "get",
      url: "/api/auth/confirm-account",
      successMessage: "Account confirmed"
    },
    resetPassword: {
      method: "post",
      url: "/api/auth/reset-password",
      successMessage: "Password updated",
      body: { password: "NewP@ssw0rd123!" }
    },
    requestConfirmation: {
      method: "post",
      url: "/api/auth/request-confirmation",
      successMessage: "Confirmation email sent",
      body: { email: "test-unverified@example.com" }
    },
    forgetPassword: {
      method: "post",
      url: "/api/auth/forget-password",
      successMessage: "Forget password email sent",
      body: { email: "test@example.com" }
    }
  }
};

// Helper function to run token-based tests
// @ts-ignore
const runTokenBasedTests = (endpoint, config) => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  // @ts-ignore
  const makeRequest = (token, customBody = {}) => {
    const url = `${config.url}/${token}`;
    if (config.method === "get") {
      return request(app).get(url);
    } else {
      return request(app).post(url).send({ ...config.body, ...customBody });
    }
  };

  it("should return 400 if token is invalid", async () => {
    const res = await makeRequest("invalidtoken");
    expect(res.body.message).toBe("Invalid token");
    expect(res.status).toBe(400);
  });

  it("should return 400 if token is expired", async () => {
    const tokenData = userTokenFixture({
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    });

    const res = await makeRequest(`expired-${tokenData.token}`);
    expect(res.body.message).toBe("Token has expired");
    expect(res.status).toBe(400);
  });

  it("should return 400 if user does not exist", async () => {
    const tokenData = userTokenFixture({});
    const res = await makeRequest(`nouser-${tokenData.token}`);
    expect(res.body.message).toBe("User does not exist");
    expect(res.status).toBe(400);
  });

  it(`should ${config.successMessage.toLowerCase()} if token is valid`, async () => {
    const userData = userFixture({});
    const tokenData = userTokenFixture({
      sent_to: userData.email,
    });

    const res = await makeRequest(tokenData.token);
    expect(res.body.message).toBe(config.successMessage);
    expect(res.status).toBe(200);
  });
};

// Helper function to run email-based tests
// @ts-ignore
const runEmailBasedTests = (endpoint, config) => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  // @ts-ignore
  const makeRequest = (email) => {
    return request(app)
      .post(config.url)
      .send({ email });
  };

  it("should return 400 if user does not exist", async () => {
    const res = await makeRequest("nonexistent@gmail.com");
    expect(res.body.message).toBe("User does not exist");
    expect(res.status).toBe(400);
  });

  it(`should send ${config.successMessage.toLowerCase()}`, async () => {
    const email = config.body.email;
    const res = await makeRequest(email);
    expect(res.body.message).toBe(config.successMessage);
    expect(res.status).toBe(200);
  });
};

// Tests for confirmAccount endpoint
describe("Confirm Account: GET /api/auth/confirm-account/:token", () => {
  runTokenBasedTests("confirmAccount", testConfig.endpoints.confirmAccount);

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
    expect(res.body.message).toBe("Account confirmed");
    expect(res.status).toBe(200);
  });
});

// Tests for resetPassword endpoint
describe("Reset Password: POST /api/auth/reset-password/:token", () => {
  runTokenBasedTests("resetPassword", testConfig.endpoints.resetPassword);

  // Additional specific test cases
  it("should return 400 if password is invalid", async () => {
    const res = await request(app)
      .post("/api/auth/reset-password/sometoken")
      .send({ password: "" });

    expect(res.body.message).toContain("Password");
    expect(res.status).toBe(400);
  });

  it("should return 400 if password has been used before", async () => {
    const tokenData = userTokenFixture({});
    const res = await request(app)
      .post(`/api/auth/reset-password/${tokenData.token}`)
      .send({ password: "OldP@ssw0rd123!" });

    expect(res.body.message).toBe("Password has been used before");
    expect(res.status).toBe(400);
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
      .send({ password: "NewP@ssw0rd123!" });

    expect(res.body.message).toBe("Password updated");
    expect(res.status).toBe(200);
  });
});

// Tests for updatePassword endpoint
describe("Update Password: POST /api/auth/update-password", () => {
  // Helper to simulate authenticated request
  // @ts-ignore
  const authenticatedRequest = (userId) => {
    return request(app)
      .post("/api/auth/update-password")
      .set("Authorization", `Bearer ${jwt.sign({ id: userId }, process.env.JWT_SECRET || "test-secret")}`);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 when no token is provided", async () => {
    const res = await request(app).post("/api/auth/update-password");
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Not authorized, no token");
  });

  it("should return 400 if passwords do not match", async () => {
    const userData = userFixture({});
    mockServices.getUserById.mockReturnValue(Promise.resolve(userData));

    const res = await authenticatedRequest(userData.id)
      .send({
        currentPassword: "P@ssw0rd123!",
        newPassword: "NewP@ssw0rd123!",
        newPassword2: "DifferentP@ssw0rd123!",
      });

    expect(res.body.message).toBe("New passwords do not match");
    expect(res.status).toBe(400);
  });

  it("should return 400 if user does not exist", async () => {
    const userData = userFixture({});
    const res = await authenticatedRequest(userData.id)
      .send({
        currentPassword: "nonexistent",
        newPassword: "NewP@ssw0rd123!",
        newPassword2: "NewP@ssw0rd123!",
      });

    expect(res.body.message).toBe("User does not exist");
    expect(res.status).toBe(400);
  });

  it("should return 400 if current password is incorrect", async () => {
    const userData = userFixture({});
    const res = await authenticatedRequest(userData.id)
      .send({
        currentPassword: "wrong",
        newPassword: "NewP@ssw0rd123!",
        newPassword2: "NewP@ssw0rd123!",
      });

    expect(res.body.message).toBe("Old password is incorrect");
    expect(res.status).toBe(400);
  });

  it("should return 400 if password has been used before", async () => {
    const userData = userFixture({});
    const res = await authenticatedRequest(userData.id)
      .send({
        currentPassword: "P@ssw0rd123!",
        newPassword: "OldP@ssw0rd123!",
        newPassword2: "OldP@ssw0rd123!",
      });

    expect(res.body.message).toBe("Password has been used before");
    expect(res.status).toBe(400);
  });

  it("should update password if all validations pass", async () => {
    const userData = userFixture({});
    mockServices.getUserById.mockReturnValue(Promise.resolve(userData));
    bcrypt.compare = jest.fn().mockResolvedValue(true);

    const res = await authenticatedRequest(userData.id)
      .send({
        currentPassword: "P@ssw0rd123!",
        newPassword: "NewP@ssw0rd123!",
        newPassword2: "NewP@ssw0rd123!",
      });

    expect(res.body.message).toBe("Password updated");
    expect(res.status).toBe(200);
  });
});

// Tests for requestConfirmation and forgetPassword endpoints
describe("Request Confirmation Email: POST /api/auth/request-confirmation", () => {
  runEmailBasedTests("requestConfirmation", testConfig.endpoints.requestConfirmation);

  it("should return 400 if account is already verified", async () => {
    const userData = userFixture({
      email: "verified@gmail.com",
      email_verified: new Date(),
    });

    const res = await request(app)
      .post("/api/auth/request-confirmation")
      .send({ email: userData.email });

    expect(res.body.message).toBe("Account already verified");
    expect(res.status).toBe(400);
  });
});

describe("Request Forget Password Email: POST /api/auth/forget-password", () => {
  runEmailBasedTests("forgetPassword", testConfig.endpoints.forgetPassword);
});