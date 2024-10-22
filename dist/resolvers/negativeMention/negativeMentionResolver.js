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
const negativeMentionService_1 = __importDefault(require("../../services/negativeMention/negativeMentionService"));
const negativeMentionResolver = {
    Query: {
        getNegativeMentionsforColumnsResolver: (_1, _a, _context_1) => __awaiter(void 0, [_1, _a, _context_1], void 0, function* (_, { fecha, semanal }, _context) {
            try {
                const rows = yield negativeMentionService_1.default.getNegativeMentionsforColumns(fecha, semanal);
                const negativeMention = yield negativeMentionService_1.default.processNegativeMentionsforColumns(rows);
                return negativeMention;
            }
            catch (error) {
                throw new Error(`Error al ejecutar la consulta: ${error.message}`);
            }
        }),
        getNegativeMentionsforRadioOrTelevision: (_1, _a, _context_1) => __awaiter(void 0, [_1, _a, _context_1], void 0, function* (_, { fecha, tipoMedio, semanal }, _context) {
            try {
                const negativeMention = yield negativeMentionService_1.default.getNegativeMentionsForRadioOrTelevision(fecha, tipoMedio, semanal);
                return negativeMention || [];
            }
            catch (error) {
                throw new Error(`Error al ejecutar la consulta: ${error.message}`);
            }
        }),
    },
};
exports.default = negativeMentionResolver;
