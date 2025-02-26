import { Request, Response } from "express";
import { registerUserSchema, loginUserschema } from "../zod/schemas";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { db } from "../controllers/db";
import { HttpCode } from "../lib/httpCodes"

import { createUser, getUserByEmail, updateUser, updateUserPassword } from "../services/user";
import { deliverConfirmationEmail, deliverForgotPasswordEmail, deliverPasswordResetSuccessfulEmail } from "../controllers/mail";
import {
  generateConfirmAccountToken,
  getConfirmAccountTokenByToken,
  generatePasswordResetToken,
  getPasswordResetTokenByToken,
  deleteToken
} from "../services/token";

const tokenExpirationPeriod = 60 * 60 * 1000 * 24; // 1 day

// -------------------------------------------------------------------
// @desc    Register new user
// @route   POST /api/auth
// @access  Public
export const registerUser = async (req: Request, res: Response) => {
  let responseCode = HttpCode.ResourceCreated;
  let responseBody: any = {};

  try {
    const validatedFields = registerUserSchema.safeParse(req.body);
    if (!validatedFields.success) {
      throw new Error(validatedFields.error.errors.map((err) => err.message).join(", "));
    }

    const { username, email, password } = validatedFields.data;
    const lowercaseEmail = email.toLowerCase();
    const confirmAccountToken = await generateConfirmAccountToken(lowercaseEmail);
    const hashedPassword = await bcrypt.hash(password, 10);
    const existingUser = await getUserByEmail(lowercaseEmail);

    if (existingUser && !existingUser.email_verified) {
      await deliverConfirmationEmail(
        confirmAccountToken.sent_to,
        username,
        confirmAccountToken.token,
      );
      throw new Error("Account has not been verified! A new confirmation email has been sent!");
    } else if (existingUser && existingUser.email_verified) {
      throw new Error("Email already in use!");
    } else {
      await createUser(username, lowercaseEmail, hashedPassword);
      await deliverConfirmationEmail(
        confirmAccountToken.sent_to,
        username,
        confirmAccountToken.token,
      );
      responseBody = { message: "Confirmation email sent!" };
    }
  } catch (error: any) {
    responseCode = HttpCode.BadRequest;
    responseBody = { message: error.message };
  }

  res.status(responseCode).json(responseBody);
};

// -------------------------------------------------------------------
// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req: Request, res: Response) => {
  let responseCode = HttpCode.OK;
  let responseBody: any = {};

  try {
    const validatedFields = loginUserschema.safeParse(req.body);
    if (!validatedFields.success) {
      throw new Error(validatedFields.error.errors.map((err) => err.message).join(", "));
    }

    const { email, password } = validatedFields.data;
    const lowercaseEmail = email.toLowerCase();
    const userFromDB = await getUserByEmail(lowercaseEmail);

    if (!userFromDB) {
      throw new Error("Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, userFromDB.password);
    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    if (!userFromDB.email_verified) {
      const confirmAccountToken = await generateConfirmAccountToken(lowercaseEmail);
      await deliverConfirmationEmail(
        confirmAccountToken.sent_to,
        userFromDB.username,
        confirmAccountToken.token,
      );
      throw new Error("Account has not been verified! A new confirmation email has been sent!");
    }

    const token = jwt.sign(
      { id: userFromDB.id },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" },
    );
    responseBody = {
      token,
      user: {
        id: userFromDB.id,
        username: userFromDB.username,
        email: userFromDB.email,
        email_verified: userFromDB.email_verified,
      },
    };
  } catch (error: any) {
    responseCode = HttpCode.BadRequest;
    responseBody = { message: error.message };
  }

  res.status(responseCode).json(responseBody);
};

// -------------------------------------------------------------------
// @desc    Confirm user account
// @route   GET /api/auth/confirm-account/:token
// @access  Public
export const confirmAccount = async (req: Request, res: Response) => {
  let responseCode = HttpCode.OK;
  let responseBody: any = {};

  try {
    const token = req.params.token;
    const existingToken = await getConfirmAccountTokenByToken(token);

    if (!existingToken) {
      throw new Error("Invalid token");
    }

    const hasExpired =
      new Date(existingToken.created_at).getTime() + tokenExpirationPeriod < Date.now();
    if (hasExpired) {
      throw new Error("Token has expired");
    }

    const existingUser = await getUserByEmail(existingToken.sent_to);
    if (!existingUser) {
      throw new Error("User does not exist");
    }

    await db.user.update({
      where: { id: existingUser.id },
      data: {
        email_verified: new Date(),
        role: "L1",
      },
    });

    await updateUser(existingUser.id, { email_verified: new Date(), role: "L1" });

    await deleteToken(existingToken.id);

    responseBody = { message: "Account confirmed" };
  } catch (error: any) {
    responseCode = HttpCode.BadRequest;
    responseBody = { message: error.message };
  }

  res.status(responseCode).json(responseBody);
};

// @desc    Reset user password through email
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req: Request, res: Response) => {
  let responseCode = HttpCode.OK;
  let responseBody: any = {};
  try {
    const token = req.params.token;
    const existingToken = await getPasswordResetTokenByToken(token);

    if (!existingToken) {
      throw new Error("Invalid token");
    }

    const hasExpired =
      new Date(existingToken.created_at).getTime() + tokenExpirationPeriod < Date.now();
    if (hasExpired) {
      throw new Error("Token has expired");
    }

    const { password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await getUserByEmail(existingToken.sent_to);

    if (!user) {
      throw new Error("User does not exist");
    }

    await updateUserPassword(user.id, hashedPassword);

    await deleteToken(existingToken.id);

    await deliverPasswordResetSuccessfulEmail(user.email, user.username);

    responseBody = { message: "Password updated" };
  }
  catch (error: any) {
    responseCode = HttpCode.BadRequest;
    responseBody = { message: error.message };
  }
  res.status(responseCode).json(responseBody);

};


// @desc    Sends account confirmation email to active/confirm user account if not verified
// @route   POST /api/auth/request-confirmation
// @access  Public
export const requestConfirmationEmail = async (req: Request, res: Response) => {
  let responseCode = HttpCode.OK;
  let responseBody: any = {};

  try {
    const { email } = req.body;
    const lowercaseEmail = email.toLowerCase();
    const user = await getUserByEmail(lowercaseEmail);

    if (!user) {
      throw new Error("User does not exist");
    }

    if (user.email_verified) {
      throw new Error("Account already verified");
    }

    const confirmAccountToken = await generateConfirmAccountToken(lowercaseEmail);
    await deliverConfirmationEmail(
      confirmAccountToken.sent_to,
      user.username,
      confirmAccountToken.token,
    );
    responseBody = { message: "Confirmation email sent" };
  } catch (error: any) {
    responseCode = HttpCode.BadRequest;
    responseBody = { message: error.message };
  }
  res.status(responseCode).json(responseBody);
};

// -------------------------------------------------------------------
// @desc    Sends forget password email to user
// @route   POST /api/auth/forget-password
// @access  Public
export const requestForgetPasswordEmail = async (req: Request, res: Response) => {
  let responseCode = HttpCode.OK;
  let responseBody: any = {};

  try {
    const { email } = req.body;
    const lowercaseEmail = email.toLowerCase();
    const user = await getUserByEmail(lowercaseEmail);

    if (!user) {
      throw new Error("User does not exist");
    }

    const passwordResetToken = await generatePasswordResetToken(lowercaseEmail);
    await deliverForgotPasswordEmail(
      passwordResetToken.sent_to,
      user.username,
      passwordResetToken.token,
    );
    responseBody = { message: "Forget password email sent" };
  } catch (error: any) {
    responseCode = HttpCode.BadRequest;
    responseBody = { message: error.message };
  }
  res.status(responseCode).json(responseBody);
};
