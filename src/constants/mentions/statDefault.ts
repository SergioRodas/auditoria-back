import {
    TopicStats,
    ResponseTotalMentions,
} from "../../interfaces/mentions/mentionInterface";

export function getDefaultStats(): TopicStats {
    return {
        mentions: [],
        totalPositivas: 0,
        totalNeutras: 0,
        totalNegativas: 0,
        totalTendencies: 0,
    };
}

export function getDefaultTotalMentions(): ResponseTotalMentions {
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
