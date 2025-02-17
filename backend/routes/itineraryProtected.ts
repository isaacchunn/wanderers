import express from "express";

import {
  createItineraryApi,
  getCollabItinerariesApi,
  updateItineraryApi,
  deleteItineraryApi,
  getCreatedItinerariesProtectedApi,
  getItineraryProtectedApi,
} from "../controllers/itinerary";

const router = express.Router();
/**
 * @swagger
 * tags:
 *   - name: Itinerary (Protected)
 *     description: Protected endpoints related to itineraries (logged in userId=1 for now until login is fully implemented)
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     Itinerary:
 *       type: object
 *       required:
 *         - id
 *         - title
 *         - location
 *         - owner_id
 *         - visibility
 *         - start_date
 *         - end_date
 *         - active
 *         - created_at
 *         - updated_at
 *         - photos
 *         - collaborators
 *         - _count
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated ID of the itinerary
 *         title:
 *           type: string
 *           description: The title of the itinerary
 *         location:
 *           type: string
 *           description: The location of the itinerary
 *         owner_id:
 *           type: integer
 *           description: The ID of the itinerary owner
 *         visibility:
 *           type: string
 *           enum: ["public", "private"]
 *           description: The visibility status of the itinerary
 *         start_date:
 *           type: string
 *           format: date-time
 *           description: The start date of the itinerary
 *         end_date:
 *           type: string
 *           format: date-time
 *           description: The end date of the itinerary
 *         active:
 *           type: boolean
 *           description: Indicates if the itinerary is active
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the itinerary was created
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the itinerary was last updated
 *         photos:
 *           type: array
 *           description: List of photos associated with the itinerary
 *           items:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *                 description: URL of the photo
 *         collaborators:
 *           type: array
 *           description: List of collaborators associated with the itinerary
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 description: Unique ID of the collaborator
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email of the collaborator
 *         _count:
 *           type: object
 *           properties:
 *             votes:
 *               type: integer
 *               description: The count of votes associated with the itinerary
 *       example:
 *         id: 123
 *         created_at: "2025-02-10T12:00:00Z"
 *         updated_at: "2025-02-10T12:30:00Z"
 *         title: "My Travel Itinerary"
 *         location: "Paris, France"
 *         owner_id: 456
 *         visibility: "public"
 *         start_date: "2025-03-01T00:00:00Z"
 *         end_date: "2025-03-10T00:00:00Z"
 *         active: true
 *         photos:
 *           - id: 1
 *             url: "https://example.com/photo1.jpg"
 *           - id: 2
 *             url: "https://example.com/photo2.jpg"
 *         collaborators:
 *           - id: 1
 *             email: "collaborator1@example.com"
 *           - id: 2
 *             email: "collaborator2@example.com"
 *         _count:
 *           votes: 3
 */

/**
 * @swagger
 * /api/itinerary:
 *   post:
 *     summary: Creates a new itinerary
 *     description: Creates a new itinerary with the provided data.
 *     tags: [Itinerary (Protected)]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the itinerary
 *                 example: "Weekend Getaway"
 *               location:
 *                 type: string
 *                 description: Location of the itinerary
 *                 example: "Paris"
 *               start_date:
 *                 type: date-time
 *                 description: Start date of the itinerary
 *                 example: 2025-12-21T00:00:00.000Z
 *               end_date:
 *                 type: date-time
 *                 description: End date of the itinerary
 *                 example: 2025-12-21T00:00:00.000Z
 *               visibility:
 *                 type: string
 *                 description: Visibility of the itinerary (e.g., public or private)
 *                 example: "public"
 *               collaborators:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of collaborator emails
 *                 example: [email1@email.com, email2@email.com, email3@email.com]
 *     responses:
 *       201:
 *         description: Successfully created itinerary
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Itinerary'
 *       400:
 *         description: Invalid Input.
 *       401:
 *         description: Unauthorized Access.
 *       500:
 *         description: Internal Server Error.
 */
router.route("/").post(createItineraryApi);

/**
 * @swagger
 * /api/itinerary/collaborated:
 *   get:
 *     summary: Get all collaborated itineraries by the logged in user
 *     description: Retrieve all itineraries that the authenticated user has been invited to collaborate on.
 *     tags: [Itinerary (Protected)]
 *     security:
 *       - BearerAuth: []
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
 *         description: Successfully retrieved the list of collaborated itineraries.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                  $ref: '#/components/schemas/Itinerary'
 *       401:
 *         description: Unauthorized Access.
 *       500:
 *         description: Internal Server Error.
 */
router.route("/collaborated").get(getCollabItinerariesApi);

/**
 * @swagger
 * /api/itinerary/{ownerId}/created:
 *   get:
 *     summary: Get all itineraries created by the ownerId
 *     description: Fetches all itineraries where the user is the owner.
 *     tags: [Itinerary (Protected)]
 *     security:
 *       - BearerAuth: []
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
 *         description: A list of itineraries the user owns. If ownerId does not match the requesting userId, it will only return a list of public itineraries.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Itinerary'
 *       401:
 *         description: Unauthorized Access.
 *       500:
 *         description: Internal Server Error.
 */
router.route("/:ownerId/created").get(getCreatedItinerariesProtectedApi);

/**
 * @swagger
 * /api/itinerary/{itineraryId}:
 *   get:
 *     summary: Access an existing itinerary by ID
 *     description: Retrieve an existing itinerary by its ID. If the itinerary is private, access is only allowed to the owner or collaborators.
 *     tags: [Itinerary (Protected)]
 *     security:
 *       - BearerAuth: []
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
 *       401:
 *         description: Unauthorized Access.
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
router.route("/:itineraryId").get(getItineraryProtectedApi);

/**
 * @swagger
 * /api/itinerary/{itineraryId}:
 *   put:
 *     summary: Update an itinerary by ID
 *     description: Update the details of an existing itinerary by its ID.
 *     tags: [Itinerary (Protected)]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: itineraryId
 *         in: path
 *         description: ID of the itinerary to be updated
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the itinerary
 *                 example: "Trip to Paris"
 *               location:
 *                 type: string
 *                 description: Location of the itinerary
 *                 example: "Paris, France"
 *               visibility:
 *                 type: string
 *                 enum: ["public", "private"]
 *                 description: The visibility status of the itinerary
 *                 example: "public"
 *               start_date:
 *                 type: date-time
 *                 description: Start date of the itinerary
 *                 example: 2025-12-21T00:00:00.000Z
 *               end_date:
 *                 type: date-time
 *                 description: End date of the itinerary
 *                 example: 2025-12-21T00:00:00.000Z
 *     responses:
 *       200:
 *         description: Successfully updated the itinerary
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Itinerary'
 *       400:
 *         description: Invalid Input.
 *       500:
 *         description: Internal Server Error.
 */
router.route("/:itineraryId").put(updateItineraryApi);

/**
 * @swagger
 * /api/itinerary/{itineraryId}:
 *   delete:
 *     summary: Delete an itinerary by ID
 *     description: Soft delete an existing itinerary by its ID.
 *     tags: [Itinerary (Protected)]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: itineraryId
 *         in: path
 *         description: ID of the itinerary to be updated
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Successfully deleted the itinerary
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Itinerary'
 *       500:
 *         description: Internal Server Error.
 */
router.route("/:itineraryId").delete(deleteItineraryApi);

export { router as default };
