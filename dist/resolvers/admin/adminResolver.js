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
const balanceService_1 = require("../../services/balance/balanceService");
const excelService_1 = require("../../services/excel/excelService");
const mentionService_1 = __importDefault(require("../../services/mentions/mentionService"));
const negativeMentionService_1 = __importDefault(require("../../services/negativeMention/negativeMentionService"));
const adminResolver = {
    Query: {
        getNegativeMentionsForAdmin: (_1, _a, _context_1) => __awaiter(void 0, [_1, _a, _context_1], void 0, function* (_, { fecha, tipoMedio, semanal }, _context) {
            try {
                const negativeMention = yield negativeMentionService_1.default.getNegativeMentionAdmin(fecha, tipoMedio, semanal);
                return negativeMention || [];
            }
            catch (error) {
                throw new Error(`Error al ejecutar la consulta: ${error.message}`);
            }
        }),
        getDataForTable: (_1, _a, _context_1) => __awaiter(void 0, [_1, _a, _context_1], void 0, function* (_, { fecha, semanal }, _context) {
            try {
                const data = yield mentionService_1.default.getDataForTable(fecha, semanal);
                return data || [];
            }
            catch (error) {
                throw new Error(`Error al ejecutar la consulta: ${error.message}`);
            }
        }),
        getBalanceByFecha: (_1, _a, _context_1) => __awaiter(void 0, [_1, _a, _context_1], void 0, function* (_, { fecha }, _context) {
            try {
                const balance = yield (0, balanceService_1.getBalanceByFecha)(fecha);
                return balance;
            }
            catch (error) {
                console.error("Error al procesar la solicitud:", error);
                throw new Error("Ocurrió un error al procesar la solicitud");
            }
        }),
    },
    Mutation: {
        createOrUpdateMentionNegative: (_1, _a, _context_1) => __awaiter(void 0, [_1, _a, _context_1], void 0, function* (_, { id, capsula, tipoMedio, cadena, programa, autor, mencion, fecha, }, _context) {
            try {
                const currentUser = _context.user;
                const resultMessage = yield negativeMentionService_1.default.createOrUpdateMentionNegative({
                    id,
                    capsula,
                    tipoMedio,
                    cadena,
                    programa,
                    autor,
                    mencion,
                    fecha,
                }, currentUser);
                return resultMessage;
            }
            catch (error) {
                throw new Error("Ocurrió un error al procesar la solicitud.");
            }
        }),
        deleteMentionNegative: (_1, _a, _context_1) => __awaiter(void 0, [_1, _a, _context_1], void 0, function* (_, { id }, _context) {
            try {
                const resultMessage = yield negativeMentionService_1.default.deleteMentionNegative(id);
                return resultMessage;
            }
            catch (error) {
                throw new Error("Ocurrió un error al procesar la solicitud.");
            }
        }),
        generateExcel: (_1, _a, _context_1) => __awaiter(void 0, [_1, _a, _context_1], void 0, function* (_, { fecha, semanal }, _context) {
            try {
                if (!fecha) {
                    throw new Error("Fecha no proporcionada.");
                }
                const data = yield mentionService_1.default.getDataForTable(fecha, semanal);
                if (data && data.length > 0) {
                    const filePath = yield (0, excelService_1.generateExcelForSubtopics)(data);
                    return filePath;
                }
                else {
                    throw new Error("No se encontraron datos para generar el Excel.");
                }
            }
            catch (error) {
                throw new Error(`Error generando el archivo Excel: ${error}`);
            }
        }),
        createOrUpdateBalance: (_1, _a, _context_1) => __awaiter(void 0, [_1, _a, _context_1], void 0, function* (_, { balance, fecha }, _context) {
            try {
                const result = yield (0, balanceService_1.createOrUpdateBalance)(balance, fecha);
                return result;
            }
            catch (error) {
                throw new Error("Ocurrió un error al procesar la solicitud.");
            }
        }),
        deleteBalance: (_1, _a, _context_1) => __awaiter(void 0, [_1, _a, _context_1], void 0, function* (_, { fecha }, _context) {
            try {
                const result = yield (0, balanceService_1.deleteBalance)(fecha);
                return result;
            }
            catch (error) {
                throw new Error("Ocurrió un error al procesar la solicitud.");
            }
        }),
        deleteMention: (_1, _a, _context_1) => __awaiter(void 0, [_1, _a, _context_1], void 0, function* (_, { id }, _context) {
            try {
                const resultMessage = yield mentionService_1.default.deleteMention(id);
                return resultMessage;
            }
            catch (error) {
                throw new Error("Ocurrió un error al procesar la solicitud.");
            }
        }),
    },
};
exports.default = adminResolver;
