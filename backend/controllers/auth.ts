import { Request, Response } from "express";
import { registerUserSchema, loginUserschema } from "../zod/schemas";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { db } from "../controllers/db";

import { createUser, getUserByEmail } from "../services/user";
import { deliverConfirmationEmail } from "../controllers/mail";
import {
  generateConfirmAccountToken,
  getConfirmAccountTokenByToken,
} from "../services/token";

const tokenExpirationPeriod = 60 * 60 * 1000 * 24; // 1 day

// @desc    Register new user
// @route   POST /api/auth
// @access  Public
export const registerUser = async (req: Request, res: Response) => {
  let errorFlag = false;
  let errorMessage = "";

  try {
    const validatedFields = registerUserSchema.safeParse(req.body);

    if (!validatedFields.success) {
      errorFlag = true;
      errorMessage = validatedFields.error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join(", ");
    } else {
      const { username, email, password } = validatedFields.data;
      const lowercaseEmail = email.toLowerCase();
      const confirmAccountToken =
        await generateConfirmAccountToken(lowercaseEmail);
      const hashedPassword = await bcrypt.hash(password, 10);
      const existingUser = await getUserByEmail(lowercaseEmail);

      if (existingUser && !existingUser.email_verified) {
        await deliverConfirmationEmail(
          confirmAccountToken.sent_to,
          username,
          confirmAccountToken.token,
        );
        errorFlag = true;
        errorMessage =
          "Account has not been verified! A new confirmation email has been sent!";
      } else if (existingUser && existingUser.email_verified) {
        errorFlag = true;
        errorMessage = "Email already in use!";
      } else {
        await createUser(username, lowercaseEmail, hashedPassword);
        await deliverConfirmationEmail(
          confirmAccountToken.sent_to,
          username,
          confirmAccountToken.token,
        );
      }
    }
  } catch (error: any) {
    errorFlag = true;
    errorMessage = error.message;
  }

  if (errorFlag) {
    res.status(400).json({
      message: errorMessage,
    });
  }

  res.status(201).json({
    message: "Confirmation email sent!",
  });
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req: Request, res: Response) => {
  let errorFlag = true;
  let errorMessage = "";
  let token: string | undefined = "";
  let user: any = {};

  try {
    const validatedFields = loginUserschema.safeParse(req.body);

    if (!validatedFields.success) {
      errorMessage = validatedFields.error.message;
    } else {
      const { email, password } = validatedFields.data;
      const lowercaseEmail = email.toLowerCase();
      const userFromDB = await getUserByEmail(lowercaseEmail);

      if (userFromDB) {
        const isMatch = await bcrypt.compare(password, userFromDB.password);

        if (!isMatch) {
          errorMessage = "Invalid credentials";
        } else if (!userFromDB.email_verified) {
          const confirmAccountToken =
            await generateConfirmAccountToken(lowercaseEmail);

          await deliverConfirmationEmail(
            confirmAccountToken.sent_to,
            userFromDB.username,
            confirmAccountToken.token,
          );
          errorFlag = true;
          errorMessage =
            "Account has not been verified! A new confirmation email has been sent!";
        } else {
          token = jwt.sign(
            { id: userFromDB.id },
            process.env.JWT_SECRET as string,
            {
              expiresIn: "7d",
            },
          );
          user = {
            id: userFromDB.id,
            username: userFromDB.username,
            email: userFromDB.email,
            email_verified: userFromDB.email_verified,
          };
        }
      } else {
        errorMessage = "Invalid credentials";
      }
    }
  } catch (error: any) {
    errorMessage = error.message;
  }

  if (errorFlag) {
    console.log("hi1");
    res.status(400).json({
      message: errorMessage,
    });
  }

  console.log("hi2");
  res.status(200).json({
    token,
    user,
  });
};

// @desc    Confirm user account
// @route   GET /api/auth/confirm-account/:token
// @access  Public
export const confirmAccount = async (req: Request, res: Response) => {
  let errorFlag = false;
  let errorMessage = "";

  try {
    const token = req.params.token;
    const existingToken = await getConfirmAccountTokenByToken(token);

    if (!existingToken) {
      errorFlag = true;
      errorMessage = "Invalid token";
    } else {
      const hasExpired =
        new Date(existingToken.created_at).getTime() + tokenExpirationPeriod <
        Date.now();

      if (hasExpired) {
        errorFlag = true;
        errorMessage = "Token has expired";
      } else {
        const existingUser = await getUserByEmail(existingToken.sent_to);

        if (!existingUser) {
          errorFlag = true;
          errorMessage = "User does not exist";
        } else {
          await db.user.update({
            where: { id: existingUser.id },
            data: {
              email_verified: new Date(),
              role: "L1",
            },
          });

          await db.userToken.delete({
            where: { id: existingToken.id },
          });
        }
      }
    }
  } catch (error: any) {
    errorFlag = true;
    errorMessage = error.message;
  }

  if (errorFlag) {
    res.status(400).json({
      message: errorMessage,
    });
  }

  res.status(200).json({
    message: "Account confirmed",
  });
};

// // @desc    Update user password
// // @route   POST /api/auth/update-password/:token
// // @access  Public
// const updatePassword = async (req: Request, res: Response) => {
//     try {
//         await authService.updatePassword(req.params.token, req.body.password);
//         res.status(200).json({message: "Password updated"})
//     } catch(error: any) {
//         res.status(400).json({message: error.message})
//     }
// }

// // @desc    Sends account confirmation email to active/confirm user account
// // @route   POST /api/auth/request-confirmation
// // @access  Public
// const requestConfirmationEmail = async (req: Request, res: Response) => {
//     try {
//         await authService.requestConfirmationEmail(req.body);
//         res.status(200).json({ message: "Confirmation email sent" });
//     } catch (error: any) {
//         res.status(400).json({ message: error.message });
//     }
// };

// // @desc    Sends forget password email to user
// // @route   POST /api/auth/forget-password
// // @access  Public
// const requestForgetPasswordEmail = async (req: Request, res: Response) => {
//     try {
//         await authService.requestForgetPasswordEmail(req.body);
//         res.status(200).json({ message: "Forget password email sent" });
//     } catch (error: any) {
//         res.status(400).json({ message: error.message });
//     }
// };

interface Payload {
  id: string | number;
  role: string;
  admin: boolean;
}

// Generate JWT
const generateJWTToken = (id: string, role: number, admin: number) => {
  const payload = {
    id: id,
    role: role,
    admin: admin,
  };
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });
};

// // Send confirmation email
// const sendConfirmationEmail = async (email) => {
//     let user = await db.User.findOne({where: {email: email}});
//     if (user && user.confirmed_at == null) {
//         const emailToken = await UserToken.create({
//             user_id: user.id,
//             context: "email_confirmation",
//             token: await generateEmailToken(),
//             sent_to: email
//         });
//         deliverConfirmationEmail(email, user.username, emailToken.token);
//     }
// }

// // Send forget password email
// const sendForgetPasswordEmail = async (email) => {
//     let user = await db.User.findOne({where: {email: email}});
//     if (user) {
//         const emailToken = await UserToken.create({
//             user_id: user.id,
//             context: "reset_password",
//             token: await generateEmailToken(),
//             sent_to: email
//         });
//         deliverPasswordEmail(email, user.username, emailToken.token);
//     }
// }
