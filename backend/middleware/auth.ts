import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { db } from "../controllers/db";
import { HttpCode } from "../lib/httpCodes";

interface AuthRequest extends Request {
    user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    let responseCode = HttpCode.Unauthorized;
    let responseBody: any;

    try {
        let token: string | undefined;

        if (!process.env.JWT_SECRET) {
            responseCode = HttpCode.InternalServerError;
            throw new Error("JWT_SECRET is not defined");
        }

        if (req.cookies?.token) {
            token = req.cookies.token;
        } else if (req.headers.authorization?.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            throw new Error("No token provided");
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET) as jwt.JwtPayload;
        const user = await db.user.findFirst({ where: { id: decoded.id } });

        if (!user) {
            throw new Error("User not found");
        }

        req.user = user;
        return next(); // Call next() only once on success
    } catch (error: any) {
        responseBody = { message: error.message || "Not authorized" };
    }

    res.status(responseCode).json(responseBody);
};
