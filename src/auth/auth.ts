import jwt from "jsonwebtoken";
require("dotenv").config();
import { AuthenticationError } from "apollo-server";
import { User } from "../interfaces/users/userInterface";

export function authenticate(token: string) {
    if (!token) {
        throw new AuthenticationError("No estás autenticado.");
    }
    try {
        const secret = process.env.SECRET;
        if (!secret) {
            throw new Error("Error: Configuración de secret no encontrada.");
        }
        const user = jwt.verify(token, secret);
        return user as User;
    } catch (error) {
        throw new AuthenticationError("Token de autorización inválido");
    }
}
