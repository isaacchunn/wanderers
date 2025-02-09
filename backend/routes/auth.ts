import express from "express";

import { registerUser, loginUser, confirmAccount } from "../controllers/auth";

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register new user
 *     description: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 */
router.post("/register", registerUser);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authenticate a user
 *     description: Authenticate a user with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User authenticated successfully
 *       400:
 *         description: Invalid credentials
 */
router.post("/login", loginUser);

// router.post('/request-confirmation', authController.requestConfirmationEmail)
// router.post('/forgot-password', authController.requestForgetPasswordEmail)
router.get("/confirm-account/:token", confirmAccount);
// router.post('/update-password/:token', authController.updatePassword)
// router.post('/reset-password/:token', authController.updatePassword)

export { router as default };
