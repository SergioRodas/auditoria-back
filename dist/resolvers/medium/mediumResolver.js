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
const mentionService_1 = __importDefault(require("../../services/mentions/mentionService"));
const mediumService_1 = require("../../services/medium/mediumService");
const medium_1 = require("../../constants/medium/medium");
const mediumResolver = {
    Query: {
        MediumMayorRelevanceResolver: (_1, _a, _context_1) => __awaiter(void 0, [_1, _a, _context_1], void 0, function* (_, { fecha, medium, semanal, }, _context) {
            try {
                if (medium !== "Periódicos" &&
                    medium !== "Radio" &&
                    medium !== "Televisión") {
                    throw new Error("El valor de 'medium' debe ser 'Periódicos', 'Radio' o 'Televisión'.");
                }
                const fechaInicio = new Date(fecha);
                const data = yield mentionService_1.default.getDataMentions(fechaInicio, semanal);
                const dataKeys = Object.keys(data);
                if (dataKeys.length === 0) {
                    return {
                        claudiaSheinbaum: (0, medium_1.getDefaultStats)(),
                        xochitlGalvez: (0, medium_1.getDefaultStats)(),
                        jorgeAlvarez: (0, medium_1.getDefaultStats)(),
                    };
                }
                const { claudiaSheinbaumMentions, xochitlGalvezMentions, jorgeAlvarezMentions, } = yield (0, mediumService_1.processArrayOfActorsMedium)(data, medium);
                const [claudiaSheinbaumStats, xochitlGalvezStats, jorgeAlvarezStats,] = yield Promise.all([
                    (0, mediumService_1.processMentionsForMedium)(claudiaSheinbaumMentions, medium),
                    (0, mediumService_1.processMentionsForMedium)(xochitlGalvezMentions, medium),
                    (0, mediumService_1.processMentionsForMedium)(jorgeAlvarezMentions, medium),
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
        MediumTrendResolver: (_1, _a, _context_1) => __awaiter(void 0, [_1, _a, _context_1], void 0, function* (_, { fecha, trend, semanal, }, _context) {
            try {
                if (trend !== "Positiva" && trend !== "Negativa") {
                    throw new Error("El valor de 'medium' debe ser 'Positiva','Negativa'.");
                }
                const fechaInicio = new Date(fecha);
                const data = yield mentionService_1.default.getDataMentions(fechaInicio, semanal);
                const dataKeys = Object.keys(data);
                if (dataKeys.length === 0) {
                    return {
                        claudiaSheinbaum: (0, medium_1.getDefaultStats)(),
                        xochitlGalvez: (0, medium_1.getDefaultStats)(),
                        jorgeAlvarez: (0, medium_1.getDefaultStats)(),
                    };
                }
                const actorsData = yield (0, mediumService_1.processArrayOfActorsMediumTrend)(data, trend);
                const claudiaSheinbaumGroups = (0, mediumService_1.processMentionsByMedia)((0, mediumService_1.processItemMedium)((0, mediumService_1.groupMentionsByMedia)(actorsData.claudiaSheinbaumMentions)));
                const xochitlGalvezGroups = (0, mediumService_1.processMentionsByMedia)((0, mediumService_1.processItemMedium)((0, mediumService_1.groupMentionsByMedia)(actorsData.xochitlGalvezMentions)));
                const jorgeAlvarezGroups = (0, mediumService_1.processMentionsByMedia)((0, mediumService_1.processItemMedium)((0, mediumService_1.groupMentionsByMedia)(actorsData.jorgeAlvarezMentions)));
                return {
                    claudiaSheinbaum: {
                        radio: claudiaSheinbaumGroups.radioGroups,
                        television: claudiaSheinbaumGroups.televisionGroups,
                        periodico: claudiaSheinbaumGroups.periodicosGroups,
                    },
                    xochitlGalvez: {
                        radio: xochitlGalvezGroups.radioGroups,
                        television: xochitlGalvezGroups.televisionGroups,
                        periodico: xochitlGalvezGroups.periodicosGroups,
                    },
                    jorgeAlvarez: {
                        radio: jorgeAlvarezGroups.radioGroups,
                        television: jorgeAlvarezGroups.televisionGroups,
                        periodico: jorgeAlvarezGroups.periodicosGroups,
                    },
                };
            }
            catch (error) {
                throw new Error(`Error al ejecutar la consulta: ${error}`);
            }
        }),
    },
};
exports.default = mediumResolver;
