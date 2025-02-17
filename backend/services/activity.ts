import { db } from "../controllers/db";
import { ExpenseSplitType } from "prisma/prisma-client";

export const createActivity = async (
  title: string,
  description: string,
  itinerary_id: number,
  lat: number,
  lon: number,
  expense: number,
  split: ExpenseSplitType,
  sequence: number,
  photo_url: string | null,
  start_date: Date,
  end_date: Date,
) => {
  let activity = await db.activity.create({
    data: {
      title,
      description,
      itinerary_id,
      lat,
      lon,
      expense,
      split,
      sequence,
      photo_url,
      start_date,
      end_date,
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
  lat: number,
  lon: number,
  expense: number,
  split: ExpenseSplitType,
  sequence: number,
  photo_url: string | null,
  start_date: Date,
  end_date: Date,
) => {
  let activity = await db.activity.update({
    where: {
      id,
    },
    data: {
      title,
      description,
      itinerary_id,
      lat,
      lon,
      expense,
      split,
      sequence,
      photo_url,
      start_date,
      end_date,
    },
  });
  return activity;
};

export const deleteActivity = async (id: number) => {
  let activity = await db.activity.update({
    where: {
      id,
    },
    data: {
      active: false,
    },
  });
  return activity;
};
