import { db } from "../controllers/db";
import { ExpenseSplitType } from "prisma/prisma-client";

export const createActivity = async (
  title: string,
  description: string,
  itinerary_id: number,
  expense: number,
  split: ExpenseSplitType,
  sequence: number,
) => {
  let activity = await db.activity.create({
    data: {
      title,
      description,
      itinerary_id,
      expense,
      split,
      sequence,
    },
  });
  return activity;
};

export const getActivityById = async (id: number) => {
  let activity = await db.activity.findUnique({
    where: {
      id,
    },
  });
  return activity;
};

export const getActivitiesByItineraryId = async (itinerary_id: number) => {
  let activities = await db.activity.findMany({
    where: {
      itinerary_id,
    },
  });
  return activities;
};

export const updateActivity = async (
  id: number,
  title: string,
  description: string,
  itinerary_id: number,
  expense: number,
  split: ExpenseSplitType,
  sequence: number,
) => {
  let activity = await db.activity.update({
    where: {
      id,
    },
    data: {
      title,
      description,
      itinerary_id,
      expense,
      split,
      sequence,
    },
  });
  return activity;
};

export const deleteActivity = async (id: number) => {
  let activity = await db.activity.delete({
    where: {
      id,
    }
  });
  return activity;
};
