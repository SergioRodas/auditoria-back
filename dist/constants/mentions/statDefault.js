"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultStats = getDefaultStats;
exports.getDefaultTotalMentions = getDefaultTotalMentions;
function getDefaultStats() {
    return {
        mentions: [],
        totalPositivas: 0,
        totalNeutras: 0,
        totalNegativas: 0,
        totalTendencies: 0,
    };
}
function getDefaultTotalMentions() {
    return {
        menciones: [],
        totalMentions: {
            TotalRadio: 0,
            TotalTelevision: 0,
            TotalPeriodico: 0,
            TotalMedios: 0,
        },
    };
}
