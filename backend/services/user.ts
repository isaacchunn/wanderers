import { db } from '../controllers/db';
import bcrypt from "bcryptjs";
import { UserRole } from 'prisma/prisma-client';

// create user
export const createUser = async (username: string, email: string, password: string) => {
    const lowercaseEmail = email.toLowerCase();
    const hashedPassword = await bcrypt.hash(password, 10);

    let user = await db.user.create({
        data: {
            username,
            email: lowercaseEmail,
            password: hashedPassword,
            media: '', 
            role: UserRole.UV, 
            created_at: new Date(),
          },
    });
    return user;
}

// find user by email
export const getUserByEmail = async (email: string) => {
    const lowercaseEmail = email.toLowerCase();
    let user = await db.user.findFirst({
        where: {
            email: lowercaseEmail
        }
    });
    return user;
}

// find user by id
export const getUserById = async (id: number) => {
    let user = await db.user.findUnique({
        where: {
            id: id
        }
    });
    return user;
}

// find user by username
export const getUserByUsername = async (username: string) => {
    let user = await db.user.findFirst({
        where: {
            username: username
        }
    });
    return user;
}