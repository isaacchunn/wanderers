import { db } from "../controllers/db";
import { UserRole } from "prisma/prisma-client";

interface UpdateUserInterface {
  username?: string;
  email?: string;
  role?: UserRole;
  media?: string;
  email_verified?: Date;
}

// create user
export const createUser = async (
  username: string,
  email: string,
  hashedPassword: string,
) => {
  const lowercaseEmail = email.toLowerCase();

  let user = await db.user.create({
    data: {
      username,
      email: lowercaseEmail,
      password: hashedPassword,
      media: "",
      role: UserRole.UV,
      created_at: new Date(),
    },
  });
  return user;
};

// find user by email
export const getUserByEmail = async (email: string) => {
  const lowercaseEmail = email.toLowerCase();
  let user = await db.user.findFirst({
    where: {
      email: lowercaseEmail,
    },
  });
  return user;
};

// find user by id
export const getUserById = async (id: number) => {
  let user = await db.user.findUnique({
    where: {
      id: id,
    },
  });
  return user;
};

// find user by username
export const getUserByUsername = async (username: string) => {
  let user = await db.user.findFirst({
    where: {
      username: username,
    },
  });
  return user;
};

// update user
export const updateUser = async (id: number, data: UpdateUserInterface) => {
  let user = await db.user.update({
    where: {
      id,
    },
    data,
  });
  return user;
}

// update user password
export const updateUserPassword = async (id: number, hashedPassword: string) => {
  let user = await db.user.update({
    where: {
      id,
    },
    data: {
      password: hashedPassword,
    },
  });
  return user;
};
