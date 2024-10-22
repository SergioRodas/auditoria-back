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
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 7696,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};
function dbConnection() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const pool = yield promise_1.default.createPool(dbConfig);
            const connection = yield pool.getConnection();
            return connection;
        }
        catch (error) {
            if (isProtocolConnectionLostError(error)) {
                console.error("Error al conectar a la base de datos:", error);
                console.log("Reintentando conexión en 2 segundos...");
                yield new Promise((resolve) => setTimeout(resolve, 2000));
                return dbConnection();
            }
            else {
                throw error;
            }
        }
    });
}
function isProtocolConnectionLostError(error) {
    return (error &&
        typeof error === "object" &&
        error.code === "PROTOCOL_CONNECTION_LOST");
}
exports.default = dbConnection;
