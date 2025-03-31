import mailService from "../../services/mail";
import {
    deliverConfirmationEmail,
    deliverForgotPasswordEmail,
    deliverPasswordResetSuccessfulEmail,
    deliverItineraryCollabEmail
} from "../../controllers/mail";

// Mock the mail service
jest.mock("../../services/mail", () => ({
    sendMail: jest.fn().mockResolvedValue(true)
}));

describe("Mail Controller Tests", () => {
    beforeEach(() => {
        // Store the original environment variables
        process.env.FRONTEND_URL = "https://test.wanderers.com";
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("deliverConfirmationEmail", () => {
        it("should send confirmation email with correct parameters", async () => {
            const email = "test@example.com";
            const username = "testuser";
            const token = "confirmation-token-123";

            await deliverConfirmationEmail(email, username, token);

            expect(mailService.sendMail).toHaveBeenCalledWith(
                email,
                "Confirm Email Address",
                expect.stringContaining(username)
            );
            expect(mailService.sendMail).toHaveBeenCalledWith(
                email,
                "Confirm Email Address",
                expect.stringContaining(token)
            );
            expect(mailService.sendMail).toHaveBeenCalledWith(
                email,
                "Confirm Email Address",
                expect.stringContaining("https://test.wanderers.com/confirm-account")
            );
        });
    });

    describe("deliverForgotPasswordEmail", () => {
        it("should send forgot password email with correct parameters", async () => {
            const email = "test@example.com";
            const username = "testuser";
            const token = "reset-token-123";

            await deliverForgotPasswordEmail(email, username, token);

            expect(mailService.sendMail).toHaveBeenCalledWith(
                email,
                "Reset Wanderers Password",
                expect.stringContaining(username)
            );
            expect(mailService.sendMail).toHaveBeenCalledWith(
                email,
                "Reset Wanderers Password",
                expect.stringContaining(token)
            );
            expect(mailService.sendMail).toHaveBeenCalledWith(
                email,
                "Reset Wanderers Password",
                expect.stringContaining("https://test.wanderers.com/reset-password")
            );
        });
    });

    describe("deliverPasswordResetSuccessfulEmail", () => {
        it("should send password reset success email with correct parameters", async () => {
            const email = "test@example.com";
            const username = "testuser";

            await deliverPasswordResetSuccessfulEmail(email, username);

            expect(mailService.sendMail).toHaveBeenCalledWith(
                email,
                "Password Changed",
                expect.stringContaining(username)
            );
            expect(mailService.sendMail).toHaveBeenCalledWith(
                email,
                "Password Changed",
                expect.stringContaining("successfully reset")
            );
        });
    });

    describe("deliverItineraryCollabEmail", () => {
        it("should send itinerary collaboration invitation email with correct parameters", async () => {
            const email = "test@example.com";
            const username = "testuser";
            const itineraryId = 123;
            const inviterUsername = "inviter";
            const itineraryName = "Trip to Japan";
            const itineraryLocation = "Japan";

            await deliverItineraryCollabEmail(
                email,
                username,
                itineraryId,
                inviterUsername,
                itineraryName,
                itineraryLocation
            );

            expect(mailService.sendMail).toHaveBeenCalledWith(
                email,
                `Wanderers - Invitation to collaborate in "${itineraryName}"`,
                expect.stringContaining(username)
            );
            expect(mailService.sendMail).toHaveBeenCalledWith(
                email,
                expect.any(String),
                expect.stringContaining(inviterUsername)
            );
            expect(mailService.sendMail).toHaveBeenCalledWith(
                email,
                expect.any(String),
                expect.stringContaining(itineraryName)
            );
            expect(mailService.sendMail).toHaveBeenCalledWith(
                email,
                expect.any(String),
                expect.stringContaining(itineraryLocation)
            );
            expect(mailService.sendMail).toHaveBeenCalledWith(
                email,
                expect.any(String),
                expect.stringContaining(`https://test.wanderers.com/itinerary/${itineraryId}`)
            );
        });
    });
});