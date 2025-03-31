import {
  getConfirmAccountTokenByToken,
  getConfirmAccountTokenByEmail,
  getPasswordResetTokenByToken,
  getPasswordResetokenByEmail,
  generatePasswordResetToken,
  generateConfirmAccountToken,
  deleteToken
} from "../../services/token";
import { db } from "../../controllers/db";

// Mock uuid to return predictable values
jest.mock("uuid", () => ({
  v4: jest.fn().mockReturnValue("test-uuid-token")
}));

// Mock the database
jest.mock("../../controllers/db", () => ({
  db: {
    userToken: {
      findFirst: jest.fn(),
      create: jest.fn(),
      delete: jest.fn()
    }
  }
}));

describe("Token Service Tests", () => {
  const mockToken = {
    id: "token-id-1",
    token: "test-token-value",
    sent_to: "test@example.com",
    context: "email_confirmation",
    created_at: new Date(),
    updated_at: new Date()
  };

  const mockResetToken = {
    ...mockToken,
    id: "token-id-2",
    token: "reset-token-value",
    context: "reset_password"
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getConfirmAccountTokenByToken", () => {
    it("should return a token when it exists", async () => {
      (db.userToken.findFirst as jest.Mock).mockResolvedValue(mockToken);

      const result = await getConfirmAccountTokenByToken("test-token-value");

      expect(db.userToken.findFirst).toHaveBeenCalledWith({
        where: { token: "test-token-value", context: "email_confirmation" }
      });
      expect(result).toEqual(mockToken);
    });

    it("should return null when token doesn't exist", async () => {
      (db.userToken.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await getConfirmAccountTokenByToken("non-existent-token");

      expect(db.userToken.findFirst).toHaveBeenCalledWith({
        where: { token: "non-existent-token", context: "email_confirmation" }
      });
      expect(result).toBeNull();
    });

    it("should return null on database error", async () => {
      (db.userToken.findFirst as jest.Mock).mockRejectedValue(new Error("Database error"));

      const result = await getConfirmAccountTokenByToken("test-token-value");

      expect(result).toBeNull();
    });
  });

  describe("getConfirmAccountTokenByEmail", () => {
    it("should return a token when it exists for the email", async () => {
      (db.userToken.findFirst as jest.Mock).mockResolvedValue(mockToken);

      const result = await getConfirmAccountTokenByEmail("test@example.com");

      expect(db.userToken.findFirst).toHaveBeenCalledWith({
        where: { sent_to: "test@example.com", context: "email_confirmation" }
      });
      expect(result).toEqual(mockToken);
    });

    it("should return null when no token exists for the email", async () => {
      (db.userToken.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await getConfirmAccountTokenByEmail("no-token@example.com");

      expect(db.userToken.findFirst).toHaveBeenCalledWith({
        where: { sent_to: "no-token@example.com", context: "email_confirmation" }
      });
      expect(result).toBeNull();
    });

    it("should return null on database error", async () => {
      (db.userToken.findFirst as jest.Mock).mockRejectedValue(new Error("Database error"));

      const result = await getConfirmAccountTokenByEmail("test@example.com");

      expect(result).toBeNull();
    });
  });

  describe("getPasswordResetTokenByToken", () => {
    it("should return a reset token when it exists", async () => {
      (db.userToken.findFirst as jest.Mock).mockResolvedValue(mockResetToken);

      const result = await getPasswordResetTokenByToken("reset-token-value");

      expect(db.userToken.findFirst).toHaveBeenCalledWith({
        where: { token: "reset-token-value", context: "reset_password" }
      });
      expect(result).toEqual(mockResetToken);
    });

    it("should return null when reset token doesn't exist", async () => {
      (db.userToken.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await getPasswordResetTokenByToken("non-existent-token");

      expect(db.userToken.findFirst).toHaveBeenCalledWith({
        where: { token: "non-existent-token", context: "reset_password" }
      });
      expect(result).toBeNull();
    });

    it("should return null on database error", async () => {
      (db.userToken.findFirst as jest.Mock).mockRejectedValue(new Error("Database error"));

      const result = await getPasswordResetTokenByToken("reset-token-value");

      expect(result).toBeNull();
    });
  });

  describe("getPasswordResetokenByEmail", () => {
    it("should return a reset token when it exists for the email", async () => {
      (db.userToken.findFirst as jest.Mock).mockResolvedValue(mockResetToken);

      const result = await getPasswordResetokenByEmail("test@example.com");

      expect(db.userToken.findFirst).toHaveBeenCalledWith({
        where: { sent_to: "test@example.com", context: "reset_password" }
      });
      expect(result).toEqual(mockResetToken);
    });

    it("should return null when no reset token exists for the email", async () => {
      (db.userToken.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await getPasswordResetokenByEmail("no-token@example.com");

      expect(db.userToken.findFirst).toHaveBeenCalledWith({
        where: { sent_to: "no-token@example.com", context: "reset_password" }
      });
      expect(result).toBeNull();
    });

    it("should return null on database error", async () => {
      (db.userToken.findFirst as jest.Mock).mockRejectedValue(new Error("Database error"));

      const result = await getPasswordResetokenByEmail("test@example.com");

      expect(result).toBeNull();
    });
  });

  describe("generatePasswordResetToken", () => {
    it("should create a new password reset token", async () => {
      // No existing token
      (db.userToken.findFirst as jest.Mock).mockResolvedValue(null);
      (db.userToken.create as jest.Mock).mockResolvedValue({
        id: "new-token-id",
        token: "test-uuid-token",
        sent_to: "test@example.com",
        context: "reset_password",
        created_at: expect.any(Date),
        updated_at: expect.any(Date)
      });

      const result = await generatePasswordResetToken("test@example.com");

      expect(db.userToken.findFirst).toHaveBeenCalledWith({
        where: { sent_to: "test@example.com", context: "reset_password" }
      });
      expect(db.userToken.delete).not.toHaveBeenCalled();
      expect(db.userToken.create).toHaveBeenCalledWith({
        data: {
          sent_to: "test@example.com",
          token: "test-uuid-token",
          context: "reset_password",
          created_at: expect.any(Date),
          updated_at: expect.any(Date)
        }
      });
      expect(result).toEqual({
        id: "new-token-id",
        token: "test-uuid-token",
        sent_to: "test@example.com",
        context: "reset_password",
        created_at: expect.any(Date),
        updated_at: expect.any(Date)
      });
    });

    it("should delete existing token before creating a new one", async () => {
      // Existing token
      (db.userToken.findFirst as jest.Mock).mockResolvedValue(mockResetToken);
      (db.userToken.delete as jest.Mock).mockResolvedValue({});
      (db.userToken.create as jest.Mock).mockResolvedValue({
        id: "new-token-id",
        token: "test-uuid-token",
        sent_to: "test@example.com",
        context: "reset_password",
        created_at: expect.any(Date),
        updated_at: expect.any(Date)
      });

      const result = await generatePasswordResetToken("test@example.com");

      expect(db.userToken.findFirst).toHaveBeenCalledWith({
        where: { sent_to: "test@example.com", context: "reset_password" }
      });
      expect(db.userToken.delete).toHaveBeenCalledWith({
        where: {
          id: mockResetToken.id,
          context: "reset_password"
        }
      });
      expect(db.userToken.create).toHaveBeenCalledWith({
        data: {
          sent_to: "test@example.com",
          token: "test-uuid-token",
          context: "reset_password",
          created_at: expect.any(Date),
          updated_at: expect.any(Date)
        }
      });
      expect(result).toEqual({
        id: "new-token-id",
        token: "test-uuid-token",
        sent_to: "test@example.com",
        context: "reset_password",
        created_at: expect.any(Date),
        updated_at: expect.any(Date)
      });
    });
  });

  describe("generateConfirmAccountToken", () => {
    it("should create a new confirmation token", async () => {
      // No existing token
      (db.userToken.findFirst as jest.Mock).mockResolvedValue(null);
      (db.userToken.create as jest.Mock).mockResolvedValue({
        id: "new-token-id",
        token: "test-uuid-token",
        sent_to: "test@example.com",
        context: "email_confirmation",
        created_at: expect.any(Date),
        updated_at: expect.any(Date)
      });

      const result = await generateConfirmAccountToken("test@example.com");

      expect(db.userToken.findFirst).toHaveBeenCalledWith({
        where: { sent_to: "test@example.com", context: "email_confirmation" }
      });
      expect(db.userToken.delete).not.toHaveBeenCalled();
      expect(db.userToken.create).toHaveBeenCalledWith({
        data: {
          sent_to: "test@example.com",
          context: "email_confirmation",
          token: "test-uuid-token",
          created_at: expect.any(Date),
          updated_at: expect.any(Date)
        }
      });
      expect(result).toEqual({
        id: "new-token-id",
        token: "test-uuid-token",
        sent_to: "test@example.com",
        context: "email_confirmation",
        created_at: expect.any(Date),
        updated_at: expect.any(Date)
      });
    });

    it("should delete existing token before creating a new one", async () => {
      // Existing token
      (db.userToken.findFirst as jest.Mock).mockResolvedValue(mockToken);
      (db.userToken.delete as jest.Mock).mockResolvedValue({});
      (db.userToken.create as jest.Mock).mockResolvedValue({
        id: "new-token-id",
        token: "test-uuid-token",
        sent_to: "test@example.com",
        context: "email_confirmation",
        created_at: expect.any(Date),
        updated_at: expect.any(Date)
      });

      const result = await generateConfirmAccountToken("test@example.com");

      expect(db.userToken.findFirst).toHaveBeenCalledWith({
        where: { sent_to: "test@example.com", context: "email_confirmation" }
      });
      expect(db.userToken.delete).toHaveBeenCalledWith({
        where: {
          id: mockToken.id
        }
      });
      expect(db.userToken.create).toHaveBeenCalledWith({
        data: {
          sent_to: "test@example.com",
          context: "email_confirmation",
          token: "test-uuid-token",
          created_at: expect.any(Date),
          updated_at: expect.any(Date)
        }
      });
      expect(result).toEqual({
        id: "new-token-id",
        token: "test-uuid-token",
        sent_to: "test@example.com",
        context: "email_confirmation",
        created_at: expect.any(Date),
        updated_at: expect.any(Date)
      });
    });
  });

  describe("deleteToken", () => {
    it("should delete a token by id", async () => {
      (db.userToken.delete as jest.Mock).mockResolvedValue({});

      await deleteToken("token-id-1");

      expect(db.userToken.delete).toHaveBeenCalledWith({
        where: { id: "token-id-1" }
      });
    });

    it("should handle errors when deleting tokens", async () => {
      (db.userToken.delete as jest.Mock).mockRejectedValue(new Error("Database error"));

      // The function doesn't have error handling, so it should throw
      await expect(deleteToken("token-id-1")).rejects.toThrow("Database error");

      expect(db.userToken.delete).toHaveBeenCalledWith({
        where: { id: "token-id-1" }
      });
    });
  });
});
