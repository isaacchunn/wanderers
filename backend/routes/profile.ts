import express from "express";

import {
  deleteProfilePictureApi,
  updateProfileDescriptionApi,
  uploadProfilePictureApi,
} from "../controllers/profile";
import { protect } from "../middleware/auth";
import { upload_file_single } from "../middleware/single_upload_file";

const router = express.Router();

/**
 * @swagger
 * /api/profile/description:
 *   put:
 *     summary: Update user description
 *     description: Updates the profile description of the authenticated user.
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Profile
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profile_description:
 *                 type: string
 *                 description: The new profile description.
 *     responses:
 *       200:
 *         description: Profile updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Profile Updated"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error"
 */
router.route("/description").put(protect, updateProfileDescriptionApi);

/**
 * @swagger
 * /api/profile/picture:
 *   put:
 *     summary: Upload a profile image
 *     description: Uploads an image file to Supabase Storage and returns the file URL.
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Profile
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: file
 *                 format: binary
 *                 description: The image file to upload (JPEG, PNG, WEBP).
 *     responses:
 *       200:
 *         description: Successfully uploaded image.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 imageUrl:
 *                   type: string
 *                   example: "https://your-supabase-url.supabase.co/storage/v1/object/public/your-bucket-name/profile_pictures/user123_1710000000000.png"
 *       400:
 *         description: Bad request, validation error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid file format. Only JPEG, PNG, and WEBP allowed."
 *       401:
 *         description: Unauthorized, user not authenticated.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal Server Error"
 */

router
  .route("/picture")
  .put(protect, upload_file_single, uploadProfilePictureApi);

router.route("/picture").delete(protect, deleteProfilePictureApi);

export { router as default };
