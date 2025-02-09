import express from "express";

import {
  createActivityController,
  getActivityByIdController,
  getActivitiesByItineraryIdController,
  updateActivityController,
  deleteActivityController,
} from "../controllers/activity";

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
 *         - description
 *         - itinerary_id
 *         - lat
 *         - lon
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
 *         start_date:
 *           type: string
 *           format: date
 *           description: The start date of the activity
 *         end_date:
 *           type: string
 *           format: date
 *           description: The end date of the activity
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
 *         start_date: 2025-12-21T00:00:00.000Z
 *         end_date: 2025-12-21T00:00:00.000Z
 */

/**
 * @swagger
 * /api/activity:
 *   post:
 *     summary: Create a new activity
 *     description: Creates a new activity and returns the created activity.
 *     tags: [Activity]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Activity'
 *     responses:
 *       201:
 *         description: Activity created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Activity'
 *       400:
 *         description: Invalid activity data
 *       500:
 *         description: Internal server error
 */
router.post("/", createActivityController);

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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Activity'
 *       404:
 *         description: Activity not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", getActivityByIdController);

/**
 * @swagger
 * /api/activity/itinerary/{itinerary_id}:
 *   get:
 *     summary: Get activities by itinerary ID
 *     description: Retrieves all activities associated with a specific itinerary.
 *     tags: [Activity]
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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Activity'
 *       500:
 *         description: Internal server error
 */
router.get("/itinerary/:itinerary_id", getActivitiesByItineraryIdController);

/**
 * @swagger
 * /api/activity/{id}:
 *   put:
 *     summary: Update an activity by ID
 *     description: Updates an activity based on the provided ID and data.
 *     tags: [Activity]
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Activity'
 *       400:
 *         description: Invalid request data
 *       404:
 *         description: Activity not found
 *       500:
 *         description: Internal server error
 */
router.put("/:id", updateActivityController);

/**
 * @swagger
 * /api/activity/{id}:
 *   delete:
 *     summary: Delete an activity by ID
 *     description: Soft deletes an activity based on its ID.
 *     tags: [Activity]
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
router.delete("/:id", deleteActivityController);

export { router as default };
