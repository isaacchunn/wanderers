import express from "express";

import { getUserController } from "../controllers/user";

const router = express.Router();

/**
 * @swagger
 * /api/user/{id}:
 *   get:
 *     summary: Get user by id
 *     description: Retrieves a user by their ID. Returns the user data if found, otherwise responds with a 404 error.
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user to retrieve.
 *     responses:
 *       200:
 *         description: User found successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                   example: 3
 *                 username:
 *                   type: string
 *                   example: johnDoe
 *                 email:
 *                   type: string
 *                   example: john@example.com
 *                 email_verified:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-02-21T03:15:34.346Z
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Internal Server Error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
 */
router.get("/:id", getUserController);

export { router as default };
