import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "./.env") });

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
