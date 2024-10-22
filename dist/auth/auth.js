"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require("dotenv").config();
const apollo_server_1 = require("apollo-server");
function authenticate(token) {
    if (!token) {
        throw new apollo_server_1.AuthenticationError("No estás autenticado.");
    }
    try {
        const secret = process.env.SECRET;
        if (!secret) {
            throw new Error("Error: Configuración de secret no encontrada.");
        }
        const user = jsonwebtoken_1.default.verify(token, secret);
        return user;
    }
    catch (error) {
        throw new apollo_server_1.AuthenticationError("Token de autorización inválido");
    }
}
exports.authenticate = authenticate;
