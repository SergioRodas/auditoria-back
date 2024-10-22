import mentionService from "../../services/mentions/mentionService";

import { MediumResult } from "../../interfaces/medium/mediumInterface";
import {
    groupMentionsByMedia,
    processArrayOfActorsMedium,
    processArrayOfActorsMediumTrend,
    processItemMedium,
    processMentionsByMedia,
    processMentionsForMedium,
} from "../../services/medium/mediumService";
import { getDefaultStats } from "../../constants/medium/medium";

const mediumResolver = {
    Query: {
        MediumMayorRelevanceResolver: async (
            _: any,
            {
                fecha,
                medium,
                semanal,
            }: { fecha: string; medium: string; semanal?: boolean },
            _context: any
        ): Promise<MediumResult> => {
            try {
                if (
                    medium !== "Periódicos" &&
                    medium !== "Radio" &&
                    medium !== "Televisión"
                ) {
                    throw new Error(
                        "El valor de 'medium' debe ser 'Periódicos', 'Radio' o 'Televisión'."
                    );
                }
                const fechaInicio = new Date(fecha);
                const data = await mentionService.getDataMentions(
                    fechaInicio,
                    semanal
                );
                const dataKeys = Object.keys(data);
                if (dataKeys.length === 0) {
                    return {
                        claudiaSheinbaum: getDefaultStats(),
                        xochitlGalvez: getDefaultStats(),
                        jorgeAlvarez: getDefaultStats(),
                    };
                }

                const {
                    claudiaSheinbaumMentions,
                    xochitlGalvezMentions,
                    jorgeAlvarezMentions,
                } = await processArrayOfActorsMedium(data, medium);

                const [
                    claudiaSheinbaumStats,
                    xochitlGalvezStats,
                    jorgeAlvarezStats,
                ] = await Promise.all([
                    processMentionsForMedium(claudiaSheinbaumMentions, medium),
                    processMentionsForMedium(xochitlGalvezMentions, medium),
                    processMentionsForMedium(jorgeAlvarezMentions, medium),
                ]);
                return {
                    claudiaSheinbaum: claudiaSheinbaumStats,
                    xochitlGalvez: xochitlGalvezStats,
                    jorgeAlvarez: jorgeAlvarezStats,
                };
            } catch (error) {
                throw new Error(`Error al ejecutar la consulta: ${error}`);
            }
        },

        MediumTrendResolver: async (
            _: any,
            {
                fecha,
                trend,
                semanal,
            }: { fecha: string; trend: string; semanal?: boolean },
            _context: any
        ): Promise<any> => {
            try {
                if (trend !== "Positiva" && trend !== "Negativa") {
                    throw new Error(
                        "El valor de 'medium' debe ser 'Positiva','Negativa'."
                    );
                }
                const fechaInicio = new Date(fecha);
                const data = await mentionService.getDataMentions(
                    fechaInicio,
                    semanal
                );

                const dataKeys = Object.keys(data);

                if (dataKeys.length === 0) {
                    return {
                        claudiaSheinbaum: getDefaultStats(),
                        xochitlGalvez: getDefaultStats(),
                        jorgeAlvarez: getDefaultStats(),
                    };
                }

                const actorsData = await processArrayOfActorsMediumTrend(
                    data,
                    trend
                );

                const claudiaSheinbaumGroups = processMentionsByMedia(
                    processItemMedium(
                        groupMentionsByMedia(actorsData.claudiaSheinbaumMentions)
                    )
                );
                const xochitlGalvezGroups = processMentionsByMedia(
                    processItemMedium(
                        groupMentionsByMedia(actorsData.xochitlGalvezMentions)
                    )
                );
                const jorgeAlvarezGroups = processMentionsByMedia(
                    processItemMedium(
                        groupMentionsByMedia(actorsData.jorgeAlvarezMentions)
                    )
                );

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
            } catch (error) {
                throw new Error(`Error al ejecutar la consulta: ${error}`);
            }
        },
    },
};

export default mediumResolver;
