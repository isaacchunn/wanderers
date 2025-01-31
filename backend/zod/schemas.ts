import * as z from "zod";

export const registerUserSchema = z.object({
  username: z.string(),
  email: z.string().email(),
  password: z.string().min(8),
});

export const loginUserschema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
