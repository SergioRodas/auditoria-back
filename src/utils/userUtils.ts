import { Request } from "express";
import { authenticate } from "../auth/auth";
import { User } from "../interfaces/users/userInterface";

export const getUser = (req: Request): User | null => {
    const userToken = req.cookies?.userToken;
    if (userToken) {
        const user = authenticate(userToken);
        return user;
    }
    return null;
};
