process.setMaxListeners(20);

import { User, LoginArgs, ResetPasswordArgs, UserNotFoundError } from "../../interfaces/users/userInterface";

import userService from "../../services/users/userService";
const loginResolver = {
    Query: {
        login: async (_: any, args: LoginArgs): Promise<User | null> => {
            try {
                const { username, password } = args;
                const user = await userService.findUserByCredentials(
                    username,
                    password
                );

                if (!user) {
                    throw new UserNotFoundError(
                        "[controlled] Usuario no encontrado. Por favor, asegúrate de que el nombre de usuario y la contraseña sean correctos."
                    );
                }
                const id = user.id;
                await userService.registerLoginUser(id);

                return user;
            } catch (error) {
                if (error instanceof UserNotFoundError) {
                    throw error;
                }
                throw new Error(
                    "[controlled] Ocurrió un error al iniciar sesión. Por favor, inténtalo de nuevo más tarde."
                );
            }
        },
    },
    Mutation: {
        requestPasswordReset: async (_: any, { email }: { email: string }) => {
            try {
                const user = await userService.findUserByEmail(email);

                if (!user) {
                    return {
                        message:
                            "No se encontró ningún usuario con el correo electrónico proporcionado. Por favor, asegúrate de que la dirección de correo electrónico sea correcta.",
                        success: false,
                    };
                }

                const { token } = await userService.generateResetToken(
                    user.id.toString()
                );

                await userService.sendPasswordResetEmail(email, token);

                return {
                    success: true,
                    message:
                        "Se ha enviado un correo electrónico de restablecimiento de contraseña. Por favor, revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.",
                };
            } catch (error) {
                throw new Error(
                    "Ocurrió un error al solicitar el restablecimiento de la contraseña. Por favor, inténtalo de nuevo más tarde."
                );
            }
        },
        resetPassword: async (_: any, args: ResetPasswordArgs) => {
            try {
                const { token, newPassword } = args;

                const userId = await userService.decodedToken(token);
                const id = userId.id;

                await userService.updatePassword(id, newPassword);

                return {
                    success: true,
                    message: "La contraseña se actualizó correctamente.",
                };
            } catch (error: any) {
                throw new Error(
                    `Error al restablecer la contraseña: ${error.message}`
                );
            }
        },
    },
};

export default loginResolver;
