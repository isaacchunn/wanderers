import { db } from "../controllers/db";
import { ExpenseSplitType } from "prisma/prisma-client";

export interface ActivityData {
  title: string;
  description: string | null;
  itinerary_id: number;
  lat: number;
  lon: number;
  expense: number;
  split: ExpenseSplitType;
  sequence: number;
  photo_url?: string | null;
  start_date: Date;
  end_date: Date;
  place_id?: string | null;
  formatted_address?: string | null;
  types?: string[];
  rating?: number | null;
  user_ratings_total?: number | null;
  international_phone_number?: string | null;
  website?: string | null;
  opening_hours?: string[];
  google_maps_url?: string | null;
}

export const createActivity = async (activityData: ActivityData) => {
  let activity = await db.activity.create({
    data: {
      ...activityData,
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
      active: true,
    },
  });
  return activities;
};

export const updateActivity = async (activityId: number, activityData: ActivityData) => {
  let activity = await db.activity.update({
    where: {
      id: activityId,
    },
    data: {
      ...activityData
    },
  });
  return activity;
};

export const updateActivitySequence = async (activityId: number, sequence: number) => {
  let activity = await db.activity.update({
    where: {
      id: activityId,
    },
    data: {
      sequence,
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
