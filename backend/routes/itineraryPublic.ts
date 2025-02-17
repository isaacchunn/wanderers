import express from "express";

import {
  getItinerariesPublicApi,
  getCreatedItinerariesPublicApi,
  getItineraryPublicApi,
} from "../controllers/itinerary";

const router = express.Router();
/**
 * @swagger
 * tags:
 *   - name: Itinerary (Public)
 *     description: Public endpoints related to itineraries (to be used when a user is not logged in)
 */

/**
 * @swagger
 * /api/public/itinerary:
 *   get:
 *     summary: Get all public itineraries
 *     description: Fetch all public itineraries
 *     tags: [Itinerary (Public)]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number to retrieve (default is 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page (default is 10)
 *     responses:
 *       200:
 *         description: A list of itineraries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Itinerary'
 *       500:
 *         description: Internal Server Error.
 */
router.route("/").get(getItinerariesPublicApi);

/**
 * @swagger
 * /api/public/itinerary/{ownerId}/created:
 *   get:
 *     summary: Get all public itineraries created by the ownerId
 *     description: Fetches all itineraries where the user is the owner.
 *     tags: [Itinerary (Public)]
 *     parameters:
 *       - in: path
 *         name: ownerId
 *         required: true
 *         description: The ID of the user who owns the itinerary.
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number to retrieve (default is 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page (default is 10)
 *     responses:
 *       200:
 *         description: A list of public itineraries the user owns.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Itinerary'
 *       500:
 *         description: Internal Server Error.
 */
router.route("/:ownerId/created").get(getCreatedItinerariesPublicApi);

/**
 * @swagger
 * /api/public/itinerary/{itineraryId}:
 *   get:
 *     summary: Access an existing public itinerary
 *     description: Retrieve an existing itinerary by its ID.
 *     tags: [Itinerary (Public)]
 *     parameters:
 *       - in: path
 *         name: itineraryId
 *         required: true
 *         description: The ID of the itinerary to be retrieved.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: The itinerary was successfully retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Itinerary'
 *       404:
 *         description: Itinerary not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Itinerary not found"
 *       500:
 *         description: Internal Server Error.
 */
router.route("/:itineraryId").get(getItineraryPublicApi);

export { router as default };
