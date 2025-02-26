import express from "express";

import {
  createActivityController,
  getActivityByIdController,
  getActivitiesByItineraryIdController,
  updateActivityController,
  deleteActivityController,
} from "../controllers/activity";
import { protect } from "../middleware/auth";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Activity
 *     description: Endpoints related to activities
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Activity:
 *       type: object
 *       required:
 *         - title
 *         - lat
 *         - lon
 *         - itinerary_id
 *         - expense
 *         - split
 *         - sequence
 *         - start_date
 *         - end_date
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated ID of the activity
 *         title:
 *           type: string
 *           description: The title of the activity
 *         description:
 *           type: string
 *           nullable: true
 *           description: Description of the activity
 *         itinerary_id:
 *           type: integer
 *           description: The ID of the itinerary the activity belongs to
 *         lat:
 *           type: number
 *           description: The latitude of the activity
 *         lon:
 *           type: number
 *           description: The longitude of the activity
 *         expense:
 *           type: number
 *           description: The cost of the activity
 *         split:
 *           type: string
 *           enum: ["equal", "custom"]
 *           description: How the expense is split
 *         sequence:
 *           type: integer
 *           description: The order of the activity in the itinerary
 *         photo_url:
 *           type: string
 *           nullable: true
 *           description: URL of photo associated with the activity
 *         start_date:
 *           type: string
 *           format: date-time
 *           description: The start date of the activity
 *         end_date:
 *           type: string
 *           format: date-time
 *           description: The end date of the activity
 *         active:
 *           type: boolean
 *           default: true
 *           description: Indicates if the activity is active
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Timestamp of activity creation
 *         place_id:
 *           type: string
 *           nullable: true
 *           description: Google Place ID of the activity location
 *         formatted_address:
 *           type: string
 *           nullable: true
 *           description: Formatted address of the activity location
 *         types:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of place types from Google Places API
 *         rating:
 *           type: number
 *           nullable: true
 *           description: Rating of the place if available
 *         user_ratings_total:
 *           type: integer
 *           nullable: true
 *           description: Total number of user ratings for the place
 *         international_phone_number:
 *           type: string
 *           nullable: true
 *           description: International phone number of the place
 *         website:
 *           type: string
 *           nullable: true
 *           description: Website URL of the place
 *         opening_hours:
 *           type: array
 *           items:
 *             type: string
 *           nullable: true
 *           description: Opening hours of the place
 *         google_maps_url:
 *           type: string
 *           nullable: true
 *           description: Direct Google Maps URL for the place
 *       example:
 *         id: 1
 *         title: "Hiking at Mount Fuji"
 *         description: "A guided hiking tour"
 *         itinerary_id: 123
 *         lat: 35.3606
 *         lon: 138.7274
 *         expense: 200
 *         split: "split"
 *         sequence: 1
 *         photo_url: "https://example.com/photo1.jpg"
 *         start_date: "2025-12-21T00:00:00.000Z"
 *         end_date: "2025-12-21T00:00:00.000Z"
 *         active: true
 *         created_at: "2025-01-01T12:00:00.000Z"
 *         place_id: "ChIJyWEHuEmuEmsRm9hTkapTCrk"
 *         formatted_address: "Fujinomiya, Shizuoka, Japan"
 *         types: ["tourist_attraction", "point_of_interest"]
 *         rating: 4.8
 *         user_ratings_total: 1200
 *         international_phone_number: "+81 3-1234-5678"
 *         website: "https://example.com"
 *         opening_hours: ["Monday: 9:00 AM – 5:00 PM", "Tuesday: 9:00 AM – 5:00 PM"]
 *         google_maps_url: "https://maps.google.com/?q=35.3606,138.7274"
 */

/**
 * @swagger
 * /api/activity:
 *   post:
 *     summary: Create a new activity
 *     description: Creates a new activity and returns the created activity.
 *     tags: [Activity]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Activity'
 *     responses:
 *       201:
 *         description: Activity created successfully
 *       400:
 *         description: Invalid activity data
 *       500:
 *         description: Internal server error
 */
router.post("/", protect, createActivityController);

/**
 * @swagger
 * /api/activity/{id}:
 *   get:
 *     summary: Get an activity by ID
 *     description: Retrieves a single activity by its ID.
 *     tags: [Activity]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the activity
 *     responses:
 *       200:
 *         description: Activity retrieved successfully
 *       404:
 *         description: Activity not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", protect, getActivityByIdController);

/**
 * @swagger
 * /api/activity/itinerary/{itinerary_id}:
 *   get:
 *     summary: Get activities by itinerary ID
 *     description: Retrieves all activities associated with a specific itinerary.
 *     tags: [Activity]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itinerary_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the itinerary
 *     responses:
 *       200:
 *         description: List of activities retrieved successfully
 *       500:
 *         description: Internal server error
 */
router.get("/itinerary/:itinerary_id", protect, getActivitiesByItineraryIdController);

/**
 * @swagger
 * /api/activity/{id}:
 *   put:
 *     summary: Update an activity by ID
 *     description: Updates an activity based on the provided ID and data.
 *     tags: [Activity]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the activity to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Activity'
 *     responses:
 *       200:
 *         description: Activity updated successfully
 *       400:
 *         description: Invalid request data
 *       404:
 *         description: Activity not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id", protect, updateActivityController);

/**
 * @swagger
 * /api/activity/{id}:
 *   delete:
 *     summary: Delete an activity by ID
 *     description: Soft deletes an activity based on its ID.
 *     tags: [Activity]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the activity to delete
 *     responses:
 *       200:
 *         description: Activity deleted successfully
 *       404:
 *         description: Activity not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", protect, deleteActivityController);

export { router as default };
