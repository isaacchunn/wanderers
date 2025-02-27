import { db } from "../controllers/db";

export const updateProfileDescription = async (
  userId: number,
  profile_description: string
) => {
  await db.user.updateMany({
    where: {
      id: userId,
    },
    data: {
      profile_description,
    },
  });
};

export const updateProfileImagePath = async (
  userId: number,
  user_photo: string
) => {
  await db.user.updateMany({
    where: {
      id: userId,
    },
    data: {
      user_photo,
    },
  });
};
