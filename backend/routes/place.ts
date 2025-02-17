import express from "express";

import {
  searchPlaceController
} from "../controllers/place";

const router = express.Router();

/**
 * @swagger
 * /api/place/search:
 *   post:
 *     summary: Search a place with optional country restriction
 *     description: >
 *       Searches for a place using the Google Places Autocomplete API, optionally restricting results to a specified country.
 *       The endpoint returns up to 5 predictions, each including the place's name, latitude, longitude, and an associated image URL (if available).
 *     tags:
 *       - Place
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               search:
 *                 type: string
 *                 description: The search query for the place (e.g., "Namsan").
 *                 example: Namsan
 *               country:
 *                 type: string
 *                 description: Optional country code to restrict results (e.g., "kr" for South Korea).
 *                 example: kr
 *             required:
 *               - search
 *     responses:
 *       200:
 *         description: Returns an array of place objects with details.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                     description: The name of the place.
 *                     example: Namsan Tower
 *                   lat:
 *                     type: number
 *                     description: The latitude coordinate of the place.
 *                     example: 37.551169
 *                   lon:
 *                     type: number
 *                     description: The longitude coordinate of the place.
 *                     example: 126.988227
 *                   image:
 *                     type: string
 *                     description: A URL to an image of the place, if available.
 *                     example: "https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=PHOTO_REFERENCE&key=YOUR_API_KEY"
 *       400:
 *         description: Invalid search query provided.
 *       404:
 *         description: No predictions found.
 *       500:
 *         description: Internal server error.
 */
router.post("/search", searchPlaceController);

export { router as default };
