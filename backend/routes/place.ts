import express from "express";

import {
  searchPlaceController
} from "../controllers/place";

const router = express.Router();

/**
 * @swagger
 * /api/place:
 *   post:
 *     summary: Query a place
 *     description: Query a place by string and return a list of places
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Activity'
 *     responses:
 *       201:
 *         description: Place queried successfully
 *       400:
 *         description: Invalid query data
 *       500:
 *         description: Internal server error
 */
router.post("/search", searchPlaceController);

export { router as default };
