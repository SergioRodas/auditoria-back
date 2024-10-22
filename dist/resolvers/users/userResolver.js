"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
process.setMaxListeners(20);
const userInterface_1 = require("../../interfaces/users/userInterface");
const userService_1 = __importDefault(require("../../services/users/userService"));
const loginResolver = {
    Query: {
        login: (_, args) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const { username, password } = args;
                const user = yield userService_1.default.findUserByCredentials(username, password);
                if (!user) {
                    throw new userInterface_1.UserNotFoundError("[controlled] Usuario no encontrado. Por favor, asegúrate de que el nombre de usuario y la contraseña sean correctos.");
                }
                const id = user.id;
                yield userService_1.default.registerLoginUser(id);
                return user;
            }
            catch (error) {
                if (error instanceof userInterface_1.UserNotFoundError) {
                    throw error;
                }
                throw new Error("[controlled] Ocurrió un error al iniciar sesión. Por favor, inténtalo de nuevo más tarde.");
            }
        }),
    },
    Mutation: {
        requestPasswordReset: (_1, _a) => __awaiter(void 0, [_1, _a], void 0, function* (_, { email }) {
            try {
                const user = yield userService_1.default.findUserByEmail(email);
                if (!user) {
                    return {
                        message: "No se encontró ningún usuario con el correo electrónico proporcionado. Por favor, asegúrate de que la dirección de correo electrónico sea correcta.",
                        success: false,
                    };
                }
                const { token } = yield userService_1.default.generateResetToken(user.id.toString());
                yield userService_1.default.sendPasswordResetEmail(email, token);
                return {
                    success: true,
                    message: "Se ha enviado un correo electrónico de restablecimiento de contraseña. Por favor, revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.",
                };
            }
            catch (error) {
                throw new Error("Ocurrió un error al solicitar el restablecimiento de la contraseña. Por favor, inténtalo de nuevo más tarde.");
            }
        }),
        resetPassword: (_, args) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const { token, newPassword } = args;
                const userId = yield userService_1.default.decodedToken(token);
                const id = userId.id;
                yield userService_1.default.updatePassword(id, newPassword);
                return {
                    success: true,
                    message: "La contraseña se actualizó correctamente.",
                };
            }
            catch (error) {
                throw new Error(`Error al restablecer la contraseña: ${error.message}`);
            }
        }),
    },
};
exports.default = loginResolver;
