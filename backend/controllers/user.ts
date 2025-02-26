import { Request, Response } from "express";
import { HttpCode } from "../lib/httpCodes";
import { getUserById, getUserByEmail } from "../services/user";

// @desc    Get user by id
// @route   POST /api/user/:id
// @access  Private
export const getUserController = async (req: Request, res: Response) => {
  try {
    let user = await getUserById(parseInt(req.params.id));
    if (!user) {
      res.status(HttpCode.NotFound).json({ message: "User not found" });
    } else {
      res.status(HttpCode.OK).json(user);
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
