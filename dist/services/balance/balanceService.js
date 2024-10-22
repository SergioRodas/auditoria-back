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
exports.createOrUpdateBalance = createOrUpdateBalance;
exports.deleteBalance = deleteBalance;
exports.getBalanceByFecha = getBalanceByFecha;
const mysql_1 = __importDefault(require("../../config/mysql"));
function createOrUpdateBalance(balance, fecha) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!balance || !fecha) {
                throw new Error("Balance y fecha son obligatorios.");
            }
            const connection = yield (0, mysql_1.default)();
            const [rows] = yield connection.execute("SELECT * FROM AUDITORIA_BALANCES WHERE fecha = ?", [fecha]);
            if (rows.length > 0) {
                yield connection.execute("UPDATE AUDITORIA_BALANCES SET balance = ? WHERE fecha = ?", [balance, fecha]);
                return "Balance actualizado con éxito";
            }
            else {
                yield connection.execute("INSERT INTO AUDITORIA_BALANCES (balance, fecha) VALUES (?, ?)", [balance, fecha]);
                return "Balance creado con éxito";
            }
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error al crear o actualizar el balance: ${error.message}`);
            }
            else {
                throw new Error("Error desconocido al crear o actualizar el balance.");
            }
        }
    });
}
function deleteBalance(fecha) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const connection = yield (0, mysql_1.default)();
            const [result] = yield connection.execute("DELETE FROM AUDITORIA_BALANCES WHERE fecha = ?", [fecha]);
            if (result.affectedRows === 0) {
                return `No se encontró ningún balance para la fecha ${fecha}`;
            }
            return "Balance eliminado con éxito";
        }
        catch (error) {
            throw new Error("Ocurrió un error al eliminar el balance");
        }
    });
}
function getBalanceByFecha(fecha) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const connection = yield (0, mysql_1.default)();
            const [rows] = yield connection.execute("SELECT balance , fecha FROM AUDITORIA_BALANCES WHERE fecha = ?", [fecha]);
            if (rows.length === 0) {
                return [];
            }
            const fechaDate = new Date(rows[0].fecha);
            const formattedFecha = fechaDate.toLocaleDateString();
            return { balance: rows[0].balance, fecha: formattedFecha };
        }
        catch (error) {
            throw new Error("Ocurrió un error al obtener el balance por fecha");
        }
    });
}
