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
const mysql_1 = __importDefault(require("../config/mysql"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function findUserByCredentials(alias, password) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const connection = yield (0, mysql_1.default)();
            const [rows] = yield connection.query("SELECT * FROM AUDITORIA_USUARIO WHERE alias = ? AND password = ?", [alias, password]);
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
    const user = {
        id: row.id || 0,
        alias: row.alias || "",
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
exports.default = {
    findUserByCredentials,
};
