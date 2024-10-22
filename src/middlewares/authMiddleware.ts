import { Request, Response, NextFunction } from "express";
import { authenticate } from "../auth/auth";
require("dotenv").config();

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const userToken = req.cookies?.userToken;

    if (!userToken) {
        return res.redirect("/login");
    }

    try {
        const userDecoded = authenticate(userToken as string);
        if (userDecoded) next();
    } catch (err) {
        console.error("Error al verificar el token JWT:", err);
        return res.redirect("/login");
    }
};

export const redirectToHomeIfAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    const userToken = req.cookies?.userToken;
    if (userToken) {
        try {
            const userDecoded = authenticate(userToken as string);
            if (userDecoded) return res.redirect("/");
        } catch (err) {
            console.error("Error al verificar el token JWT:", err);
        }
    }
    next();
};
