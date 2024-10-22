import dbConnection from "../../config/mysql";
import jwt from "jsonwebtoken";

import { RowDataPacket } from "mysql2";
import { User, DecodedToken } from "../../interfaces/users/userInterface";

import transporter from "../../config/email";

async function findUserByCredentials(
    username: string,
    password: string
): Promise<User | null> {
    try {
        const connection = await dbConnection();
        const [rows] = await connection.query<RowDataPacket[]>(
            "SELECT * FROM AUDITORIA_USUARIOS WHERE username = ? AND password = ?",
            [username, password]
        );

        if (!rows || !rows.length) {
            return null;
        }

        return mapRowToUser(rows[0]);
    } catch (error) {
        console.error("Error al ejecutar la consulta:", error);
        throw new Error("Ocurrió un error al intentar buscar al usuario");
    }
}

async function findUserByEmail(email: string): Promise<User | null> {
    try {
        const connection = await dbConnection();
        const [rows] = await connection.query<RowDataPacket[]>(
            "SELECT * FROM AUDITORIA_USUARIOS WHERE email = ?",
            [email]
        );

        if (!rows || !rows.length) {
            return null;
        }

        return mapRowToUser(rows[0]);
    } catch (error) {
        console.error("Error al ejecutar la consulta:", error);
        throw new Error("Ocurrió un error al intentar buscar al usuario");
    }
}

function mapRowToUser(row: RowDataPacket): User {
    if (!row.id || !row.email || !row.username) {
        throw new Error(
            "La fila de datos no contiene un ID, nombre de usuario o correo electrónico válidos."
        );
    }
    const user: User = {
        id: row.id || 0,
        email: row.email || "",
        username: row.username || "",
        rol: row.rol || "CLIENT",
        token: "",
    };

    const secret = process.env.SECRET;

    if (!secret) {
        throw new Error("Error: Configuración de secret no encontrada.");
    }

    user.token = jwt.sign(user, secret);

    return user;
}

async function sendPasswordResetEmail(recipientEmail: string, token: string) {
    const resetUrl = `https://www.ejemplo.com/reset/${token}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: recipientEmail,
        subject: "Recuperación de contraseña",
        html: `<p>Has solicitado restablecer tu contraseña. Haz clic <a href="${resetUrl}">aquí</a> para restablecer tu contraseña.</p>`,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Correo electrónico enviado:", info.response);
    } catch (error) {
        console.error("Error al enviar el correo electrónico:", error);
        throw error;
    }
}

async function generateResetToken(userId: string): Promise<{ token: string }> {
    const secret = process.env.SECRET;
    if (!secret) {
        throw new Error("Error: Configuración de secret no encontrada.");
    }
    const token = jwt.sign({ userId }, secret, { expiresIn: "1h" });

    return { token };
}

async function decodedToken(token: string): Promise<{ id: number }> {
    const secret = process.env.SECRET;
    if (!secret) {
        throw new Error("Error: Configuración de secret no encontrada.");
    }

    try {
        const decodedToken = jwt.verify(token, secret) as DecodedToken;
        const userId = decodedToken.userId;
        return { id: userId };
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            throw new Error("Error al decodificar el token: Token no válido");
        } else {
            throw new Error("Error al decodificar el token");
        }
    }
}

async function updatePassword(userId: number, newPassword: string): Promise<void> {
    try {
        const connection = await dbConnection();

        await connection.query(
            "UPDATE AUDITORIA_USUARIOS SET password = ? WHERE id = ?",
            [newPassword, userId]
        );
    } catch (error) {
        console.error("Error updating password:", error);
        throw new Error("Error updating password");
    }
}
async function registerLoginUser(id: number): Promise<void> {
    try {
        const connection = await dbConnection();

        const fecha = new Date();

        await connection.query(
            "INSERT INTO AUDITORIA_USUARIOS_LOGIN (id_usuario, fecha) VALUES (?, ?)",
            [id, fecha]
        );
    } catch (error) {
        console.error("Error al registrar el inicio de sesión:", error);
        throw new Error("Error al registrar el inicio de sesión");
    }
}

export default {
    findUserByCredentials,
    findUserByEmail,
    sendPasswordResetEmail,
    generateResetToken,
    decodedToken,
    updatePassword,
    registerLoginUser,
};
