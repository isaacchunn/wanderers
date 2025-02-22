import { Request, Response } from "express";
import { registerUserSchema, loginUserschema } from "../zod/schemas";
import jwt from "jsonwebtoken";
import { HttpCode } from "../lib/httpCodes"
import { getUserById } from "../services/user";

// @desc    Get user by id
// @route   POST /api/user/:id
// @access  Private
export const getUserController = async (
    req: Request,
    res: Response,
) => {
    try {
        let user = await getUserById(parseInt(req.params.id));
        if (!user) {
            res.status(HttpCode.NotFound).json({ message: "User not found" });
        } else {
            res.status(HttpCode.OK).json(user);
        }
    } catch (error: any) {
        res.status(HttpCode.InternalServerError).json({ message: error.message || "Internal Server Error" });
    }
};