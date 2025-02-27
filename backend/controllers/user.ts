import { Request, Response } from "express";
import { HttpCode } from "../lib/httpCodes";
import { getUserById, getUserByEmail } from "../services/user";

interface AuthenticatedRequest extends Request {
  user?: { id: number };
}


// @desc    Get user by id
// @route   POST /api/user
// @access  Private
export const getUserController = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // decrypt the token and get the user id
    if (!req.user?.id) {
      res.status(HttpCode.BadRequest).json({ message: "User ID is required" });
    }

    if (!req.user) {
      res.status(HttpCode.NotFound).json({ message: "User not found" });
    } else {
      res.status(HttpCode.OK).json(req.user);
    }
  } catch (error: any) {
    res
      .status(HttpCode.InternalServerError)
      .json({ message: error.message || "Internal Server Error" });
  }
};

// @desc    Get user by email
// @route   POST /api/user/email/:email
// @access  Private
export const getUserByEmailController = async (req: Request, res: Response) => {
  try {
    let user = await getUserByEmail(req.params.email);
    if (!user) {
      res.status(HttpCode.NotFound).json({ message: "User not found" });
    } else {
      res.status(HttpCode.OK).json({
        id: user.id,
        username: user.username,
        email: user.email,
        user_photo: user.user_photo,
      });
    }
  } catch (error: any) {
    res
      .status(HttpCode.InternalServerError)
      .json({ message: error.message || "Internal Server Error" });
  }
};
