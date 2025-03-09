import express from "express";

import { getChatMessagesApi } from "../controllers/chat";
import { protect } from "../middleware/auth";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Chat Messages
 *     description: Endpoints related to chat messages
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     ChatMessage:
 *       type: object
 *         - id
 *         - chat_message
 *         - chat_message_by_id
 *         - itinerary_id
 *         - active
 *         - created_at
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated ID of the chat message
 *         chat_message:
 *           type: string
 *           description: The content of the chat message
 *         chat_message_by_id:
 *           type: string
 *           description: The the userId of the user who wrote the chat message
 *         itinerary_id:
 *           type: integer
 *           description: The ID of the itinerary owner
 *         active:
 *           type: boolean
 *           description: True/False of whether the chat message is deleted
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: The send date of the chat message
 *         chat_message_by:
 *           type: object
 *           properties:
 *             username:
 *               type: string
 *               description: The username of the owner
 *       example:
 *         id: 1
 *         chat_message: "Hello"
 *         chat_message_by_id: 1
 *         itinerary_id: 1
 *         active: true
 *         created_at: "2025-03-01T00:00:00Z"
 *         chat_message_by:
 *           username: "user1"
 */

/**
 * @swagger
 * /api/chat/{itineraryId}:
 *   get:
 *     summary: Get all chat messages of the itineraryId
 *     description: Fetches all chat messages by itinerary ID.
 *     tags: [Chat Messages]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itineraryId
 *         required: true
 *         description: The ID of the itinerary.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of chat messages sent in the itinerary chat room.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ChatMessage'
 *       401:
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No token provided
 *       500:
 *         description: Internal Server Error.
 */
router.route("/:itineraryId").get(protect, getChatMessagesApi);

export { router as default };
