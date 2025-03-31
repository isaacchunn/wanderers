import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {
  registerUser,
  loginUser,
  confirmAccount,
  resetPassword,
  updatePassword,
  requestConfirmationEmail,
  requestForgetPasswordEmail
} from "../../controllers/auth";
import * as userService from "../../services/user";
import * as tokenService from "../../services/token";
import * as mailController from "../../controllers/mail";
import {
  HTTP_STATUS,
  RESPONSE_MESSAGES,
  TEST_DATA,
  createMockServices
} from "../support/utils/test-utils";
import { Request, Response } from 'express';

const req = {} as Request;
const res = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn()
} as unknown as Response;
import { db } from "../../controllers/db";

// Create a centralized mock services object
const mockServices = createMockServices();

// Mock schema validations
jest.mock("../../zod/schemas", () => ({
  registerUserSchema: {
    safeParse: jest.fn()
  },
  loginUserschema: {
    safeParse: jest.fn()
  },
  updatePasswordSchema: {
    safeParse: jest.fn()
  },
  resetPasswordSchema: {
    safeParse: jest.fn()
  }
}));

// Mock services
jest.mock("../../services/user", () => ({
  createUser: jest.fn(),
  getUserById: jest.fn(),
  getUserByEmail: jest.fn(),
  updateUser: jest.fn(),
  updateUserPassword: jest.fn(),
  updateUserPasswordHistory: jest.fn(),
  checkPasswordReused: jest.fn()
}));

jest.mock("../../services/token", () => ({
  generateConfirmAccountToken: jest.fn(),
  getConfirmAccountTokenByToken: jest.fn(),
  generatePasswordResetToken: jest.fn(),
  getPasswordResetTokenByToken: jest.fn(),
  deleteToken: jest.fn()
}));

// Mock mail controller
jest.mock("../../controllers/mail", () => ({
  deliverConfirmationEmail: jest.fn(),
  deliverForgotPasswordEmail: jest.fn(),
  deliverPasswordResetSuccessfulEmail: jest.fn()
}));

// Mock bcrypt
jest.mock("bcryptjs", () => ({
  hash: jest.fn().mockResolvedValue("hashedpassword"),
  compare: jest.fn().mockResolvedValue(true)
}));

// Mock jsonwebtoken
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn().mockReturnValue("mock-jwt-token")
}));

// Mock db
jest.mock("../../controllers/db", () => ({
  db: {
    user: {
      update: jest.fn().mockResolvedValue({})
    }
  }
}));

describe("Auth Controller Tests", () => {

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Default JWT_SECRET environment variable
    process.env.JWT_SECRET = "test-secret";

    // Set up schema validation mocks to pass by default
    require("../../zod/schemas").registerUserSchema.safeParse = jest.fn().mockReturnValue({
      success: true,
      data: { username: "testuser", email: "test@example.com", password: "Password123!" }
    });

    require("../../zod/schemas").loginUserschema.safeParse = jest.fn().mockReturnValue({
      success: true,
      data: { email: "test@example.com", password: "Password123!" }
    });

    require("../../zod/schemas").updatePasswordSchema.safeParse = jest.fn().mockReturnValue({
      success: true,
      data: { currentPassword: "OldPassword123!", newPassword: "NewPassword123!", newPassword2: "NewPassword123!" }
    });

    require("../../zod/schemas").resetPasswordSchema.safeParse = jest.fn().mockReturnValue({
      success: true,
      data: { password: "NewPassword123!" }
    });
  });

  describe("registerUser", () => {
    it("should register a new user when valid data is provided", async () => {
      // Mock services to simulate new user registration
      (userService.getUserByEmail as jest.Mock).mockResolvedValue(null);
      (userService.createUser as jest.Mock).mockResolvedValue({ id: 1, username: "testuser", email: "test@example.com" });
      (tokenService.generateConfirmAccountToken as jest.Mock).mockResolvedValue({ id: 1, token: "confirm-token", sent_to: "test@example.com" });

      await registerUser(req, res);

      expect(userService.createUser).toHaveBeenCalledWith("testuser", "test@example.com", "hashedpassword");
      expect(userService.updateUserPasswordHistory).toHaveBeenCalledWith(1, "hashedpassword");
      expect(mailController.deliverConfirmationEmail).toHaveBeenCalledWith("test@example.com", "testuser", "confirm-token");
      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
      expect(res.json).toHaveBeenCalledWith({ message: "Confirmation email sent!" });
    });

    it("should send a new confirmation email if user exists but is not verified", async () => {
      // Mock services to simulate existing unverified user
      (userService.getUserByEmail as jest.Mock).mockResolvedValue({ id: 1, username: "testuser", email: "test@example.com", email_verified: null });
      (tokenService.generateConfirmAccountToken as jest.Mock).mockResolvedValue({ id: 1, token: "confirm-token", sent_to: "test@example.com" });

      await registerUser(req, res);

      expect(mailController.deliverConfirmationEmail).toHaveBeenCalledWith("test@example.com", "testuser", "confirm-token");
      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({ message: "Account has not been verified! A new confirmation email has been sent!" });
    });

    it("should return error if user already exists and is verified", async () => {
      // Mock services to simulate existing verified user
      (userService.getUserByEmail as jest.Mock).mockResolvedValue({
        id: 1,
        username: "testuser",
        email: "test@example.com",
        email_verified: new Date()
      });

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({ message: "Email already in use!" });
    });

    it("should return 400 when validation fails", async () => {
      // Mock schema validation to fail
      require("../../zod/schemas").registerUserSchema.safeParse = jest.fn().mockReturnValue({
        success: false,
        error: { errors: [{ message: RESPONSE_MESSAGES.PASSWORD_TOO_SHORT }] }
      });

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({ message: RESPONSE_MESSAGES.PASSWORD_TOO_SHORT });
    });
  });

  describe("loginUser", () => {
    it("should authenticate user and return token when credentials are valid", async () => {
      const mockUser = {
        id: 1,
        username: "testuser",
        email: "test@example.com",
        password: "hashedpassword",
        email_verified: new Date()
      };

      (userService.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await loginUser(req, res);

      expect(jwt.sign).toHaveBeenCalledWith({ id: 1 }, "test-secret", { expiresIn: "7d" });
      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(res.json).toHaveBeenCalledWith({
        token: "mock-jwt-token",
        user: {
          id: 1,
          username: "testuser",
          email: "test@example.com",
          email_verified: expect.any(Date)
        }
      });
    });

    it("should return error if user does not exist", async () => {
      (userService.getUserByEmail as jest.Mock).mockResolvedValue(null);

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid credentials" });
    });

    it("should return error if password is incorrect", async () => {
      const mockUser = {
        id: 1,
        username: "testuser",
        email: "test@example.com",
        password: "hashedpassword"
      };

      (userService.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid credentials" });
    });

    it("should send confirmation email if account is not verified", async () => {
      const mockUser = {
        id: 1,
        username: "testuser",
        email: "test@example.com",
        password: "hashedpassword",
        email_verified: null
      };

      (userService.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (tokenService.generateConfirmAccountToken as jest.Mock).mockResolvedValue({
        id: 1,
        token: "confirm-token",
        sent_to: "test@example.com"
      });

      await loginUser(req, res);

      expect(mailController.deliverConfirmationEmail).toHaveBeenCalledWith("test@example.com", "testuser", "confirm-token");
      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({ message: "Account has not been verified! A new confirmation email has been sent!" });
    });
  });

  describe("confirmAccount", () => {
    it("should confirm account when valid token is provided", async () => {
      req.params = { token: "valid-token" };

      const mockToken = {
        id: 1,
        token: "valid-token",
        sent_to: "test@example.com",
        created_at: new Date(),
        context: "email_confirmation"
      };

      const mockUser = {
        id: 1,
        email: "test@example.com",
        username: "testuser"
      };

      (tokenService.getConfirmAccountTokenByToken as jest.Mock).mockResolvedValue(mockToken);
      (userService.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);

      await confirmAccount(req, res);

      expect(db.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          email_verified: expect.any(Date),
          role: "L1"
        }
      });
      expect(userService.updateUser).toHaveBeenCalledWith(1, { email_verified: expect.any(Date), role: "L1" });
      expect(tokenService.deleteToken).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(res.json).toHaveBeenCalledWith({ message: RESPONSE_MESSAGES.ACCOUNT_CONFIRMED });
    });

    it("should return error if token is invalid", async () => {
      req.params = { token: TEST_DATA.auth.invalidToken };

      (tokenService.getConfirmAccountTokenByToken as jest.Mock).mockResolvedValue(null);

      await confirmAccount(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({ message: RESPONSE_MESSAGES.INVALID_TOKEN });
    });

    it("should return error if token has expired", async () => {
      req.params = { token: `${TEST_DATA.auth.expiredTokenPrefix}token` };

      // Create a date 3 days ago to make the token expired
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() - 3);

      const mockToken = {
        id: 1,
        token: "expired-token",
        sent_to: "test@example.com",
        created_at: expiredDate,
        context: "email_confirmation"
      };

      (tokenService.getConfirmAccountTokenByToken as jest.Mock).mockResolvedValue(mockToken);

      await confirmAccount(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({ message: RESPONSE_MESSAGES.TOKEN_EXPIRED });
    });

    it("should return error if user does not exist", async () => {
      req.params = { token: "valid-token" };

      const mockToken = {
        id: 1,
        token: "valid-token",
        sent_to: "test@example.com",
        created_at: new Date(),
        context: "email_confirmation"
      };

      (tokenService.getConfirmAccountTokenByToken as jest.Mock).mockResolvedValue(mockToken);
      (userService.getUserByEmail as jest.Mock).mockResolvedValue(null);

      await confirmAccount(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({ message: RESPONSE_MESSAGES.NO_USER });
    });
  });

  describe("resetPassword", () => {
    it("should reset password when valid token and password are provided", async () => {
      req.params = { token: "valid-token" };
      req.body = { password: "NewPassword123!" };

      const mockToken = {
        id: 1,
        token: "valid-token",
        sent_to: "test@example.com",
        created_at: new Date(),
        context: "reset_password"
      };

      const mockUser = {
        id: 1,
        email: "test@example.com",
        username: "testuser"
      };

      (tokenService.getPasswordResetTokenByToken as jest.Mock).mockResolvedValue(mockToken);
      (userService.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (userService.checkPasswordReused as jest.Mock).mockResolvedValue(false);

      await resetPassword(req, res);

      expect(userService.updateUserPassword).toHaveBeenCalledWith(1, "hashedpassword");
      expect(userService.updateUserPasswordHistory).toHaveBeenCalledWith(1, "hashedpassword");
      expect(tokenService.deleteToken).toHaveBeenCalledWith(1);
      expect(mailController.deliverPasswordResetSuccessfulEmail).toHaveBeenCalledWith("test@example.com", "testuser");
      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(res.json).toHaveBeenCalledWith({ message: RESPONSE_MESSAGES.PASSWORD_UPDATED });
    });

    it("should return error if token is invalid", async () => {
      req.params = { token: TEST_DATA.auth.invalidToken };
      req.body = { password: "NewPassword123!" };

      (tokenService.getPasswordResetTokenByToken as jest.Mock).mockResolvedValue(null);

      await resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({ message: RESPONSE_MESSAGES.INVALID_TOKEN });
    });

    it("should return error if token has expired", async () => {
      req.params = { token: `${TEST_DATA.auth.expiredTokenPrefix}token` };
      req.body = { password: "NewPassword123!" };

      // Create a date 3 days ago to make the token expired
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() - 3);

      const mockToken = {
        id: 1,
        token: "expired-token",
        sent_to: "test@example.com",
        created_at: expiredDate,
        context: "reset_password"
      };

      (tokenService.getPasswordResetTokenByToken as jest.Mock).mockResolvedValue(mockToken);

      await resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({ message: RESPONSE_MESSAGES.TOKEN_EXPIRED });
    });

    it("should return error if user does not exist", async () => {
      req.params = { token: "valid-token" };
      req.body = { password: "NewPassword123!" };

      const mockToken = {
        id: 1,
        token: "valid-token",
        sent_to: "test@example.com",
        created_at: new Date(),
        context: "reset_password"
      };

      (tokenService.getPasswordResetTokenByToken as jest.Mock).mockResolvedValue(mockToken);
      (userService.getUserByEmail as jest.Mock).mockResolvedValue(null);

      await resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({ message: RESPONSE_MESSAGES.NO_USER });
    });

    it("should return error if password has been used before", async () => {
      req.params = { token: "valid-token" };
      req.body = { password: TEST_DATA.auth.reusedPassword };

      const mockToken = {
        id: 1,
        token: "valid-token",
        sent_to: "test@example.com",
        created_at: new Date(),
        context: "reset_password"
      };

      const mockUser = {
        id: 1,
        email: "test@example.com",
        username: "testuser"
      };

      (tokenService.getPasswordResetTokenByToken as jest.Mock).mockResolvedValue(mockToken);
      (userService.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (userService.checkPasswordReused as jest.Mock).mockResolvedValue(true);

      await resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({ message: RESPONSE_MESSAGES.PASSWORD_REUSED });
    });

    it("should return 400 when validation fails", async () => {
      req.params = { token: "valid-token" };
      req.body = { password: "weak" };

      // Mock schema validation to fail
      require("../../zod/schemas").resetPasswordSchema.safeParse = jest.fn().mockReturnValue({
        success: false,
        error: { errors: [{ message: RESPONSE_MESSAGES.PASSWORD_TOO_SHORT }] }
      });

      await resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({ message: RESPONSE_MESSAGES.PASSWORD_TOO_SHORT });
    });
  });

  describe("updatePassword", () => {
    it("should update password when valid data is provided", async () => {
      req.body = {
        currentPassword: "OldPassword123!",
        newPassword: TEST_DATA.auth.validPassword,
        newPassword2: TEST_DATA.auth.validPassword
      };
      // @ts-ignore
      req.user = { id: 1 };

      const mockUser = {
        id: 1,
        email: "test@example.com",
        username: "testuser",
        password: "hashedOldPassword"
      };

      (userService.getUserById as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (userService.checkPasswordReused as jest.Mock).mockResolvedValue(false);

      await updatePassword(req, res);

      expect(userService.updateUserPassword).toHaveBeenCalledWith(1, "hashedpassword");
      expect(userService.updateUserPasswordHistory).toHaveBeenCalledWith(1, "hashedpassword");
      expect(mailController.deliverPasswordResetSuccessfulEmail).toHaveBeenCalledWith("test@example.com", "testuser");
      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(res.json).toHaveBeenCalledWith({ message: RESPONSE_MESSAGES.PASSWORD_UPDATED });
    });

    it("should return error if passwords do not match", async () => {
      req.body = {
        currentPassword: "OldPassword123!",
        newPassword: TEST_DATA.auth.validPassword,
        newPassword2: "DifferentPassword123!"
      };
      // @ts-ignore
      req.user = { id: 1 };

      await updatePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({ message: RESPONSE_MESSAGES.PASSWORDS_MISMATCH });
    });

    it("should return error if user does not exist", async () => {
      req.body = {
        currentPassword: "OldPassword123!",
        newPassword: TEST_DATA.auth.validPassword,
        newPassword2: TEST_DATA.auth.validPassword
      };
      // @ts-ignore
      req.user = { id: 999 };

      (userService.getUserById as jest.Mock).mockResolvedValue(null);

      await updatePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({ message: RESPONSE_MESSAGES.NO_USER });
    });

    it("should return error if current password is incorrect", async () => {
      req.body = {
        currentPassword: "WrongPassword123!",
        newPassword: TEST_DATA.auth.validPassword,
        newPassword2: TEST_DATA.auth.validPassword
      };
      // @ts-ignore
      req.user = { id: 1 };

      const mockUser = {
        id: 1,
        email: "test@example.com",
        username: "testuser",
        password: "hashedOldPassword"
      };

      (userService.getUserById as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await updatePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({ message: RESPONSE_MESSAGES.WRONG_PASSWORD });
    });

    it("should return error if password has been used before", async () => {
      req.body = {
        currentPassword: "OldPassword123!",
        newPassword: TEST_DATA.auth.reusedPassword,
        newPassword2: TEST_DATA.auth.reusedPassword
      };
      // @ts-ignore
      req.user = { id: 1 };

      const mockUser = {
        id: 1,
        email: "test@example.com",
        username: "testuser",
        password: "hashedOldPassword"
      };

      (userService.getUserById as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (userService.checkPasswordReused as jest.Mock).mockResolvedValue(true);

      await updatePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({ message: RESPONSE_MESSAGES.PASSWORD_REUSED });
    });

    it("should return 400 when validation fails", async () => {
      req.body = {
        currentPassword: "OldPassword123!",
        newPassword: "weak",
        newPassword2: "weak"
      };

      // Mock schema validation to fail
      require("../../zod/schemas").updatePasswordSchema.safeParse = jest.fn().mockReturnValue({
        success: false,
        error: { errors: [{ message: RESPONSE_MESSAGES.PASSWORD_TOO_SHORT }] }
      });

      await updatePassword(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({ message: RESPONSE_MESSAGES.PASSWORD_TOO_SHORT });
    });
  });

  describe("requestConfirmationEmail", () => {
    it("should send confirmation email for unverified user", async () => {
      req.body = { email: TEST_DATA.auth.unverifiedEmail };

      const mockUser = {
        id: 1,
        username: "testuser",
        email: TEST_DATA.auth.unverifiedEmail,
        email_verified: null
      };

      (userService.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (tokenService.generateConfirmAccountToken as jest.Mock).mockResolvedValue({
        id: 1,
        token: "confirm-token",
        sent_to: TEST_DATA.auth.unverifiedEmail
      });

      await requestConfirmationEmail(req, res);

      expect(mailController.deliverConfirmationEmail).toHaveBeenCalledWith(TEST_DATA.auth.unverifiedEmail, "testuser", "confirm-token");
      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(res.json).toHaveBeenCalledWith({ message: RESPONSE_MESSAGES.CONFIRMATION_SENT });
    });

    it("should return error if user does not exist", async () => {
      req.body = { email: TEST_DATA.auth.nonexistentEmail };

      (userService.getUserByEmail as jest.Mock).mockResolvedValue(null);

      await requestConfirmationEmail(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({ message: RESPONSE_MESSAGES.NO_USER });
    });

    it("should return error if account is already verified", async () => {
      req.body = { email: TEST_DATA.auth.verifiedEmail };

      const mockUser = {
        id: 1,
        username: "testuser",
        email: TEST_DATA.auth.verifiedEmail,
        email_verified: new Date()
      };

      (userService.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);

      await requestConfirmationEmail(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({ message: RESPONSE_MESSAGES.ACCOUNT_VERIFIED });
    });
  });

  describe("requestForgetPasswordEmail", () => {
    it("should send forget password email when valid email is provided", async () => {
      req.body = { email: "test@example.com" };

      const mockUser = {
        id: 1,
        username: "testuser",
        email: "test@example.com"
      };

      (userService.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (tokenService.generatePasswordResetToken as jest.Mock).mockResolvedValue({
        id: 1,
        token: "reset-token",
        sent_to: "test@example.com"
      });

      await requestForgetPasswordEmail(req, res);

      expect(mailController.deliverForgotPasswordEmail).toHaveBeenCalledWith("test@example.com", "testuser", "reset-token");
      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(res.json).toHaveBeenCalledWith({ message: RESPONSE_MESSAGES.FORGET_PASSWORD_SENT });
    });

    it("should return error if user does not exist", async () => {
      req.body = { email: TEST_DATA.auth.nonexistentEmail };

      (userService.getUserByEmail as jest.Mock).mockResolvedValue(null);

      await requestForgetPasswordEmail(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({ message: RESPONSE_MESSAGES.NO_USER });
    });
  });
});