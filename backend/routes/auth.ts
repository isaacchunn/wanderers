import express from "express";

import { registerUser, loginUser, confirmAccount } from "../controllers/auth";

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

// router.post('/request-confirmation', authController.requestConfirmationEmail)
// router.post('/forgot-password', authController.requestForgetPasswordEmail)

/**
 * @swagger
 * /api/auth/confirm-account/{token}:
 *   get:
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
router.get("/confirm-account/:token", confirmAccount);
// router.post('/update-password/:token', authController.updatePassword)
// router.post('/reset-password/:token', authController.updatePassword)

export { router as default };
