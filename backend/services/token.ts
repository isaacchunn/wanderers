import { v4 as uuidv4 } from "uuid";
import { db } from "../controllers/db";

export const getConfirmAccountTokenByToken = async (token: string) => {
  try {
    const confirmAccountToken = await db.userToken.findFirst({
      where: { token: token, context: "email_confirmation" },
    });

    return confirmAccountToken;
  } catch {
    return null;
  }
};

export const getConfirmAccountTokenByEmail = async (email: string) => {
  try {
    const confirmAccountToken = await db.userToken.findFirst({
      where: { sent_to: email, context: "email_confirmation" },
    });

    return confirmAccountToken;
  } catch {
    return null;
  }
};

export const getPasswordResetTokenByToken = async (token: string) => {
  try {
    const passwordResetToken = await db.userToken.findFirst({
      where: { token: token, context: "reset_password" },
    });

    return passwordResetToken;
  } catch {
    return null;
  }
};

export const getPasswordResetokenByEmail = async (email: string) => {
  try {
    const passwordResetToken = await db.userToken.findFirst({
      where: { sent_to: email, context: "reset_password" },
    });

    return passwordResetToken;
  } catch {
    return null;
  }
};

export const generatePasswordResetToken = async (email: string) => {
  const token = uuidv4();

  const existingToken = await getPasswordResetokenByEmail(email);

  if (existingToken) {
    await db.userToken.delete({
      where: {
        id: existingToken.id,
        context: "reset_password",
      },
    });
  }

  const passwordResetToken = await db.userToken.create({
    data: {
      sent_to: email,
      token: token,
      context: "reset_password",
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  return passwordResetToken;
};

export const generateConfirmAccountToken = async (email: string) => {
  const token = uuidv4();

  const existingToken = await getConfirmAccountTokenByEmail(email);

  if (existingToken) {
    await db.userToken.delete({
      where: {
        id: existingToken.id,
      },
    });
  }

  const confirmAccountToken = await db.userToken.create({
    data: {
      sent_to: email,
      context: "email_confirmation",
      token,
      created_at: new Date(),
      updated_at: new Date(),
    },
  });

  return confirmAccountToken;
};

export const deleteToken = async (id: string) => {

  await db.userToken.delete({
    where: {
      id,
    },
  });
};
