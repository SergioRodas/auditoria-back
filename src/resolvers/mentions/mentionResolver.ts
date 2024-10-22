import {
    getDefaultStats,
    getDefaultTotalMentions,
} from "../../constants/mentions/statDefault";
import {
    ResponseTotalMentions,
    TopTopicsResult,
} from "../../interfaces/mentions/mentionInterface";
import mentionService from "../../services/mentions/mentionService";

const mentionResolver = {
    Query: {
        TotalMentionsCountResolver: async (
            _: any,
            { fecha, semanal }: { fecha: string, semanal?: boolean},
            _context: any
        ): Promise<ResponseTotalMentions> => {
            try {
                const fechaInicio = new Date(fecha);
                const data = await mentionService.getDataMentions(fechaInicio, semanal);
                const dataKeys = Object.keys(data);
                if (dataKeys.length === 0) {
                    return getDefaultTotalMentions();
                }
                const menciones = await mentionService.getMentionsByActor(data);

                const totalMentions = await mentionService.calculateTotalMentions(
                    menciones
                );

                return {
                    menciones: menciones,
                    totalMentions: totalMentions,
                };
            } catch (error) {
                throw new Error(`Error al ejecutar la consulta: ${error}`);
            }
        },

        GeneralTopTopicsResolve: async (
            _: any,
            { fecha, semanal }: { fecha: string, semanal?: boolean},
            _context: any
        ): Promise<TopTopicsResult> => {
            try {
                const fechaInicio = new Date(fecha);
                const data = await mentionService.getDataMentions(fechaInicio, semanal);
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
                } = await mentionService.processArrayOfActors(data);

                const [
                    claudiaSheinbaumStats,
                    xochitlGalvezStats,
                    jorgeAlvarezStats,
                ] = await Promise.all([
                    mentionService.processMentionsForTopics(
                        claudiaSheinbaumMentions
                    ),
                    mentionService.processMentionsForTopics(xochitlGalvezMentions),
                    mentionService.processMentionsForTopics(jorgeAlvarezMentions),
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
    },
};

export default mentionResolver;
