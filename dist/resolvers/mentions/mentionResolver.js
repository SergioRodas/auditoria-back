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
const statDefault_1 = require("../../constants/mentions/statDefault");
const mentionService_1 = __importDefault(require("../../services/mentions/mentionService"));
const mentionResolver = {
    Query: {
        TotalMentionsCountResolver: (_1, _a, _context_1) => __awaiter(void 0, [_1, _a, _context_1], void 0, function* (_, { fecha, semanal }, _context) {
            try {
                const fechaInicio = new Date(fecha);
                const data = yield mentionService_1.default.getDataMentions(fechaInicio, semanal);
                const dataKeys = Object.keys(data);
                if (dataKeys.length === 0) {
                    return (0, statDefault_1.getDefaultTotalMentions)();
                }
                const menciones = yield mentionService_1.default.getMentionsByActor(data);
                const totalMentions = yield mentionService_1.default.calculateTotalMentions(menciones);
                return {
                    menciones: menciones,
                    totalMentions: totalMentions,
                };
            }
            catch (error) {
                throw new Error(`Error al ejecutar la consulta: ${error}`);
            }
        }),
        GeneralTopTopicsResolve: (_1, _a, _context_1) => __awaiter(void 0, [_1, _a, _context_1], void 0, function* (_, { fecha, semanal }, _context) {
            try {
                const fechaInicio = new Date(fecha);
                const data = yield mentionService_1.default.getDataMentions(fechaInicio, semanal);
                const dataKeys = Object.keys(data);
                if (dataKeys.length === 0) {
                    return {
                        claudiaSheinbaum: (0, statDefault_1.getDefaultStats)(),
                        xochitlGalvez: (0, statDefault_1.getDefaultStats)(),
                        jorgeAlvarez: (0, statDefault_1.getDefaultStats)(),
                    };
                }
                const { claudiaSheinbaumMentions, xochitlGalvezMentions, jorgeAlvarezMentions, } = yield mentionService_1.default.processArrayOfActors(data);
                const [claudiaSheinbaumStats, xochitlGalvezStats, jorgeAlvarezStats,] = yield Promise.all([
                    mentionService_1.default.processMentionsForTopics(claudiaSheinbaumMentions),
                    mentionService_1.default.processMentionsForTopics(xochitlGalvezMentions),
                    mentionService_1.default.processMentionsForTopics(jorgeAlvarezMentions),
                ]);
                return {
                    claudiaSheinbaum: claudiaSheinbaumStats,
                    xochitlGalvez: xochitlGalvezStats,
                    jorgeAlvarez: jorgeAlvarezStats,
                };
            }
            catch (error) {
                throw new Error(`Error al ejecutar la consulta: ${error}`);
            }
        }),
    },
};
exports.default = mentionResolver;
