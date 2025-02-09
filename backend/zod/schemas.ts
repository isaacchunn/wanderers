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
  expense: z.number(),
  split: z.enum(
    Object.values(ExpenseSplitType) as [
      ExpenseSplitType,
      ...ExpenseSplitType[],
    ],
  ),
  sequence: z.number(),
});
