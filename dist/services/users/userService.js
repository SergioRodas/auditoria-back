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
const mysql_1 = __importDefault(require("../../config/mysql"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const email_1 = __importDefault(require("../../config/email"));
function findUserByCredentials(username, password) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const connection = yield (0, mysql_1.default)();
            const [rows] = yield connection.query("SELECT * FROM AUDITORIA_USUARIOS WHERE username = ? AND password = ?", [username, password]);
            if (!rows || !rows.length) {
                return null;
            }
            return mapRowToUser(rows[0]);
        }
        catch (error) {
            console.error("Error al ejecutar la consulta:", error);
            throw new Error("Ocurrió un error al intentar buscar al usuario");
        }
    });
}
function findUserByEmail(email) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const connection = yield (0, mysql_1.default)();
            const [rows] = yield connection.query("SELECT * FROM AUDITORIA_USUARIOS WHERE email = ?", [email]);
            if (!rows || !rows.length) {
                return null;
            }
            return mapRowToUser(rows[0]);
        }
        catch (error) {
            console.error("Error al ejecutar la consulta:", error);
            throw new Error("Ocurrió un error al intentar buscar al usuario");
        }
    });
}
function mapRowToUser(row) {
    if (!row.id || !row.email || !row.username) {
        throw new Error("La fila de datos no contiene un ID, nombre de usuario o correo electrónico válidos.");
    }
    const user = {
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
    user.token = jsonwebtoken_1.default.sign(user, secret);
    return user;
}
function sendPasswordResetEmail(recipientEmail, token) {
    return __awaiter(this, void 0, void 0, function* () {
        const resetUrl = `https://www.ejemplo.com/reset/${token}`;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: recipientEmail,
            subject: "Recuperación de contraseña",
            html: `<p>Has solicitado restablecer tu contraseña. Haz clic <a href="${resetUrl}">aquí</a> para restablecer tu contraseña.</p>`,
        };
        try {
            const info = yield email_1.default.sendMail(mailOptions);
            console.log("Correo electrónico enviado:", info.response);
        }
        catch (error) {
            console.error("Error al enviar el correo electrónico:", error);
            throw error;
        }
    });
}
function generateResetToken(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const secret = process.env.SECRET;
        if (!secret) {
            throw new Error("Error: Configuración de secret no encontrada.");
        }
        const token = jsonwebtoken_1.default.sign({ userId }, secret, { expiresIn: "1h" });
        return { token };
    });
}
function decodedToken(token) {
    return __awaiter(this, void 0, void 0, function* () {
        const secret = process.env.SECRET;
        if (!secret) {
            throw new Error("Error: Configuración de secret no encontrada.");
        }
        try {
            const decodedToken = jsonwebtoken_1.default.verify(token, secret);
            const userId = decodedToken.userId;
            return { id: userId };
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                throw new Error("Error al decodificar el token: Token no válido");
            }
            else {
                throw new Error("Error al decodificar el token");
            }
        }
    });
}
function updatePassword(userId, newPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const connection = yield (0, mysql_1.default)();
            yield connection.query("UPDATE AUDITORIA_USUARIOS SET password = ? WHERE id = ?", [newPassword, userId]);
        }
        catch (error) {
            console.error("Error updating password:", error);
            throw new Error("Error updating password");
        }
    });
}
function registerLoginUser(id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const connection = yield (0, mysql_1.default)();
            const fecha = new Date();
            yield connection.query("INSERT INTO AUDITORIA_USUARIOS_LOGIN (id_usuario, fecha) VALUES (?, ?)", [id, fecha]);
        }
        catch (error) {
            console.error("Error al registrar el inicio de sesión:", error);
            throw new Error("Error al registrar el inicio de sesión");
        }
    });
}
exports.default = {
    findUserByCredentials,
    findUserByEmail,
    sendPasswordResetEmail,
    generateResetToken,
    decodedToken,
    updatePassword,
    registerLoginUser,
};
