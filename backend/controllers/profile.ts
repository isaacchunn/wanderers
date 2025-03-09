import { Request, Response } from "express";
import { updateProfileDescriptionSchema } from "../zod/schemas";
import { HttpCode } from "../lib/httpCodes";
import {
  updateProfileDescription,
  updateProfileImagePath,
} from "../services/profile";
import { deleteS3ProfileImage, uploadS3ProfileImage } from "../services/image";

interface AuthenticatedRequest extends Request {
  user?: { id: number };
}
// @desc    Update user description
// @route   PUT /api/profile/description
// @access  Protected
export const updateProfileDescriptionApi = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user!.id;

    const parsed = updateProfileDescriptionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(HttpCode.BadRequest).json({
        message: parsed.error.errors
          .map((err) => `${err.path.join(".")}: ${err.message}`)
          .join(", "),
      });
    } else {
      const { profile_description } = parsed.data;
      await updateProfileDescription(userId, profile_description ?? "");

      res.status(HttpCode.OK).json({ message: "Profile Updated" });
    }
  } catch (error: any) {
    res
      .status(HttpCode.InternalServerError)
      .json({ message: error.message || "Internal Server Error" });
  }
};

// @desc    Upload user picture
// @route   PUT /api/profile/picture
// @access  Protected
export const uploadProfilePictureApi = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user!.id;

    if (!req.file) {
      res.status(HttpCode.BadRequest).json({ message: "No file uploaded" });
    } else {

      const partial_image_path = await uploadS3ProfileImage(userId, req.file);

      if (partial_image_path) {
        const full_image_path = process.env.S3_IMAGE_GET_ENDPOINT + "/" + partial_image_path;
        await updateProfileImagePath(userId, full_image_path);
        res.status(HttpCode.OK).json({ full_image_path });
      } else {
        throw Error("There was an error when uploading the file");
      }
    }
  } catch (error: any) {
    res
      .status(HttpCode.InternalServerError)
      .json({ message: error.message || "Internal Server Error" });
  }
};

// @desc    Deletes user picture
// @route   DELETE /api/profile/picture
// @access  Protected
export const deleteProfilePictureApi = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user!.id;

    await deleteS3ProfileImage(userId.toString());

    await updateProfileImagePath(userId, "");

    res.status(HttpCode.OK).json({ message: "Profile picture deleted" });

  } catch (error: any) {
    res
      .status(HttpCode.InternalServerError)
      .json({ message: error.message || "Internal Server Error" });
  }
};
