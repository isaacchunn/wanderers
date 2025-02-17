import * as z from "zod";
import { ExpenseSplitType } from "@prisma/client";

export const registerUserSchema = z.object({
  username: z.string(),
  email: z.string().email(),
  password: z.string().min(8),
});

export const loginUserschema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const activitySchema = z.object({
  title: z.string(),
  description: z.string(),
  itinerary_id: z.number(),
  lat: z.number(),
  lon: z.number(),
  expense: z.number(),
  split: z.enum(
    Object.values(ExpenseSplitType) as [
      ExpenseSplitType,
      ...ExpenseSplitType[],
    ],
  ),
  sequence: z.number(),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  photo_url: z.string().url().optional(),
});

export const createItinerarySchema = z.object({
  title: z.string(),
  location: z.string(),
  visibility: z.enum(["public", "private"]),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  collaborators: z.array(z.string()).optional(),
});

export const updateItinerarySchema = z.object({
  title: z.string(),
  location: z.string(),
  visibility: z.enum(["public", "private"]),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  photo_url: z.string().url().optional(),
});
