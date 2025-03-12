import express from "express";

import { registerUser, loginUser, confirmAccount, resetPassword, requestConfirmationEmail, requestForgetPasswordEmail, updatePassword } from "../controllers/auth";
import { protect } from "../middleware/auth";

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register new user
 *     description: Register a new user and send a confirmation email. If the user exists but is not verified, a new confirmation email is sent.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: The desired username.
 *                 example: johnDoe
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address.
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password.
 *                 example: P@ssw0rd!
 *     responses:
 *       201:
 *         description: Confirmation email sent successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Confirmation email sent!
 *       400:
 *         description: Registration error (e.g. validation failure, email already in use, or unverified account).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email already in use!
 */
router.post("/register", registerUser);



router.post("/request-confirmation", requestConfirmationEmail);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authenticate a user
 *     description: Authenticate a user by validating their credentials and returning a JWT token along with user details. If the account is not verified, a new confirmation email is sent.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The user's email address.
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: The user's password.
 *                 example: P@ssw0rd!
 *     responses:
 *       200:
 *         description: User authenticated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token.
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: number
 *                       example: 1
 *                     username:
 *                       type: string
 *                       example: johnDoe
 *                     email:
 *                       type: string
 *                       example: john@example.com
 *                     email_verified:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Authentication error (e.g. invalid credentials or account not verified).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid credentials
 */
router.post("/login", loginUser);


/**
 * @swagger
 * /api/auth/request-confirmation:
 *   post:
 *     summary: Sends account confirmation email
 *     description: >
 *       Sends an account confirmation email to a user if the account is not yet verified.
 *       If the user does not exist or is already verified, an appropriate error is returned.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email address of the user.
 *                 example: john@example.com
 *     responses:
 *       200:
 *         description: Confirmation email sent successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Confirmation email sent
 *       400:
 *         description: User does not exist or account already verified.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User does not exist
 */
router.post("/request-confirmation", requestConfirmationEmail);

/**
 * @swagger
 * /api/auth/confirm-account/{token}:
 *   post:
 *     summary: Confirm user account
 *     description: Confirm a user's account using a token sent via email. Updates the user's status to verified if the token is valid and not expired.
 *     tags:
 *       - Auth
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The confirmation token provided in the email.
 *     responses:
 *       200:
 *         description: Account confirmed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Account confirmed
 *       400:
 *         description: Confirmation error (e.g. invalid token, expired token, or user does not exist).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid token
 */
router.post("/confirm-account/:token", confirmAccount);


/**
 * @swagger
 * /api/auth/forget-password:
 *   post:
 *     summary: Sends forget password email to user
 *     description: >
 *       Sends a password reset email to a user. The email contains a token that can be used to reset the password.
 *       If the user does not exist, an error is returned.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The user's email address.
 *                 example: john@example.com
 *     responses:
 *       200:
 *         description: Forget password email sent successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Forget password email sent
 *       400:
 *         description: User does not exist.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User does not exist
 */
router.post("/forget-password", requestForgetPasswordEmail);


/**
 * @swagger
 * /api/auth/reset-password/{token}:
 *   post:
 *     summary: Reset user password through email
 *     description: >
 *       Resets a user's password using a token provided in the URL. The token is validated for existence and expiration.
 *       If valid, the user's password is updated and a confirmation email is sent.
 *     tags:
 *       - Auth
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The password reset token sent via email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 description: The new password to set for the user.
 *                 example: NewP@ssw0rd!
 *     responses:
 *       200:
 *         description: Password updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password updated
 *       400:
 *         description: Invalid token, token expired, or user does not exist.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Token has expired
 */
router.post("/reset-password/:token", resetPassword);

/**
 * @swagger
 * /api/auth/update-password:
 *   put:
 *     summary: Update user password in settings
 *     description: >
 *       Allows an authenticated user to update their password. The request must include the old password for verification.
 *       If successful, the password is updated, and a confirmation email is sent to the user.
 *     tags:
 *       - Auth
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - newPassword2
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: The current password of the user.
 *                 example: "oldpassword123"
 *               newPassword:
 *                 type: string
 *                 description: The new password the user wants to set.
 *                 example: "NewP@ssw0rd!"
 *               newPassword2:
 *                 type: string
 *                 description: Must match newPassword for confirmation.
 *                 example: "NewP@ssw0rd!"
 *     responses:
 *       200:
 *         description: Password updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password updated
 *       400:
 *         description: Validation error or incorrect password.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Old password is incorrect
 *       401:
 *         description: Unauthorized - User is not authenticated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 */
router.put("/update-password", protect, updatePassword);

export { router as default };
